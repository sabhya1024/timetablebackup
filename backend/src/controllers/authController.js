// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const { pool } = require('../db/pool');
const { signToken } = require('../middleware/auth');
const { AppError } = require('../utils/errors');

// POST /api/auth/admin/login
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new AppError('Username and password required', 400);

    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );
    const admin = rows[0];
    if (!admin) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = signToken({ id: admin.admin_id, role: 'admin', username: admin.username });
    res.json({ success: true, token, user: { id: admin.admin_id, username: admin.username, role: 'admin' } });
  } catch (err) { next(err); }
};

// POST /api/auth/teacher/login
const teacherLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new AppError('Username and password required', 400);

    const { rows } = await pool.query(
      `SELECT ta.*, t.name, t.dept_name, t.teacher_id
       FROM teacher_auth ta
       JOIN teachers t ON t.teacher_id = ta.teacher_id
       WHERE ta.username = $1`,
      [username]
    );
    const teacher = rows[0];
    if (!teacher) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, teacher.password_hash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = signToken({
      id: teacher.teacher_id,
      role: 'teacher',
      username: teacher.username,
      name: teacher.name,
    });
    res.json({
      success: true, token,
      user: { id: teacher.teacher_id, name: teacher.name, dept: teacher.dept_name, role: 'teacher' },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/admin/register  (first-time setup)
const adminRegister = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new AppError('Username and password required', 400);
    if (password.length < 8) throw new AppError('Password must be at least 8 characters', 400);

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING admin_id, username',
      [username, hash]
    );
    res.status(201).json({ success: true, admin: rows[0] });
  } catch (err) {
    if (err.code === '23505') return next(new AppError('Username already exists', 409));
    next(err);
  }
};

module.exports = { adminLogin, teacherLogin, adminRegister };
