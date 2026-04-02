// src/db/seed.js
// Run: node src/db/seed.js
// Creates: admin account, sample teacher logins, sample curriculum

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./pool');

async function seed() {
  console.log('🌱 Seeding database…');

  // 1. Create default admin
  const adminHash = await bcrypt.hash('admin123', 12);
  await pool.query(
    `INSERT INTO admins (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING`,
    ['admin', adminHash]
  );
  console.log('✓ Admin created  → username: admin / password: admin123');

  // 2. Create teacher login accounts for first 5 CSE teachers
  const { rows: teachers } = await pool.query(
    `SELECT teacher_id, name FROM teachers WHERE dept_name='CSE' ORDER BY teacher_id LIMIT 5`
  );

  for (const t of teachers) {
    const slug = t.name.split(' ').pop().toLowerCase().replace(/[^a-z]/g, '');
    const username = `teacher.${slug}`;
    const hash = await bcrypt.hash('teacher123', 12);
    await pool.query(
      `INSERT INTO teacher_auth (teacher_id, username, password_hash)
       VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING`,
      [t.teacher_id, username, hash]
    );
    console.log(`✓ Teacher login  → ${username} / password: teacher123 (${t.name})`);
  }

  // 3. Sample curriculum for CS3 (section_id=1) — all 9 subjects
  const { rows: sections } = await pool.query(`SELECT section_id FROM sections WHERE section_name='CS3'`);
  const { rows: subjects } = await pool.query(`SELECT subject_id FROM subjects ORDER BY subject_id`);
  const { rows: cseTeachers } = await pool.query(`SELECT teacher_id FROM teachers WHERE dept_name='CSE' ORDER BY teacher_id`);

  if (sections.length && subjects.length && cseTeachers.length) {
    const secId = sections[0].section_id;
    for (let i = 0; i < subjects.length; i++) {
      const teacherIdx = i % cseTeachers.length;
      await pool.query(
        `INSERT INTO section_subjects (section_id, subject_id, teacher_id)
         VALUES ($1, $2, $3) ON CONFLICT (section_id, subject_id) DO NOTHING`,
        [secId, subjects[i].subject_id, cseTeachers[teacherIdx].teacher_id]
      );
    }
    console.log(`✓ Curriculum created for CS3 (${subjects.length} subjects)`);
  }

  // 4. Sample curriculum for CD3 (section_id=2)
  const { rows: cd3 } = await pool.query(`SELECT section_id FROM sections WHERE section_name='CD3'`);
  if (cd3.length && subjects.length && cseTeachers.length) {
    const secId = cd3[0].section_id;
    for (let i = 0; i < Math.min(7, subjects.length); i++) {
      const teacherIdx = (i + 3) % cseTeachers.length;
      await pool.query(
        `INSERT INTO section_subjects (section_id, subject_id, teacher_id)
         VALUES ($1, $2, $3) ON CONFLICT (section_id, subject_id) DO NOTHING`,
        [secId, subjects[i].subject_id, cseTeachers[teacherIdx].teacher_id]
      );
    }
    console.log(`✓ Curriculum created for CD3`);
  }

  console.log('\n✅ Seed complete!');
  console.log('   Admin login:   admin / admin123');
  console.log('   Teacher login: teacher.awasthi / teacher123');
  console.log('\nNext: POST /api/timetable/generate to auto-generate the timetable.');
  await pool.end();
}

seed().catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1); });
