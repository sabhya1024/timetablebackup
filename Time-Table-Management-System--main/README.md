# Time Table Management System

A dynamic, full-stack application for managing and displaying university timetables. This system includes a responsive React frontend and a Node.js/Express backend connected to a PostgreSQL database.

## Prerequisites
Before running the project, ensure you have the following installed on your machine:
- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **PostgreSQL** (v14 or higher)

---

## 1. Initial Database Setup

Before running the server, you need to populate the database with the provided SQL data.

To use the **Local SQLite Database (Easiest)**:
1. Open your terminal in the `backend/` folder.
2. Run `npm install` to install dependencies.
3. Run `node initDb.js` 
   - *This will automatically create `database.sqlite` from your `timetable.sql`.*

### *(Optional)* Using Neon.js (Remote PostgreSQL Database)

If you are ready to use a live Neon database instead of local SQLite:
1. Open the file `backend/.env.example` and rename it to `backend/.env`.
2. Open `backend/.env` in your text editor.
3. Uncomment the `DATABASE_URL` line and replace the example URL with your exact Neon connection string.
```env
DATABASE_URL=postgres://USER:PASSWORD@ep-cool-butterfly-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=5000
```
4. Important: To push your local data into the empty Neon database, open your terminal in the `backend/` folder and run this one-time migration:
```bash
node migrateToNeon.js
```

---

## 2. Starting the Servers Manually

You need to run both the Backend API and the Frontend React app at the same time in two separate terminals.

**Terminal 1 (Backend):**
1. Open the `backend/` folder in your terminal.
2. Run `npm install` (if you haven't already).
3. Run `npm start` or `node server.js`
4. Wait for it to say *Server is running on port 5000*.

**Terminal 2 (Frontend):**
1. Open the `frontend/` folder in a **new terminal**.
2. Run `npm install`
3. Run `npm run dev`
4. Open the `http://localhost:5173` link in your browser!

1. Open the file `backend/.env.example` and rename it to `backend/.env`.
2. Open `backend/.env` in your text editor.
3. Uncomment the `DATABASE_URL` line and replace the example URL with your real Neon connection string.
```env
DATABASE_URL=postgres://USER:PASSWORD@ep-cool-butterfly-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=5000
```
4. **Important**: Since your new Neon database is empty, you need to push the data into it! Open your terminal in the `backend/` folder and run the migration script:
```bash
node migrateToNeon.js
```
5. Wait for it to say *Migration Complete*.
6. Restart the backend server. It will detect the `DATABASE_URL` and automatically use the `pg` driver to connect to your remote Neon PostgreSQL database.

---

## How to Test the Application

Once both the backend and frontend are running, use the login portals to test the views:

- **Admin Login**: 
  - Username: \`admin\`
  - Password: \`admin\`
  *(Shows the master view of all schedules across the university)*

- **Teacher Login**:
  - Teacher ID: Enter any valid ID from the database (e.g., \`1\`, \`2\`, \`3\`, up to \`41\`)
  *(Shows the specific schedule assigned to that professor)*

- **Student portal**: 
  - Roll Number: (Any text works for demonstration)
  - Section Name: Enter a valid section from the database (e.g., \`CS3\`, \`CD3\`, \`EC3\`, \`ED3\`)
  *(Shows the schedule for that specific class section)*

---

## Authors
**RUDRANSH SHARMA 23BCS093**  
**SABHYA DHIMAN 23BCS094**  
**SACHIN CHAUDHARY 23BCS095**  
**SAHIL TEKTA 23BCS096**
