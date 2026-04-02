-- ============================================================
-- SAMPLE DATABASE QUERIES — TimetableMS
-- Useful for debugging, reporting, and manual inspection
-- ============================================================

-- ── 1. Full weekly timetable for a section ───────────────────
SELECT
    t.day,
    t.start_time,
    t.end_time,
    s.subject_name,
    tc.name  AS teacher,
    r.room_number,
    r.type   AS room_type
FROM timetable t
JOIN subjects  s  ON s.subject_id  = t.subject_id
JOIN teachers  tc ON tc.teacher_id = t.teacher_id
JOIN rooms     r  ON r.room_id     = t.room_id
WHERE t.section_id = 1
ORDER BY
    CASE t.day
        WHEN 'Monday'    THEN 1
        WHEN 'Tuesday'   THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday'  THEN 4
        WHEN 'Friday'    THEN 5
        WHEN 'Saturday'  THEN 6
    END,
    t.start_time;


-- ── 2. Check teacher conflicts (should return 0 rows) ────────
SELECT
    t1.entry_id   AS entry_a,
    t2.entry_id   AS entry_b,
    t1.teacher_id,
    tc.name       AS teacher_name,
    t1.day,
    t1.start_time
FROM timetable t1
JOIN timetable t2
    ON  t1.teacher_id = t2.teacher_id
    AND t1.day        = t2.day
    AND t1.start_time = t2.start_time
    AND t1.entry_id   < t2.entry_id
JOIN teachers tc ON tc.teacher_id = t1.teacher_id;


-- ── 3. Check room conflicts (should return 0 rows) ───────────
SELECT
    t1.entry_id   AS entry_a,
    t2.entry_id   AS entry_b,
    t1.room_id,
    r.room_number,
    t1.day,
    t1.start_time
FROM timetable t1
JOIN timetable t2
    ON  t1.room_id    = t2.room_id
    AND t1.day        = t2.day
    AND t1.start_time = t2.start_time
    AND t1.entry_id   < t2.entry_id
JOIN rooms r ON r.room_id = t1.room_id;


-- ── 4. Weekly hours fulfilled per section/subject ────────────
SELECT
    sec.section_name,
    s.subject_name,
    s.weekly_hours   AS required,
    COUNT(t.entry_id) AS placed,
    CASE WHEN COUNT(t.entry_id) >= s.weekly_hours THEN '✓ OK' ELSE '✗ SHORT' END AS status
FROM section_subjects ss
JOIN subjects  s   ON s.subject_id  = ss.subject_id
JOIN sections  sec ON sec.section_id = ss.section_id
LEFT JOIN timetable t
    ON  t.subject_id  = ss.subject_id
    AND t.section_id  = ss.section_id
GROUP BY sec.section_name, s.subject_name, s.weekly_hours
ORDER BY sec.section_name, s.subject_name;


-- ── 5. Teacher workload per week ─────────────────────────────
SELECT
    tc.name,
    tc.dept_name,
    COUNT(t.entry_id) AS weekly_slots
FROM teachers tc
LEFT JOIN timetable t ON t.teacher_id = tc.teacher_id
GROUP BY tc.teacher_id, tc.name, tc.dept_name
ORDER BY weekly_slots DESC;


-- ── 6. Room utilization ──────────────────────────────────────
SELECT
    r.room_number,
    r.type,
    r.capacity,
    COUNT(t.entry_id) AS slots_used,
    -- Max possible = 6 days × 7 teaching slots
    ROUND(COUNT(t.entry_id)::numeric / 42 * 100, 1) AS utilization_pct
FROM rooms r
LEFT JOIN timetable t ON t.room_id = r.room_id
GROUP BY r.room_id, r.room_number, r.type, r.capacity
ORDER BY slots_used DESC;


-- ── 7. Today's timetable for a teacher with absence overlay ──
SELECT
    t.day,
    t.start_time,
    t.end_time,
    s.subject_name,
    sec.section_name,
    r.room_number,
    COALESCE(a.status, 'present')         AS status,
    sub.name                               AS substitute_name
FROM timetable t
JOIN subjects  s   ON s.subject_id   = t.subject_id
JOIN sections  sec ON sec.section_id = t.section_id
JOIN rooms     r   ON r.room_id      = t.room_id
LEFT JOIN teacher_absences a
    ON  a.timetable_entry = t.entry_id
    AND a.absence_date    = CURRENT_DATE
LEFT JOIN teachers sub ON sub.teacher_id = a.substitute_id
WHERE t.teacher_id = 1   -- <-- replace with target teacher_id
  AND t.day = TO_CHAR(CURRENT_DATE, 'Day')::text
ORDER BY t.start_time;


-- ── 8. Lunch slot validation ─────────────────────────────────
-- Verify no section has a lecture during its lunch hour
SELECT
    sec.section_name,
    sec.lunch_type,
    t.day,
    t.start_time,
    s.subject_name
FROM timetable t
JOIN sections sec ON sec.section_id = t.section_id
JOIN subjects s   ON s.subject_id   = t.subject_id
WHERE
    (sec.lunch_type = 'A' AND t.start_time = '12:00:00')
 OR (sec.lunch_type = 'B' AND t.start_time = '13:00:00');
-- Should return 0 rows if constraints are respected


-- ── 9. Generation log summary ────────────────────────────────
SELECT
    gl.log_id,
    a.username        AS generated_by,
    gl.generated_at,
    gl.algorithm,
    gl.entries_created,
    gl.conflicts_found,
    gl.status
FROM generation_logs gl
LEFT JOIN admins a ON a.admin_id = gl.generated_by
ORDER BY gl.generated_at DESC
LIMIT 10;


-- ── 10. Absence summary by teacher (last 30 days) ────────────
SELECT
    tc.name,
    COUNT(*)                                            AS total_absences,
    SUM(CASE WHEN a.status = 'cancelled'  THEN 1 END)  AS cancelled,
    SUM(CASE WHEN a.status = 'substitute' THEN 1 END)  AS with_substitute
FROM teacher_absences a
JOIN teachers tc ON tc.teacher_id = a.teacher_id
WHERE a.absence_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tc.teacher_id, tc.name
ORDER BY total_absences DESC;
