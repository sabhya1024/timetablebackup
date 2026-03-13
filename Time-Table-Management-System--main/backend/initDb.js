const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const sqlFilePath = path.resolve(__dirname, '../timetable.sql');

// Remove existing db to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

console.log('Initializing SQLite database...');

db.serialize(() => {
  // Create tables appropriately for SQLite
  db.run(`CREATE TABLE admins (
    admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE rooms (
    room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT NOT NULL UNIQUE,
    capacity INTEGER,
    type TEXT
  )`);

  db.run(`CREATE TABLE sections (
    section_id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    branch TEXT NOT NULL,
    section_name TEXT NOT NULL,
    lunch_type TEXT
  )`);

  db.run(`CREATE TABLE subjects (
    subject_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_name TEXT NOT NULL,
    credits INTEGER,
    weekly_hours INTEGER
  )`);

  db.run(`CREATE TABLE teachers (
    teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT,
    dept_name TEXT,
    designation TEXT
  )`);

  db.run(`CREATE TABLE timetable (
    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    teacher_id INTEGER,
    subject_id INTEGER,
    room_id INTEGER,
    section_id INTEGER,
    FOREIGN KEY(room_id) REFERENCES rooms(room_id),
    FOREIGN KEY(section_id) REFERENCES sections(section_id),
    FOREIGN KEY(subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY(teacher_id) REFERENCES teachers(teacher_id)
  )`);

  // Insert mock admin
  db.run(`INSERT INTO admins (username, password_hash) VALUES ('admin', 'admin')`);

  // Parse timetable.sql to seed the database
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  const extractCopyData = (tableName) => {
    const regex = new RegExp(`COPY public.${tableName} .*? FROM stdin;\\n([\\s\\S]*?)\\.`, 'm');
    const match = sqlContent.match(regex);
    if (match) {
        return match[1].trim().split('\n')
            .filter(line => line.length > 1 && !line.startsWith('\\'))
            .map(line => line.replace(/\r$/, '').split('\t').map(val => val === '\\N' ? null : val));
    }
    return [];
  };

  const roomsData = extractCopyData('rooms');
  const insertRoom = db.prepare('INSERT INTO rooms (room_id, room_number, capacity, type) VALUES (?, ?, ?, ?)');
  roomsData.forEach(row => insertRoom.run(row));
  insertRoom.finalize();

  const sectionsData = extractCopyData('sections');
  const insertSection = db.prepare('INSERT INTO sections (section_id, year, branch, section_name, lunch_type) VALUES (?, ?, ?, ?, ?)');
  sectionsData.forEach(row => insertSection.run(row));
  insertSection.finalize();

  const subjectsData = extractCopyData('subjects');
  const insertSubject = db.prepare('INSERT INTO subjects (subject_id, subject_name, credits, weekly_hours) VALUES (?, ?, ?, ?)');
  subjectsData.forEach(row => insertSubject.run(row));
  insertSubject.finalize();

  const teachersData = extractCopyData('teachers');
  const insertTeacher = db.prepare('INSERT INTO teachers (teacher_id, name, specialization, dept_name, designation) VALUES (?, ?, ?, ?, ?)');
  teachersData.forEach(row => insertTeacher.run(row));
  insertTeacher.finalize();

  // Create a few mock timetable entries to demonstrate the UI works
  console.log('Inserting mock timetable data...');
  const mockEntries = [
    ['Monday', '09:00', '10:00', 1, 1, 1, 1],
    ['Monday', '10:00', '11:00', 2, 2, 2, 1],
    ['Tuesday', '11:00', '12:00', 3, 3, 3, 2],
    ['Wednesday', '14:00', '15:00', 4, 4, 4, 3],
  ];
  const insertTimetable = db.prepare('INSERT INTO timetable (day, start_time, end_time, teacher_id, subject_id, room_id, section_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
  mockEntries.forEach(row => insertTimetable.run(row));
  insertTimetable.finalize();

  console.log('Database initialization complete: database.sqlite created successfully!');
});

db.close();
