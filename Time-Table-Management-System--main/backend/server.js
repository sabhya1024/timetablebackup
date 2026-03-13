require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION SETUP ---
let dbType = 'sqlite';
let pgPool;
let sqliteDb;

if (process.env.DATABASE_URL) {
  // Use Neon / PostgreSQL
  dbType = 'postgres';
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon
  });

  pgPool.connect((err, client, release) => {
    if (err) console.error('Error connecting to PostgreSQL (Neon):', err.stack);
    else {
        console.log('Successfully connected to PostgreSQL (Neon Database)');
        release();
    }
  });
} else {
  // Fallback to SQLite (Zero-Setup)
  const dbPath = path.resolve(__dirname, 'database.sqlite');
  if (!fs.existsSync(dbPath)) {
    console.error("Local database.sqlite not found! Please run 'node initDb.js' first or set a DATABASE_URL.");
    process.exit(1);
  }
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening local SQLite database', err);
    else console.log('Successfully connected to Local SQLite (Zero-Setup Database)');
  });
}

// Unified Query Wrapper (supports BOTH SQLite and PostgreSQL syntax)
const runQuery = async (query, params = []) => {
  if (dbType === 'postgres') {
    // PostgreSQL uses $1, $2, etc. So we must replace ? with $index
    let pQuery = query;
    let index = 1;
    while(pQuery.includes('?')) {
        pQuery = pQuery.replace('?', `$${index++}`);
    }
    const result = await pgPool.query(pQuery, params);
    return result.rows;
  } else {
    // SQLite uses ? natively
    return new Promise((resolve, reject) => {
      sqliteDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
};

// --- API ROUTES ---

// Login logic
app.post('/api/login', async (req, res) => {
  const { role, identifier, password } = req.body;
  
  try {
    if (role === 'admin') {
       const admins = await runQuery('SELECT * FROM admins WHERE username = ? AND password_hash = ?', [identifier, password]);
       if(admins.length > 0) {
           return res.json({ success: true, user: { role: 'admin', id: admins[0].admin_id } });
       }
       return res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
    }
    
    if (role === 'teacher') {
      const result = await runQuery('SELECT * FROM teachers WHERE teacher_id = ?', [identifier]);
      if (result.length > 0) {
        return res.json({ success: true, user: { role: 'teacher', id: identifier, name: result[0].name } });
      }
      return res.status(401).json({ success: false, message: 'Teacher ID not found' });
    }

    if (role === 'student') {
        const sectionQuery = await runQuery('SELECT * FROM sections WHERE section_name = ?', [req.body.studentClass]);
        
        if (sectionQuery.length > 0) {
            return res.json({ 
                success: true, 
                user: { role: 'student', rollNo: identifier, sectionId: sectionQuery[0].section_id, class: req.body.studentClass } 
            });
        }
        return res.status(401).json({ success: false, message: 'Section not found' });
    }

    res.status(400).json({ success: false, message: 'Invalid role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get timetable for a specific teacher
app.get('/api/timetable/teacher/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT t.day, t.start_time, t.end_time, s.subject_name, r.room_number, sec.section_name
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.subject_id
      JOIN rooms r ON t.room_id = r.room_id
      JOIN sections sec ON t.section_id = sec.section_id
      WHERE t.teacher_id = ?
      ORDER BY 
        CASE t.day
          WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
        END,
        t.start_time;
    `;
    const result = await runQuery(query, [id]);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teacher timetable' });
  }
});

// Get timetable for a specific student class (section_id)
app.get('/api/timetable/student/:sectionId', async (req, res) => {
    try {
      const { sectionId } = req.params;
      const query = `
        SELECT t.day, t.start_time, t.end_time, s.subject_name, r.room_number, th.name AS teacher_name
        FROM timetable t
        JOIN subjects s ON t.subject_id = s.subject_id
        JOIN rooms r ON t.room_id = r.room_id
        JOIN teachers th ON t.teacher_id = th.teacher_id
        WHERE t.section_id = ?
        ORDER BY 
          CASE t.day
            WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
          END,
          t.start_time;
      `;
      const result = await runQuery(query, [sectionId]);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch student timetable' });
    }
});

// Get full timetable for admin
app.get('/api/timetable/all', async (req, res) => {
    try {
        const query = `
          SELECT t.entry_id, t.day, t.start_time, t.end_time, 
                 th.name AS teacher_name, s.subject_name, 
                 r.room_number, sec.section_name
          FROM timetable t
          JOIN teachers th ON t.teacher_id = th.teacher_id
          JOIN subjects s ON t.subject_id = s.subject_id
          JOIN rooms r ON t.room_id = r.room_id
          JOIN sections sec ON t.section_id = sec.section_id
          ORDER BY 
            CASE t.day
              WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
              WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
            END,
            t.start_time;
        `;
        const result = await runQuery(query, []);
        res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch all timetables' });
    }
});

// Admin Add Timetable Logic
app.post('/api/timetable/add', async (req, res) => {
  const { day, start_time, end_time, teacher_id, subject_id, room_id, section_id } = req.body;
  try {
     const sections = await runQuery('SELECT lunch_type, branch FROM sections WHERE section_id = ?', [section_id]);
     if (sections.length === 0) return res.status(400).json({ error: 'Section not found' });
     const { lunch_type, branch } = sections[0];

     if (lunch_type === 'A' && start_time === '12:00:00') {
         return res.status(400).json({ error: `LUNCH CONFLICT: ${branch} Section A is on break (12:00-13:00)` });
     } else if (lunch_type === 'B' && start_time === '13:00:00') {
         return res.status(400).json({ error: `LUNCH CONFLICT: ${branch} Section N is on break (13:00-14:00)` });
     }

     const teacherCheck = await runQuery('SELECT 1 FROM timetable WHERE day = ? AND start_time = ? AND teacher_id = ?', [day, start_time, teacher_id]);
     if (teacherCheck.length > 0) return res.status(400).json({ error: 'TEACHER BUSY: This professor is already teaching another section at this time.' });

     const roomCheck = await runQuery('SELECT 1 FROM timetable WHERE day = ? AND start_time = ? AND room_id = ?', [day, start_time, room_id]);
     if (roomCheck.length > 0) return res.status(400).json({ error: 'ROOM OCCUPIED: This room is already in use by another department.' });

     const sectionCheck = await runQuery('SELECT 1 FROM timetable WHERE day = ? AND start_time = ? AND section_id = ?', [day, start_time, section_id]);
     if (sectionCheck.length > 0) return res.status(400).json({ error: 'SECTION BUSY: These students already have a class scheduled.' });

     await runQuery('INSERT INTO timetable (day, start_time, end_time, teacher_id, subject_id, room_id, section_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 
         [day, start_time, end_time, teacher_id, subject_id, room_id, section_id]);

     res.json({ success: true, message: 'Slot added successfully' });
  } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to add timetable entry' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
