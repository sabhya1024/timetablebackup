// src/controllers/adminController.js
const bcrypt = require('bcryptjs');
const { pool } = require('../db/pool');
const { AppError } = require('../utils/errors');

// ── TEACHERS ─────────────────────────────────────────────────
const getTeachers = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM teachers ORDER BY dept_name, name'
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const createTeacher = async (req, res, next) => {
  try {
    const { name, specialization, dept_name, designation, username, password } = req.body;
    if (!name || !dept_name) throw new AppError('name and dept_name required', 400);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'INSERT INTO teachers (name, specialization, dept_name, designation) VALUES ($1,$2,$3,$4) RETURNING *',
        [name, specialization, dept_name, designation]
      );
      const teacher = rows[0];

      if (username && password) {
        const hash = await bcrypt.hash(password, 12);
        await client.query(
          'INSERT INTO teacher_auth (teacher_id, username, password_hash) VALUES ($1,$2,$3)',
          [teacher.teacher_id, username, hash]
        );
      }
      await client.query('COMMIT');
      res.status(201).json({ success: true, data: teacher });
    } catch (e) {
      await client.query('ROLLBACK');
      if (e.code === '23505') throw new AppError('Username already taken', 409);
      throw e;
    } finally { client.release(); }
  } catch (err) { next(err); }
};

const updateTeacher = async (req, res, next) => {
  try {
    const { name, specialization, dept_name, designation } = req.body;
    const { rows } = await pool.query(
      `UPDATE teachers SET name=COALESCE($1,name), specialization=COALESCE($2,specialization),
         dept_name=COALESCE($3,dept_name), designation=COALESCE($4,designation)
       WHERE teacher_id=$5 RETURNING *`,
      [name, specialization, dept_name, designation, req.params.id]
    );
    if (!rows.length) throw new AppError('Teacher not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM teachers WHERE teacher_id=$1 RETURNING teacher_id', [req.params.id]
    );
    if (!rows.length) throw new AppError('Teacher not found', 404);
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) { next(err); }
};

// ── SUBJECTS ─────────────────────────────────────────────────
const getSubjects = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subjects ORDER BY subject_name');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const createSubject = async (req, res, next) => {
  try {
    const { subject_name, credits, weekly_hours } = req.body;
    if (!subject_name || !credits || !weekly_hours) throw new AppError('All fields required', 400);
    const { rows } = await pool.query(
      'INSERT INTO subjects (subject_name, credits, weekly_hours) VALUES ($1,$2,$3) RETURNING *',
      [subject_name, credits, weekly_hours]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const updateSubject = async (req, res, next) => {
  try {
    const { subject_name, credits, weekly_hours } = req.body;
    const { rows } = await pool.query(
      `UPDATE subjects SET subject_name=COALESCE($1,subject_name),
         credits=COALESCE($2,credits), weekly_hours=COALESCE($3,weekly_hours)
       WHERE subject_id=$4 RETURNING *`,
      [subject_name, credits, weekly_hours, req.params.id]
    );
    if (!rows.length) throw new AppError('Subject not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM subjects WHERE subject_id=$1 RETURNING subject_id', [req.params.id]
    );
    if (!rows.length) throw new AppError('Subject not found', 404);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) { next(err); }
};

// ── ROOMS ────────────────────────────────────────────────────
const getRooms = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const createRoom = async (req, res, next) => {
  try {
    const { room_number, capacity, type } = req.body;
    if (!room_number || !type) throw new AppError('room_number and type required', 400);
    const { rows } = await pool.query(
      'INSERT INTO rooms (room_number, capacity, type) VALUES ($1,$2,$3) RETURNING *',
      [room_number, capacity, type]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return next(new AppError('Room number already exists', 409));
    next(err);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { room_number, capacity, type } = req.body;
    const { rows } = await pool.query(
      `UPDATE rooms SET room_number=COALESCE($1,room_number),
         capacity=COALESCE($2,capacity), type=COALESCE($3,type)
       WHERE room_id=$4 RETURNING *`,
      [room_number, capacity, type, req.params.id]
    );
    if (!rows.length) throw new AppError('Room not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const deleteRoom = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM rooms WHERE room_id=$1 RETURNING room_id', [req.params.id]
    );
    if (!rows.length) throw new AppError('Room not found', 404);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) { next(err); }
};

// ── SECTIONS ─────────────────────────────────────────────────
const getSections = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sections ORDER BY year, branch, section_name');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const createSection = async (req, res, next) => {
  try {
    const { year, branch, section_name, lunch_type } = req.body;
    if (!branch || !section_name || !lunch_type) throw new AppError('branch, section_name, lunch_type required', 400);
    const { rows } = await pool.query(
      'INSERT INTO sections (year, branch, section_name, lunch_type) VALUES ($1,$2,$3,$4) RETURNING *',
      [year, branch, section_name, lunch_type]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const updateSection = async (req, res, next) => {
  try {
    const { year, branch, section_name, lunch_type } = req.body;
    const { rows } = await pool.query(
      `UPDATE sections SET year=COALESCE($1,year), branch=COALESCE($2,branch),
         section_name=COALESCE($3,section_name), lunch_type=COALESCE($4,lunch_type)
       WHERE section_id=$5 RETURNING *`,
      [year, branch, section_name, lunch_type, req.params.id]
    );
    if (!rows.length) throw new AppError('Section not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const deleteSection = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM sections WHERE section_id=$1 RETURNING section_id', [req.params.id]
    );
    if (!rows.length) throw new AppError('Section not found', 404);
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) { next(err); }
};

// ── CURRICULUM (section_subjects) ───────────────────────────
const getCurriculum = async (req, res, next) => {
  try {
    const { section_id } = req.query;
    let q = `
      SELECT ss.*, s.subject_name, s.weekly_hours, s.credits,
             t.name AS teacher_name, sec.section_name
      FROM section_subjects ss
      JOIN subjects s ON s.subject_id = ss.subject_id
      LEFT JOIN teachers t ON t.teacher_id = ss.teacher_id
      JOIN sections sec ON sec.section_id = ss.section_id
    `;
    const p = [];
    if (section_id) { q += ' WHERE ss.section_id=$1'; p.push(section_id); }
    q += ' ORDER BY sec.section_name, s.subject_name';
    const { rows } = await pool.query(q, p);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const assignCurriculum = async (req, res, next) => {
  try {
    const { section_id, subject_id, teacher_id } = req.body;
    if (!section_id || !subject_id) throw new AppError('section_id and subject_id required', 400);
    const { rows } = await pool.query(
      `INSERT INTO section_subjects (section_id, subject_id, teacher_id)
       VALUES ($1,$2,$3)
       ON CONFLICT (section_id, subject_id)
       DO UPDATE SET teacher_id=$3
       RETURNING *`,
      [section_id, subject_id, teacher_id || null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const removeCurriculum = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM section_subjects WHERE id=$1 RETURNING id', [req.params.id]
    );
    if (!rows.length) throw new AppError('Curriculum entry not found', 404);
    res.json({ success: true, message: 'Removed' });
  } catch (err) { next(err); }
};

// ── STATS for dashboard ──────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [t, s, r, sec, tt] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM teachers'),
      pool.query('SELECT COUNT(*) FROM subjects'),
      pool.query('SELECT COUNT(*) FROM rooms'),
      pool.query('SELECT COUNT(*) FROM sections'),
      pool.query('SELECT COUNT(*) FROM timetable'),
    ]);
    res.json({
      success: true,
      data: {
        teachers: parseInt(t.rows[0].count),
        subjects: parseInt(s.rows[0].count),
        rooms: parseInt(r.rows[0].count),
        sections: parseInt(sec.rows[0].count),
        timetableEntries: parseInt(tt.rows[0].count),
      },
    });
  } catch (err) { next(err); }
};

module.exports = {
  getTeachers, createTeacher, updateTeacher, deleteTeacher,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getRooms, createRoom, updateRoom, deleteRoom,
  getSections, createSection, updateSection, deleteSection,
  getCurriculum, assignCurriculum, removeCurriculum,
  getDashboardStats,
};
