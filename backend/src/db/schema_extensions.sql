-- ============================================================
-- College Timetable Management System
-- Extended Schema (additions on top of provided timetable.sql)
-- ============================================================

-- -------------------------------------------------------
-- 1. TEACHER CREDENTIALS  (login table for teachers)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_auth (
    auth_id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id     INTEGER NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE CASCADE,
    username       TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- 2. TEACHER ↔ SUBJECT mapping
--    (which teacher is authorised to teach which subject)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id  INTEGER NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE CASCADE,
    subject_id  INTEGER NOT NULL REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
    UNIQUE(teacher_id, subject_id)
);

-- -------------------------------------------------------
-- 3. SECTION ↔ SUBJECT mapping  (curriculum)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.section_subjects (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    section_id  INTEGER NOT NULL REFERENCES public.sections(section_id) ON DELETE CASCADE,
    subject_id  INTEGER NOT NULL REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
    teacher_id  INTEGER REFERENCES public.teachers(teacher_id) ON DELETE SET NULL,
    UNIQUE(section_id, subject_id)
);

-- -------------------------------------------------------
-- 4. ABSENCE RECORDS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_absences (
    absence_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id      INTEGER NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE CASCADE,
    absence_date    DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'absent'
        CHECK (status IN ('absent', 'cancelled', 'substitute')),
    substitute_id   INTEGER REFERENCES public.teachers(teacher_id) ON DELETE SET NULL,
    timetable_entry INTEGER REFERENCES public.timetable(entry_id) ON DELETE CASCADE,
    note            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, absence_date, timetable_entry)
);

-- -------------------------------------------------------
-- 5. TIMETABLE GENERATION LOGS  (audit trail)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generation_logs (
    log_id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    generated_by    INTEGER REFERENCES public.admins(admin_id) ON DELETE SET NULL,
    generated_at    TIMESTAMPTZ DEFAULT NOW(),
    algorithm       TEXT DEFAULT 'greedy_csp',
    entries_created INTEGER DEFAULT 0,
    conflicts_found INTEGER DEFAULT 0,
    status          TEXT DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
    detail          JSONB
);

-- -------------------------------------------------------
-- 6. CONFLICT LOGS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conflict_logs (
    conflict_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    log_id        INTEGER REFERENCES public.generation_logs(log_id) ON DELETE CASCADE,
    conflict_type TEXT NOT NULL,
    description   TEXT,
    day           TEXT,
    start_time    TIME,
    teacher_id    INTEGER,
    room_id       INTEGER,
    section_id    INTEGER,
    logged_at     TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- 7. USEFUL INDEXES
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_timetable_day       ON public.timetable(day);
CREATE INDEX IF NOT EXISTS idx_timetable_teacher   ON public.timetable(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_section   ON public.timetable(section_id);
CREATE INDEX IF NOT EXISTS idx_timetable_room      ON public.timetable(room_id);
CREATE INDEX IF NOT EXISTS idx_absences_teacher    ON public.teacher_absences(teacher_id, absence_date);

-- -------------------------------------------------------
-- 8. HELPER VIEWS
-- -------------------------------------------------------
CREATE OR REPLACE VIEW public.v_timetable_full AS
SELECT
    t.entry_id,
    t.day,
    t.start_time,
    t.end_time,
    tc.teacher_id,
    tc.name          AS teacher_name,
    tc.dept_name,
    s.subject_id,
    s.subject_name,
    s.credits,
    s.weekly_hours,
    r.room_id,
    r.room_number,
    r.type           AS room_type,
    r.capacity,
    sec.section_id,
    sec.section_name,
    sec.branch,
    sec.year,
    sec.lunch_type
FROM public.timetable t
JOIN public.teachers  tc  ON tc.teacher_id  = t.teacher_id
JOIN public.subjects   s  ON s.subject_id   = t.subject_id
JOIN public.rooms      r  ON r.room_id      = t.room_id
JOIN public.sections   sec ON sec.section_id = t.section_id;

-- Teacher weekly load view
CREATE OR REPLACE VIEW public.v_teacher_load AS
SELECT
    tc.teacher_id,
    tc.name,
    COUNT(t.entry_id) AS total_slots_per_week
FROM public.teachers tc
LEFT JOIN public.timetable t ON t.teacher_id = tc.teacher_id
GROUP BY tc.teacher_id, tc.name;
