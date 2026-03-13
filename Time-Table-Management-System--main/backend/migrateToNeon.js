require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const sqlFilePath = path.resolve(__dirname, '../timetable.sql');

async function migrate() {
    if (!process.env.DATABASE_URL) {
        console.error("No DATABASE_URL found in .env. Please configure it first.");
        return;
    }

    const pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Connecting to Neon PostgreSQL...");
        const client = await pgPool.connect();
        console.log("Connected Successfully!");

        // 1. Create Tables
        console.log("Creating Tables...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS admins (
                admin_id INTEGER PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS rooms (
                room_id INTEGER PRIMARY KEY,
                room_number TEXT NOT NULL UNIQUE,
                capacity INTEGER,
                type TEXT
            );

            CREATE TABLE IF NOT EXISTS sections (
                section_id INTEGER PRIMARY KEY,
                year INTEGER,
                branch TEXT NOT NULL,
                section_name TEXT NOT NULL,
                lunch_type TEXT
            );

            CREATE TABLE IF NOT EXISTS subjects (
                subject_id INTEGER PRIMARY KEY,
                subject_name TEXT NOT NULL,
                credits INTEGER,
                weekly_hours INTEGER
            );

            CREATE TABLE IF NOT EXISTS teachers (
                teacher_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                specialization TEXT,
                dept_name TEXT,
                designation TEXT
            );

            CREATE TABLE IF NOT EXISTS timetable (
                entry_id SERIAL PRIMARY KEY,
                day TEXT,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                teacher_id INTEGER REFERENCES teachers(teacher_id) ON DELETE CASCADE,
                subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
                room_id INTEGER REFERENCES rooms(room_id) ON DELETE CASCADE,
                section_id INTEGER REFERENCES sections(section_id) ON DELETE CASCADE
            );
        `);

        // Check if data already exists to prevent duplicate insertion
        const existingAdmins = await client.query('SELECT * FROM admins');
        if (existingAdmins.rows.length > 0) {
             console.log("Data already exists in Neon. Migration skipped.");
             client.release();
             return;
        }

        console.log("Inserting Mock Admin...");
        await client.query(`INSERT INTO admins (admin_id, username, password_hash) VALUES (1, 'admin', 'admin')`);

        console.log("Parsing data from timetable.sql...");
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

        const parsedRoomsData = extractCopyData('rooms');
        if (parsedRoomsData.length) {
            console.log(`Inserting ${parsedRoomsData.length} rooms...`);
            for (let row of parsedRoomsData) {
                const padded = [...row, null, null, null, null].slice(0, 4);
                await client.query('INSERT INTO rooms (room_id, room_number, capacity, type) VALUES ($1, $2, $3, $4)', padded);
            }
        }

        const sectionsData = extractCopyData('sections');
        if (sectionsData.length) {
             console.log(`Inserting ${sectionsData.length} sections...`);
             for(let row of sectionsData) {
                 const padded = [...row, null, null, null, null, null].slice(0, 5);
                 await client.query('INSERT INTO sections (section_id, year, branch, section_name, lunch_type) VALUES ($1, $2, $3, $4, $5)', padded);
             }
        }
        
        const subjectsData = extractCopyData('subjects');
        if (subjectsData.length) {
             console.log(`Inserting ${subjectsData.length} subjects...`);
             for(let row of subjectsData) {
                 const padded = [...row, null, null, null, null].slice(0, 4);
                 await client.query('INSERT INTO subjects (subject_id, subject_name, credits, weekly_hours) VALUES ($1, $2, $3, $4)', padded);
             }
        }

        const teachersData = extractCopyData('teachers');
        if (teachersData.length) {
             console.log(`Inserting ${teachersData.length} teachers...`);
             for(let row of teachersData) {
                 const padded = [...row, null, null, null, null, null].slice(0, 5);
                 await client.query('INSERT INTO teachers (teacher_id, name, specialization, dept_name, designation) VALUES ($1, $2, $3, $4, $5)', padded);
             }
        }

        console.log('Migration Complete! Neon Database is ready.');
        client.release();
    } catch(err) {
        console.error("Migration Failed:", err);
    } finally {
        pgPool.end();
    }
}

migrate();
