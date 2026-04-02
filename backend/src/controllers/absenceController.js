// src/controllers/absenceController.js
const { pool } = require('../db/pool');
const { AppError } = require('../utils/errors');

// POST /api/absences  – teacher marks themselves absent
const markAbsence = async (req, res, next) => {
  try {
    const teacherId = req.user.id; // from JWT
    const { absence_date, timetable_entries, status = 'absent', substitute_id, note } = req.body;
    // timetable_entries: array of entry_ids (slots they're absent for that day)

    if (!absence_date) throw new AppError('absence_date is required', 400);

    const inserted = [];
    for (const entryId of (timetable_entries || [null])) {
      // Verify entry belongs to this teacher if entryId provided
      if (entryId) {
        const { rows } = await pool.query(
          'SELECT entry_id FROM timetable WHERE entry_id=$1 AND teacher_id=$2',
          [entryId, teacherId]
        );
        if (!rows.length) throw new AppError(`Entry ${entryId} not found for your account`, 404);
      }

      // Validate substitute if given
      if (status === 'substitute' && substitute_id) {
        const { rows: sub } = await pool.query(
          'SELECT teacher_id FROM teachers WHERE teacher_id=$1',
          [substitute_id]
        );
        if (!sub.length) throw new AppError('Substitute teacher not found', 404);

        // Check substitute not already busy in that slot
        if (entryId) {
          const { rows: slotInfo } = await pool.query(
            'SELECT day, start_time FROM timetable WHERE entry_id=$1', [entryId]
          );
          if (slotInfo.length) {
            const { day, start_time } = slotInfo[0];
            const { rows: conflict } = await pool.query(
              `SELECT entry_id FROM timetable
               WHERE day=$1 AND start_time=$2 AND teacher_id=$3`,
              [day, start_time, substitute_id]
            );
            if (conflict.length) throw new AppError('Substitute teacher has a conflict in this slot', 409);
          }
        }
      }

      const { rows } = await pool.query(
        `INSERT INTO teacher_absences
           (teacher_id, absence_date, status, substitute_id, timetable_entry, note)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (teacher_id, absence_date, timetable_entry)
         DO UPDATE SET status=$3, substitute_id=$4, note=$6
         RETURNING *`,
        [teacherId, absence_date, status, substitute_id || null, entryId || null, note || null]
      );
      inserted.push(rows[0]);
    }

    res.status(201).json({ success: true, data: inserted });
  } catch (err) { next(err); }
};

// GET /api/absences?teacher_id=&date=&from=&to=
const getAbsences = async (req, res, next) => {
  try {
    const { teacher_id, date, from, to } = req.query;
    // Teachers can only see their own; admin sees all
    const effectiveTeacherId = req.user.role === 'teacher' ? req.user.id : teacher_id;

    let q = `
      SELECT ta.*, t.name AS teacher_name, s.name AS substitute_name,
             tt.day, tt.start_time, tt.end_time, sub.subject_name
      FROM teacher_absences ta
      JOIN teachers t ON t.teacher_id = ta.teacher_id
      LEFT JOIN teachers s ON s.teacher_id = ta.substitute_id
      LEFT JOIN timetable tt ON tt.entry_id = ta.timetable_entry
      LEFT JOIN subjects sub ON sub.subject_id = tt.subject_id
      WHERE 1=1
    `;
    const p = [];
    let pi = 1;

    if (effectiveTeacherId) { q += ` AND ta.teacher_id=$${pi++}`; p.push(effectiveTeacherId); }
    if (date)               { q += ` AND ta.absence_date=$${pi++}`; p.push(date); }
    if (from)               { q += ` AND ta.absence_date>=$${pi++}`; p.push(from); }
    if (to)                 { q += ` AND ta.absence_date<=$${pi++}`; p.push(to); }

    q += ' ORDER BY ta.absence_date DESC, tt.start_time';

    const { rows } = await pool.query(q, p);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// DELETE /api/absences/:id  (cancel an absence record)
const cancelAbsence = async (req, res, next) => {
  try {
    const teacherId = req.user.role === 'teacher' ? req.user.id : null;
    let q = 'DELETE FROM teacher_absences WHERE absence_id=$1';
    const p = [req.params.id];
    if (teacherId) { q += ' AND teacher_id=$2'; p.push(teacherId); }
    q += ' RETURNING absence_id';
    const { rows } = await pool.query(q, p);
    if (!rows.length) throw new AppError('Absence record not found', 404);
    res.json({ success: true, message: 'Absence cancelled' });
  } catch (err) { next(err); }
};

// GET /api/absences/available-substitutes?entry_id=&date=
const getAvailableSubstitutes = async (req, res, next) => {
  try {
    const { entry_id, date } = req.query;
    if (!entry_id || !date) throw new AppError('entry_id and date required', 400);

    const { rows: slot } = await pool.query(
      'SELECT day, start_time FROM timetable WHERE entry_id=$1', [entry_id]
    );
    if (!slot.length) throw new AppError('Entry not found', 404);
    const { day, start_time } = slot[0];

    // Teachers NOT busy in this slot and NOT already absent
    const { rows } = await pool.query(
      `SELECT t.teacher_id, t.name, t.dept_name, t.designation
       FROM teachers t
       WHERE t.teacher_id NOT IN (
         SELECT teacher_id FROM timetable WHERE day=$1 AND start_time=$2
       )
       AND t.teacher_id NOT IN (
         SELECT teacher_id FROM teacher_absences WHERE absence_date=$3
       )
       ORDER BY t.name`,
      [day, start_time, date]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { markAbsence, getAbsences, cancelAbsence, getAvailableSubstitutes };
