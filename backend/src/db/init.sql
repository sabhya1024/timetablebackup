-- ============================================================
-- init.sql  – Run BEFORE schema_extensions.sql
-- Contains base tables from timetable.sql (provided schema)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.teachers (
    teacher_id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        TEXT NOT NULL,
    specialization TEXT,
    dept_name   TEXT,
    designation TEXT
);

CREATE TABLE IF NOT EXISTS public.subjects (
    subject_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject_name TEXT NOT NULL,
    credits      INTEGER CHECK (credits > 0),
    weekly_hours INTEGER CHECK (weekly_hours > 0)
);

CREATE TABLE IF NOT EXISTS public.rooms (
    room_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_number TEXT NOT NULL UNIQUE,
    capacity    INTEGER CHECK (capacity > 0),
    type        TEXT CHECK (type = ANY (ARRAY['Lab','Theory']))
);

CREATE TABLE IF NOT EXISTS public.sections (
    section_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    year         INTEGER CHECK (year >= 1 AND year <= 4),
    branch       TEXT NOT NULL,
    section_name TEXT NOT NULL,
    lunch_type   CHAR(1) CHECK (lunch_type = ANY (ARRAY['A','B']))
);

CREATE TABLE IF NOT EXISTS public.admins (
    admin_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.timetable (
    entry_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    day        TEXT CHECK (day = ANY (ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'])),
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    teacher_id INTEGER REFERENCES public.teachers(teacher_id)  ON DELETE CASCADE,
    subject_id INTEGER REFERENCES public.subjects(subject_id)  ON DELETE CASCADE,
    room_id    INTEGER REFERENCES public.rooms(room_id)        ON DELETE CASCADE,
    section_id INTEGER REFERENCES public.sections(section_id)  ON DELETE CASCADE,
    CHECK (end_time > start_time)
);

-- ── Seed data from provided timetable.sql ───────────────────

-- Rooms
INSERT INTO public.rooms (room_number, capacity, type) VALUES
  ('G1',200,'Theory'),('G2',200,'Theory'),('G3',100,'Theory'),
  ('G4',100,'Theory'),('G5',100,'Theory'),('G6',100,'Theory'),
  ('F1',200,'Theory'),('F2',200,'Theory'),('F3',100,'Theory'),
  ('F4',100,'Theory'),('F5',100,'Theory'),('F6',100,'Theory'),
  ('S1',200,'Theory'),('S2',200,'Theory'),('S3',100,'Theory'),
  ('S4',100,'Theory'),('S5',100,'Theory'),('S6',100,'Theory')
ON CONFLICT (room_number) DO NOTHING;

-- Sections
INSERT INTO public.sections (year, branch, section_name, lunch_type) VALUES
  (3,'CSE','CS3','A'),
  (3,'CSE','CD3','B'),
  (3,'ECE','EC3','A'),
  (3,'ECE','ED3','B')
ON CONFLICT DO NOTHING;

-- Subjects
INSERT INTO public.subjects (subject_name, credits, weekly_hours) VALUES
  ('Digital Image Processing',3,3),
  ('Database Management Systems',3,3),
  ('Software Engineering',2,2),
  ('Discipline Elective III',3,3),
  ('Discipline Elective IV',3,3),
  ('Stream Core I',2,2),
  ('Engineering Economics and Accountancy',2,2),
  ('Digital Image Processing Lab',1,1),
  ('Database Management Systems Lab',1,1)
ON CONFLICT DO NOTHING;

-- Teachers (41 from provided data)
INSERT INTO public.teachers (name, specialization, dept_name, designation) VALUES
  ('Prof. Lalit Kumar Awasthi','Mobile Distributed Systems, Fault Tolerance, Sensor Networks, Network Security','CSE','Professor'),
  ('Dr. Kamlesh Dutta','Computer Science & Engineering','CSE','Associate Professor'),
  ('Dr. T P Sharma','Distributed Systems, Wireless Sensor Networks, MANETs, VANETs','CSE','Associate Professor'),
  ('Dr. Siddhartha Chauhan','Computer Science & Engineering','CSE','Associate Professor (HoD)'),
  ('Dr. Naveen Chauhan','Mobile Wireless Networks, IoT, Vehicular Networks','CSE','Associate Professor'),
  ('Dr. Pardeep Singh','Natural Language Processing, Artificial Intelligence','CSE','Associate Professor'),
  ('Dr. Rajeev Kumar','Computer Networks, Wireless Networks, IoT','CSE','Assistant Professor Grade-I'),
  ('Dr. Nitin Gupta','Wireless Networks, Cognitive Radio, IoT, Fog Computing','CSE','Assistant Professor Grade-I'),
  ('Dr. Dharmendra Prasad Mahato','Distributed Computing','CSE','Assistant Professor Grade-I'),
  ('Dr. Arun Kumar Yadav','Information Retrieval, Machine Learning, Database Indexing','CSE','Assistant Professor Grade-I'),
  ('Dr. Priyanka','Adhoc Networks, Wireless Sensor Networks, IoT','CSE','Assistant Professor Grade-I'),
  ('Dr. Jyoti Srivastava','Natural Language Processing, Artificial Intelligence','CSE','Assistant Professor Grade-I'),
  ('Dr. Sangeeta Sharma','Cloud Computing, Virtualization','CSE','Assistant Professor Grade-I'),
  ('Dr. Mohit Kumar','Artificial Intelligence, Machine Learning, Speech Processing','CSE','Assistant Professor Grade-I'),
  ('Dr. Mohammad Khalid Pandit','Deep Learning, Edge Computing, Machine Learning','CSE','Assistant Professor Grade-II'),
  ('Dr. Ajay Kumar Mallick','Computer Vision, Machine Learning, Image Processing','CSE','Assistant Professor Grade-II'),
  ('Dr. Ram Prakash Sharma','Explainable AI, Deep Learning, Biometric Security','CSE','Assistant Professor Grade-II'),
  ('Dr. Robin Singh Bhadoria','Service-Oriented Architecture, Big Data Analytics, IoT','CSE','Assistant Professor Grade-II'),
  ('Prof. (Mrs.) Rajeevan Chandel','Low Power VLSI Design, Modeling & Simulation','ECE','Professor'),
  ('Kumar S Pandey','Embedded Systems','ECE','Associate Professor'),
  ('Dr. Surender Soni','Communication, Wireless Sensor Networks','ECE','Associate Professor'),
  ('Dr. Ashok Kumar','Wireless Sensor Networks, Wireless Communication','ECE','Associate Professor'),
  ('Dr. (Mrs.) Gargi Khanna','Low Power VLSI Design, MEMS Design','ECE','Associate Professor'),
  ('Dr. Ashwani Kumar Rana','Low Power VLSI, Device Modeling','ECE','Associate Professor'),
  ('Dr. Krishan Kumar','Wireless Communication, 5G/6G, IoT, Machine Learning','ECE','Associate Professor'),
  ('Dr. Manoranjan Rai Bharti','Communication Systems, Signal Processing, Wireless Communications','ECE','Associate Professor'),
  ('Dr. Philemon Daniel','Deep Learning, NLP, Embedded Systems, VLSI Design','ECE','Associate Professor'),
  ('Dr. Rohit Dhiman','Electronics and Communication','ECE','Associate Professor'),
  ('Dr. Mahesh Angira','MEMS, RF-MEMS, RF-Microelectronics','ECE','Associate Professor'),
  ('Dr. Pushpendra Singh','Signal Modeling, Machine Learning, Image Processing, Biomedical Signal Processing','ECE','Assistant Professor Grade-I'),
  ('Dr. Saurabh Kumar','Antenna Design, RF & Microwave, Metamaterials, THz Communication','ECE','Assistant Professor Grade-I'),
  ('Dr. Chandra Shekhar Prasad','THz Antennas, Metasurfaces, MIMO Antennas, Cognitive Radio','ECE','Assistant Professor Grade-I'),
  ('Dr. Abhijit Bhattacharyya','Digital Signal Processing, Deep Learning, Biomedical Signal Processing','ECE','Assistant Professor Grade-I'),
  ('Dr. Rakesh Sharma','Signal Processing, SAR Data Processing, AI for Satellite Imaging','ECE','Assistant Professor Grade-I'),
  ('Dr. Aman Kumar','Digital Signal Processing, Biomedical Signal Analysis, ML/DNN','ECE','Assistant Professor Grade-I'),
  ('Dr. Amit Bage','RF & Microwave, Reconfigurable Antennas, Metamaterial Sensors','ECE','Assistant Professor Grade-I'),
  ('Dr. Sandeep Kumar Singh','Internet of Things, Communication Systems, Machine Learning','ECE','Assistant Professor Grade-I'),
  ('Gagnesh Kumar','Nano & Microelectronic Devices, Analog VLSI, Microprocessors','ECE','Assistant Professor Grade-II'),
  ('Er. Vinod Kumar','Semiconductor Device Modeling, VLSI Design','ECE','Assistant Professor Grade-II'),
  ('Dr. Sankalita Biswas','Wireless Sensor Networks, Cross-layer Energy Modeling','ECE','Assistant Professor Grade-II'),
  ('Dr. Poonam','Electronics and Communication','ECE','Assistant Professor Grade-II')
ON CONFLICT DO NOTHING;
