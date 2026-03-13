CREATE OR REPLACE PROCEDURE public.add_timetable_entry(
    p_day TEXT, 
    p_start_time TIME, 
    p_teacher_id INT, 
    p_subject_id INT, 
    p_room_id INT, 
    p_section_id INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_lunch_type CHAR(1);
    v_dept_name TEXT;
BEGIN
    -- Get Lunch Type and Dept for the specific section
    SELECT lunch_type, dept_name INTO v_lunch_type, v_dept_name 
    FROM public.sections WHERE section_id = p_section_id;

    -- 1. CONSTRAINT: Staggered Lunch Break Logic
    -- Section A: Lunch 12-1 PM | Section N: Lunch 1-2 PM
    IF (v_lunch_type = 'A' AND p_start_time = '12:00:00') THEN
        RAISE EXCEPTION 'LUNCH CONFLICT: % Section A is on break (12:00-13:00)', v_dept_name;
    ELSIF (v_lunch_type = 'B' AND p_start_time = '13:00:00') THEN
        RAISE EXCEPTION 'LUNCH CONFLICT: % Section N is on break (13:00-14:00)', v_dept_name;
    END IF;

    -- 2. CONSTRAINT: Teacher Availability
    IF EXISTS (SELECT 1 FROM public.timetable WHERE day = p_day AND start_time = p_start_time AND teacher_id = p_teacher_id) THEN
        RAISE EXCEPTION 'TEACHER BUSY: This professor is already teaching another section at this time.';
    END IF;

    -- 3. CONSTRAINT: Room Availability
    IF EXISTS (SELECT 1 FROM public.timetable WHERE day = p_day AND start_time = p_start_time AND room_id = p_room_id) THEN
        RAISE EXCEPTION 'ROOM OCCUPIED: This room is already in use by another department.';
    END IF;

    -- 4. CONSTRAINT: Section Availability (No double classes for students)
    IF EXISTS (SELECT 1 FROM public.timetable WHERE day = p_day AND start_time = p_start_time AND section_id = p_section_id) THEN
        RAISE EXCEPTION 'SECTION BUSY: These students already have a class scheduled.';
    END IF;

    -- If all clear, insert into the 5-day week schedule
    INSERT INTO public.timetable (day, start_time, teacher_id, subject_id, room_id, section_id)
    VALUES (p_day, p_start_time, p_teacher_id, p_subject_id, p_room_id, p_section_id);

    RAISE NOTICE 'Success: Slot added for % at %', p_day, p_start_time;
END;
$$;
