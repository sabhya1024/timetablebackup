# 🏛 TimetableMS — College Timetable Management System

A production-ready, full-stack college timetable management system with automated scheduling,
role-based access, teacher absence management, and PDF/Excel export.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Student /   │  │   Teacher    │  │       Admin          │  │
│  │ Public View  │  │   Portal     │  │      Dashboard       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         └─────────────────┴──────────────────────┘             │
│                    React 18 + React Router v6                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │  HTTPS / REST API
┌─────────────────────────▼───────────────────────────────────────┐
│                       API LAYER                                 │
│            Node.js 20 + Express 4  (Port 4000)                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Auth  │ Timetable │ Absence │ Admin CRUD │ Generator   │    │
│  └────────┴───────────┴─────────┴────────────┴────────────┘    │
│         JWT (bcryptjs)  │  Rate Limiter  │  Winston Logger      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                     DATA LAYER                                  │
│  ┌─────────────────────────────┐   ┌────────────────────────┐   │
│  │  PostgreSQL 16              │   │  Redis 7 (optional)    │   │
│  │  8 tables + 2 views         │   │  Timetable caching     │   │
│  │  Connection pool (max 20)   │   │                        │   │
│  └─────────────────────────────┘   └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂 Folder Structure

```
timetable-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js          # Login (admin + teacher)
│   │   │   ├── timetableController.js     # CRUD + generate trigger
│   │   │   ├── absenceController.js       # Absence management
│   │   │   └── adminController.js         # All entity CRUD + stats
│   │   ├── services/
│   │   │   └── timetableGenerator.js      # 🧠 Core scheduling algorithm
│   │   ├── middleware/
│   │   │   └── auth.js                    # JWT sign/verify/protect
│   │   ├── routes/
│   │   │   └── index.js                   # All API routes
│   │   ├── db/
│   │   │   ├── pool.js                    # pg connection pool + withTransaction
│   │   │   ├── init.sql                   # Base schema + seed data
│   │   │   ├── schema_extensions.sql      # Extended tables (absences, logs, views)
│   │   │   └── seed.js                    # Dev seed script
│   │   ├── utils/
│   │   │   ├── logger.js                  # Winston logger
│   │   │   └── errors.js                  # AppError + errorHandler
│   │   └── server.js                      # Express entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── TimetableGrid.jsx      # 📅 Core visual grid
│   │   │   │   └── Sidebar.jsx            # Navigation sidebar
│   │   │   └── admin/
│   │   │       └── CrudPage.jsx           # Generic CRUD component
│   │   ├── hooks/
│   │   │   └── useAuth.js                 # Auth context + JWT management
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx              # Admin/Teacher login
│   │   │   ├── PublicTimetablePage.jsx    # Student view
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx     # Stats + quick actions
│   │   │   │   ├── AdminTimetable.jsx     # Grid CRUD
│   │   │   │   ├── AdminGenerate.jsx      # Trigger generation + results
│   │   │   │   ├── AdminTeachers.jsx
│   │   │   │   ├── AdminEntities.jsx      # Subjects / Rooms / Sections
│   │   │   │   ├── AdminCurriculum.jsx    # section↔subject↔teacher
│   │   │   │   ├── AdminAbsences.jsx
│   │   │   │   └── AdminConflicts.jsx
│   │   │   └── teacher/
│   │   │       ├── TeacherSchedule.jsx
│   │   │       ├── TeacherAbsence.jsx     # Mark absence + substitute
│   │   │       └── TeacherMyAbsences.jsx
│   │   ├── utils/
│   │   │   ├── api.js                     # Axios instance + interceptors
│   │   │   └── exportUtils.js             # PDF (jsPDF) + Excel (xlsx)
│   │   ├── styles/
│   │   │   └── global.css                 # Full design system
│   │   ├── App.jsx                        # Routing + protected routes
│   │   └── index.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   └── sample_queries.sql                 # 10 useful diagnostic queries
├── docker-compose.yml
└── README.md
```

---

## 🛢 Database Schema (Complete)

### Tables from provided timetable.sql

| Table      | Purpose                              | Key Constraints                    |
|------------|--------------------------------------|------------------------------------|
| `teachers` | Faculty records                      | PK: teacher_id                     |
| `subjects` | Course catalogue                     | weekly_hours > 0, credits > 0      |
| `rooms`    | Physical rooms                       | type IN ('Lab','Theory')           |
| `sections` | Student sections per year/branch     | lunch_type IN ('A','B'), year 1–4  |
| `admins`   | Admin accounts                       | username UNIQUE                    |
| `timetable`| Core schedule entries                | FK to all 4 entities, day CHECK    |

### Extension tables (schema_extensions.sql)

| Table                | Purpose                                      |
|----------------------|----------------------------------------------|
| `teacher_auth`       | Login credentials for teachers               |
| `teacher_subjects`   | Teacher ↔ subject authorization              |
| `section_subjects`   | Curriculum map (section + subject + teacher) |
| `teacher_absences`   | Absence records with substitute linking      |
| `generation_logs`    | Audit log for each timetable generation run  |
| `conflict_logs`      | Detail log of scheduling conflicts           |

### Views

| View                 | Purpose                                      |
|----------------------|----------------------------------------------|
| `v_timetable_full`   | Denormalized timetable with all names        |
| `v_teacher_load`     | Weekly slot count per teacher                |

---

## 🧠 Timetable Generation Algorithm

### Algorithm: **Greedy CSP (Constraint Satisfaction Problem)**

```
INPUT:
  - sections[]        (with lunch_type)
  - section_subjects[]  (curriculum: section → subject → teacher)
  - rooms[]
  - teachers[]

OUTPUT:
  - timetable entries inserted into DB
  - generation_log + conflict_logs written

PHASE 1 — LOAD
  Fetch all data from DB in parallel queries.

PHASE 2 — BUILD SLOT UNIVERSE
  For each section:
    slots = Mon–Sat × [09:00, 10:00 … 16:00]
    Remove lunch slot:
      lunch_type A → remove 12:00
      lunch_type B → remove 13:00
  → 7 usable slots/day × 6 days = 42 slots/section

PHASE 3 — SORT HARDEST-FIRST (MRV heuristic)
  Sort requirements by weekly_hours DESC
  → subjects with more hours are placed first
  → reduces dead-ends in later assignments

PHASE 4 — GREEDY ASSIGN (per section, round-robin over days)
  For each (section, subject) requirement:
    hoursPlaced = 0
    While hoursPlaced < weekly_hours AND attempts < maxAttempts:
      slot = next slot in round-robin (spreads across days)
      If section already busy in slot → skip
      If assigned teacher busy in slot → skip
      Pick room:
        Prefer room.type matching subject type (Lab for Lab subjects)
        Fallback: any free room
      If no room free → log NO_ROOM conflict → skip
      Else:
        Mark teacher, room, section as busy
        Add entry to output list
        hoursPlaced++
    If hoursPlaced < weekly_hours → log UNFULFILLED_HOURS

PHASE 5 — PERSIST (single transaction)
  BEGIN
    DELETE FROM timetable (if clearExisting)
    INSERT all entries
    INSERT generation_log
    INSERT conflict_logs
  COMMIT (or ROLLBACK on error)

PHASE 6 — RETURN
  { entriesCreated, conflicts[], logId }
```

### Conflict Detection

Three types of conflicts are detected and logged:

| Type                | Cause                                    | Action         |
|---------------------|------------------------------------------|----------------|
| `NO_ROOM`           | All rooms occupied at that slot          | Skip + log     |
| `UNFULFILLED_HOURS` | Couldn't place all weekly_hours          | Log at end     |
| `TEACHER_CONFLICT`  | Teacher already has class in that slot   | Skip slot      |

---

## 🔌 REST API Design

### Auth
```
POST /api/auth/admin/login      { username, password }  → { token, user }
POST /api/auth/teacher/login    { username, password }  → { token, user }
POST /api/auth/admin/register   { username, password }  → { admin }
```

### Timetable
```
GET    /api/timetable           ?section_id= &teacher_id= &day= &date=
POST   /api/timetable           [admin] { day, start_time, end_time, ... }
PUT    /api/timetable/:id       [admin] { ...fields }
DELETE /api/timetable/:id       [admin]
POST   /api/timetable/generate  [admin] { clearExisting: bool }
GET    /api/timetable/logs      [admin]
GET    /api/timetable/conflicts [admin] ?log_id=
```

### Absences
```
POST   /api/absences                    [teacher/admin] Mark absence
GET    /api/absences                    [teacher/admin] ?teacher_id= &date= &from= &to=
DELETE /api/absences/:id                [teacher/admin]
GET    /api/absences/substitutes        [teacher] ?entry_id= &date=
```

### Admin CRUD (all require admin JWT)
```
GET/POST         /api/teachers
GET/PUT/DELETE   /api/teachers/:id

GET/POST         /api/subjects
GET/PUT/DELETE   /api/subjects/:id

GET/POST         /api/rooms
GET/PUT/DELETE   /api/rooms/:id

GET/POST         /api/sections
GET/PUT/DELETE   /api/sections/:id

GET/POST         /api/curriculum         ?section_id=
DELETE           /api/curriculum/:id

GET              /api/stats
```

### HTTP Status Codes Used
- `200` — OK
- `201` — Created
- `400` — Bad Request (missing fields)
- `401` — Unauthorized (no/invalid token)
- `403` — Forbidden (wrong role)
- `404` — Not Found
- `409` — Conflict (duplicate / scheduling conflict)
- `500` — Internal Server Error

---

## 🎨 UI Wireframe (Text)

```
┌────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixed)   │  MAIN CONTENT                        │
│                         │                                      │
│  🏛 TimetableMS         │  ◈ Dashboard                         │
│  Admin Portal           │  ─────────────────────────────────── │
│  ──────────────         │  [41 Teachers] [9 Subjects] [18 Rooms]│
│  ◈ Dashboard            │  [4 Sections] [0 TT Entries]         │
│  ⊞ Timetable     ←──── │                                      │
│  ⚡ Generate            │  Quick Actions:                      │
│  👤 Teachers            │  [⚡ Generate] [⊞ View TT]           │
│  📘 Subjects            │  [📋 Curriculum] [⚠ Conflicts]      │
│  🏛 Rooms               │                                      │
│  🎓 Sections            │  Recent Generations:                 │
│  📋 Curriculum          │  ┌────┬──────────┬────────┬────────┐ │
│  📅 Absences            │  │#ID │ By       │Entries │Status │ │
│  ⚠ Conflict Log        │  ├────┼──────────┼────────┼────────┤ │
│  ──────────────         │  │ 1  │ admin    │  162   │ ✓ ok  │ │
│  admin                  │  └────┴──────────┴────────┴────────┘ │
│  [Sign Out]             │                                      │
└────────────────────────────────────────────────────────────────┘

TIMETABLE GRID VIEW:
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│  Time    │  Monday  │ Tuesday  │Wednesday │ Thursday │  Friday  │ Saturday │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  9–10 AM │ DBMS     │ SE       │ DIP      │ DE-III   │ DBMS     │    —     │
│          │ Dr.Dutta │ Dr.Sharma│Dr.Mallick│Dr.Chauhan│ Dr.Dutta │          │
│          │ G1       │ G2       │ G3       │ G4       │ G1       │          │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 12–1 PM  │ 🍽 Lunch Break (Type A)                                         │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  2–3 PM  │ DIP Lab  │    —     │ DBMS Lab │    —     │    —     │    —     │
│          │[CANCELLED│          │↪ Sub.    │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 🚀 Quick Start

### Option A — Docker (recommended)
```bash
git clone <repo>
cd timetable-system
docker-compose up --build

# After containers start:
# 1. Seed the database
docker exec timetable_api node src/db/seed.js

# Access:
# Frontend:  http://localhost:3000
# API:       http://localhost:4000/api
# Login:     admin / admin123
```

### Option B — Local Development
```bash
# 1. Start PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE timetable_db;"
psql -U postgres -d timetable_db -f backend/src/db/init.sql
psql -U postgres -d timetable_db -f backend/src/db/schema_extensions.sql

# 2. Backend
cd backend
cp .env.example .env           # edit DB credentials + JWT_SECRET
npm install
node src/db/seed.js            # seed admin + sample curriculum
npm run dev                    # starts on port 4000

# 3. Frontend (new terminal)
cd frontend
npm install
npm start                      # starts on port 3000
```

---

## 🔐 Role-Based Access Control

| Feature                    | Public | Teacher | Admin |
|----------------------------|--------|---------|-------|
| View timetable by section  | ✓      | ✓       | ✓     |
| Download PDF / Excel        | ✓      | ✓       | ✓     |
| View own schedule           | —      | ✓       | ✓     |
| Mark absence                | —      | ✓       | ✓     |
| View all absences           | —      | own     | ✓     |
| Create/Edit TT entries      | —      | —       | ✓     |
| Generate timetable          | —      | —       | ✓     |
| Manage Teachers/Subjects    | —      | —       | ✓     |
| View conflict logs          | —      | —       | ✓     |

---

## ⚡ Performance & Scalability

- **Connection pool**: pg Pool with max 20 connections
- **Indexes**: On timetable(day), timetable(teacher_id), timetable(section_id), timetable(room_id), absences(teacher_id, absence_date)
- **Views**: v_timetable_full and v_teacher_load for denormalized fast reads
- **Rate limiting**: 200 requests / 15 min per IP
- **Redis ready**: REDIS_URL env var accepted; can cache timetable GET responses
- **Transactions**: All multi-step writes use BEGIN/COMMIT via withTransaction()
- **Bulk inserts**: Generator writes all entries in a single transaction loop

---

## 🔮 Bonus Features Implemented

| Feature                    | Implementation                                    |
|----------------------------|---------------------------------------------------|
| JWT Auth                   | bcryptjs + jsonwebtoken, 8h expiry                |
| Role-based access          | middleware/auth.js — admin / teacher / public     |
| Conflict detection logs    | conflict_logs table + admin UI page               |
| Timetable regeneration btn | AdminGenerate.jsx → POST /api/timetable/generate  |
| PDF export                 | jsPDF + autotable (landscape A3)                  |
| Excel export               | xlsx library — formatted worksheet                |
| Absence + substitute       | Full flow: mark → check conflicts → assign sub    |
| Audit trail                | generation_logs table with detail JSONB           |
| Docker deployment          | docker-compose.yml + Dockerfiles + nginx          |

---

## 📦 Tech Stack Justification

| Layer      | Choice              | Why                                                   |
|------------|---------------------|-------------------------------------------------------|
| Frontend   | React 18            | Component model ideal for dynamic timetable grids     |
| Routing    | React Router v6     | Declarative, nested, protected routes                 |
| HTTP Client| Axios               | Interceptors for JWT injection + 401 redirect         |
| Styling    | Vanilla CSS         | Zero dependencies, full control, dark theme           |
| PDF Export | jsPDF + autotable   | Client-side, no server round-trip for exports         |
| Excel      | xlsx (SheetJS)      | Widely used, reliable client-side xlsx generation     |
| Backend    | Node.js + Express   | Non-blocking I/O, huge ecosystem, easy JSON APIs      |
| Auth       | JWT + bcryptjs      | Stateless, scalable, industry standard                |
| Database   | PostgreSQL 16       | Required by spec; ACID, rich constraints, views       |
| ORM/Query  | pg (raw SQL)        | Full control over queries, no abstraction overhead    |
| Logger     | Winston             | Structured JSON logs, multi-transport                 |
| Container  | Docker + nginx      | Reproducible deployment, nginx reverse proxy          |

---

## 🔧 Environment Variables Reference

```bash
# Backend (.env)
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timetable_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=at_least_32_random_chars
REDIS_URL=redis://localhost:6379   # optional
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Frontend (.env)
REACT_APP_API_URL=/api             # proxied via nginx in production
```
