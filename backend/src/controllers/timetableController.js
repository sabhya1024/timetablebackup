// src/controllers/timetableController.js
const { pool, withTransaction } = require('../db/pool');
const { generateTimetable } = require('../services/timetableGenerator');
const { AppError } = require('../utils/errors');

// ── GET /api/timetable  (with optional filters) ──────────────
const getTimetable = async (req, res, next) => {
  try {
    const { section_id, teacher_id, day, date } = req.query;

    let query = `SELECT * FROM v_timetable_full WHERE 1=1`;
    const params = [];
    let pi = 1;

    if (section_id) { query += ` AND section_id = $${pi++}`; params.push(section_id); }
    if (teacher_id) { query += ` AND teacher_id = $${pi++}`; params.push(teacher_id); }
    if (day)        { query += ` AND day = $${pi++}`;         params.push(day); }

    query += ' ORDER BY day, start_time';

    const { rows } = await pool.query(query, params);

    // If a specific date is given, overlay absence info
    if (date) {
      const { rows: absences } = await pool.query(
        `SELECT a.*, t.name AS sub_name
         FROM teacher_absences a
         LEFT JOIN teachers t ON t.teacher_id = a.substitute_id
         WHERE a.absence_date = $1`,
        [date]
      );

      const absenceMap = {};
      absences.forEach((a) => {
        absenceMap[`${a.teacher_id}_${a.timetable_entry}`] = a;
      });

      const enriched = rows.map((row) => {
        const key = `${row.teacher_id}_${row.entry_id}`;
        const absence = absenceMap[key];
        if (absence) {
          return {
            ...row,
            is_cancelled: absence.status === 'cancelled',
            substitute_teacher: absence.status === 'substitute' ? absence.sub_name : null,
            absence_status: absence.status,
          };
        }
        return row;
      });

      return res.json({ success: true, data: enriched });
    }

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ── POST /api/timetable  (admin manual create) ───────────────
const createEntry = async (req, res, next) => {
  try {
    const { day, start_time, end_time, teacher_id, subject_id, room_id, section_id } = req.body;

    // Conflict check
    const conflict = await pool.query(
      `SELECT entry_id FROM timetable
       WHERE day = $1 AND start_time = $2
         AND (teacher_id = $3 OR room_id = $4 OR section_id = $5)
       LIMIT 1`,
      [day, start_time, teacher_id, room_id, section_id]
    );
    if (conflict.rows.length) throw new AppError('Scheduling conflict detected', 409);

    const { rows } = await pool.query(
      `INSERT INTO timetable (day, start_time, end_time, teacher_id, subject_id, room_id, section_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [day, start_time, end_time, teacher_id, subject_id, room_id, section_id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// ── PUT /api/timetable/:id ──────────────────────────────────
const updateEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { day, start_time, end_time, teacher_id, subject_id, room_id, section_id } = req.body;

    // Conflict check (excluding self)
    const conflict = await pool.query(
      `SELECT entry_id FROM timetable
       WHERE day = $1 AND start_time = $2
         AND (teacher_id = $3 OR room_id = $4 OR section_id = $5)
         AND entry_id != $6
       LIMIT 1`,
      [day, start_time, teacher_id, room_id, section_id, id]
    );
    if (conflict.rows.length) throw new AppError('Scheduling conflict detected', 409);

    const { rows } = await pool.query(
      `UPDATE timetable SET day=$1, start_time=$2, end_time=$3,
         teacher_id=$4, subject_id=$5, room_id=$6, section_id=$7
       WHERE entry_id=$8 RETURNING *`,
      [day, start_time, end_time, teacher_id, subject_id, room_id, section_id, id]
    );
    if (!rows.length) throw new AppError('Entry not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// ── DELETE /api/timetable/:id ────────────────────────────────
const deleteEntry = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM timetable WHERE entry_id=$1 RETURNING entry_id',
      [req.params.id]
    );
    if (!rows.length) throw new AppError('Entry not found', 404);
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) { next(err); }
};

// ── POST /api/timetable/generate  (admin trigger) ────────────
const triggerGenerate = async (req, res, next) => {
  try {
    const { clearExisting = true } = req.body;
    const result = await generateTimetable(req.user?.id, clearExisting);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// ── GET /api/timetable/logs ──────────────────────────────────
const getGenerationLogs = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT gl.*, a.username AS generated_by_username
       FROM generation_logs gl
       LEFT JOIN admins a ON a.admin_id = gl.generated_by
       ORDER BY generated_at DESC LIMIT 20`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ── GET /api/timetable/conflicts ─────────────────────────────
const getConflictLogs = async (req, res, next) => {
  try {
    const { log_id } = req.query;
    let q = 'SELECT * FROM conflict_logs';
    const p = [];
    if (log_id) { q += ' WHERE log_id=$1'; p.push(log_id); }
    q += ' ORDER BY logged_at DESC LIMIT 100';
    const { rows } = await pool.query(q, p);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = {
  getTimetable, createEntry, updateEntry, deleteEntry,
  triggerGenerate, getGenerationLogs, getConflictLogs,
};
