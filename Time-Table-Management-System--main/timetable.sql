--
-- PostgreSQL database dump
--

\restrict fIx75dU8eQwU9EL6EXAXb9hCCYrkMavaPMXzsup6UxC7AjtQMeOzV2rol7H1w00

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-05 15:29:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 16480)
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    admin_id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16479)
-- Name: admins_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.admins ALTER COLUMN admin_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.admins_admin_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16420)
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_id integer NOT NULL,
    room_number text NOT NULL,
    capacity integer,
    type text,
    CONSTRAINT rooms_capacity_check CHECK ((capacity > 0)),
    CONSTRAINT rooms_type_check CHECK ((type = ANY (ARRAY['Lab'::text, 'Theory'::text])))
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16419)
-- Name: rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.rooms ALTER COLUMN room_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.rooms_room_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 16434)
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sections (
    section_id integer NOT NULL,
    year integer,
    branch text NOT NULL,
    section_name text NOT NULL,
    lunch_type character(1),
    CONSTRAINT sections_lunch_type_check CHECK ((lunch_type = ANY (ARRAY['A'::bpchar, 'B'::bpchar]))),
    CONSTRAINT sections_year_check CHECK (((year >= 1) AND (year <= 4)))
);


ALTER TABLE public.sections OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16433)
-- Name: sections_section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sections ALTER COLUMN section_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sections_section_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16408)
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    subject_id integer NOT NULL,
    subject_name text NOT NULL,
    credits integer,
    weekly_hours integer,
    CONSTRAINT subjects_credits_check CHECK ((credits > 0)),
    CONSTRAINT subjects_weekly_hours_check CHECK ((weekly_hours > 0))
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16407)
-- Name: subjects_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.subjects ALTER COLUMN subject_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.subjects_subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16398)
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    teacher_id integer NOT NULL,
    name text NOT NULL,
    specialization text,
    dept_name text,
    designation text
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16397)
-- Name: teachers_teacher_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.teachers ALTER COLUMN teacher_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.teachers_teacher_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 16447)
-- Name: timetable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetable (
    entry_id integer NOT NULL,
    day text,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    teacher_id integer,
    subject_id integer,
    room_id integer,
    section_id integer,
    CONSTRAINT timetable_check CHECK ((end_time > start_time)),
    CONSTRAINT timetable_day_check CHECK ((day = ANY (ARRAY['Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text, 'Saturday'::text])))
);


ALTER TABLE public.timetable OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16446)
-- Name: timetable_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.timetable ALTER COLUMN entry_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.timetable_entry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5067 (class 0 OID 16480)
-- Dependencies: 230
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (admin_id, username, password_hash) FROM stdin;
\.


--
-- TOC entry 5061 (class 0 OID 16420)
-- Dependencies: 224
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (room_id, room_number, capacity, type) FROM stdin;
1	G1	200	Theory
2	G2	200	Theory
3	G3	100	Theory
4	G4	100	Theory
5	G5	100	Theory
6	G6	100	Theory
7	F1	200	Theory
8	F2	200	Theory
9	F3	100	Theory
10	F4	100	Theory
11	F5	100	Theory
12	F6	100	Theory
13	S1	200	Theory
14	S2	200	Theory
15	S3	100	Theory
16	S4	100	Theory
17	S5	100	Theory
18	S6	100	Theory
\.


--
-- TOC entry 5063 (class 0 OID 16434)
-- Dependencies: 226
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sections (section_id, year, branch, section_name, lunch_type) FROM stdin;
1	3	CSE	CS3	A
2	3	CSE	CD3	B
3	3	ECE	EC3	A
4	3	ECE	ED3	B
\.


--
-- TOC entry 5059 (class 0 OID 16408)
-- Dependencies: 222
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (subject_id, subject_name, credits, weekly_hours) FROM stdin;
1	Digital Image Processing	3	3
2	Database Management Systems	3	3
3	Software Engineering	2	2
4	Discipline Elective III	3	3
5	Discipline Elective IV	3	3
6	Stream Core I	2	2
7	Engineering Economics and Accountancy	2	2
8	Digital Image Processing Lab	1	1
9	Database Management Systems Lab	1	1
\.


--
-- TOC entry 5057 (class 0 OID 16398)
-- Dependencies: 220
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teachers (teacher_id, name, specialization, dept_name, designation) FROM stdin;
1	Prof. Lalit Kumar Awasthi	Mobile Distributed Systems, Fault Tolerance, Sensor Networks, Network Security	CSE	Professor
2	Dr. Kamlesh Dutta	Computer Science & Engineering	CSE	Associate Professor
3	Dr. T P Sharma	Distributed Systems, Wireless Sensor Networks, MANETs, VANETs	CSE	Associate Professor
4	Dr. Siddhartha Chauhan	Computer Science & Engineering	CSE	Associate Professor (HoD)
5	Dr. Naveen Chauhan	Mobile Wireless Networks, IoT, Vehicular Networks	CSE	Associate Professor
6	Dr. Pardeep Singh	Natural Language Processing, Artificial Intelligence	CSE	Associate Professor
7	Dr. Rajeev Kumar	Computer Networks, Wireless Networks, IoT	CSE	Assistant Professor Grade-I
8	Dr. Nitin Gupta	Wireless Networks, Cognitive Radio, IoT, Fog Computing	CSE	Assistant Professor Grade-I
9	Dr. Dharmendra Prasad Mahato	Distributed Computing	CSE	Assistant Professor Grade-I
10	Dr. Arun Kumar Yadav	Information Retrieval, Machine Learning, Database Indexing	CSE	Assistant Professor Grade-I
11	Dr. Priyanka	Adhoc Networks, Wireless Sensor Networks, IoT	CSE	Assistant Professor Grade-I
12	Dr. Jyoti Srivastava	Natural Language Processing, Artificial Intelligence	CSE	Assistant Professor Grade-I
13	Dr. Sangeeta Sharma	Cloud Computing, Virtualization	CSE	Assistant Professor Grade-I
14	Dr. Mohit Kumar	Artificial Intelligence, Machine Learning, Speech Processing	CSE	Assistant Professor Grade-I
15	Dr. Mohammad Khalid Pandit	Deep Learning, Edge Computing, Machine Learning	CSE	Assistant Professor Grade-II
16	Dr. Ajay Kumar Mallick	Computer Vision, Machine Learning, Image Processing	CSE	Assistant Professor Grade-II
17	Dr. Ram Prakash Sharma	Explainable AI, Deep Learning, Biometric Security	CSE	Assistant Professor Grade-II
18	Dr. Robin Singh Bhadoria	Service-Oriented Architecture, Big Data Analytics, IoT	CSE	Assistant Professor Grade-II
19	Prof. (Mrs.) Rajeevan Chandel	Low Power VLSI Design, Modeling & Simulation	ECE	Professor
20	Kumar S Pandey	Embedded Systems	ECE	Associate Professor
21	Dr. Surender Soni	Communication, Wireless Sensor Networks	ECE	Associate Professor
22	Dr. Ashok Kumar	Wireless Sensor Networks, Wireless Communication	ECE	Associate Professor
23	Dr. (Mrs.) Gargi Khanna	Low Power VLSI Design, MEMS Design	ECE	Associate Professor
24	Dr. Ashwani Kumar Rana	Low Power VLSI, Device Modeling	ECE	Associate Professor
25	Dr. Krishan Kumar	Wireless Communication, 5G/6G, IoT, Machine Learning	ECE	Associate Professor
26	Dr. Manoranjan Rai Bharti	Communication Systems, Signal Processing, Wireless Communications	ECE	Associate Professor
27	Dr. Philemon Daniel	Deep Learning, NLP, Embedded Systems, VLSI Design	ECE	Associate Professor
28	Dr. Rohit Dhiman	Electronics and Communication	ECE	Associate Professor
29	Dr. Mahesh Angira	MEMS, RF-MEMS, RF-Microelectronics	ECE	Associate Professor
30	Dr. Pushpendra Singh	Signal Modeling, Machine Learning, Image Processing, Biomedical Signal Processing	ECE	Assistant Professor Grade-I
31	Dr. Saurabh Kumar	Antenna Design, RF & Microwave, Metamaterials, THz Communication	ECE	Assistant Professor Grade-I
32	Dr. Chandra Shekhar Prasad	THz Antennas, Metasurfaces, MIMO Antennas, Cognitive Radio	ECE	Assistant Professor Grade-I
33	Dr. Abhijit Bhattacharyya	Digital Signal Processing, Deep Learning, Biomedical Signal Processing	ECE	Assistant Professor Grade-I
34	Dr. Rakesh Sharma	Signal Processing, SAR Data Processing, AI for Satellite Imaging	ECE	Assistant Professor Grade-I
35	Dr. Aman Kumar	Digital Signal Processing, Biomedical Signal Analysis, ML/DNN	ECE	Assistant Professor Grade-I
36	Dr. Amit Bage	RF & Microwave, Reconfigurable Antennas, Metamaterial Sensors	ECE	Assistant Professor Grade-I
37	Dr. Sandeep Kumar Singh	Internet of Things, Communication Systems, Machine Learning	ECE	Assistant Professor Grade-I
38	Gagnesh Kumar	Nano & Microelectronic Devices, Analog VLSI, Microprocessors	ECE	Assistant Professor Grade-II
39	Er. Vinod Kumar	Semiconductor Device Modeling, VLSI Design	ECE	Assistant Professor Grade-II
40	Dr. Sankalita Biswas	Wireless Sensor Networks, Cross-layer Energy Modeling	ECE	Assistant Professor Grade-II
41	Dr. Poonam	Electronics and Communication	ECE	Assistant Professor Grade-II
\.


--
-- TOC entry 5065 (class 0 OID 16447)
-- Dependencies: 228
-- Data for Name: timetable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timetable (entry_id, day, start_time, end_time, teacher_id, subject_id, room_id, section_id) FROM stdin;
\.


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 229
-- Name: admins_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_admin_id_seq', 1, false);


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 223
-- Name: rooms_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rooms_room_id_seq', 18, true);


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 225
-- Name: sections_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sections_section_id_seq', 4, true);


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 221
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_subject_id_seq', 9, true);


--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 219
-- Name: teachers_teacher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teachers_teacher_id_seq', 41, true);


--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 227
-- Name: timetable_entry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.timetable_entry_id_seq', 1, false);


--
-- TOC entry 4902 (class 2606 OID 16489)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 4904 (class 2606 OID 16491)
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- TOC entry 4894 (class 2606 OID 16430)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- TOC entry 4896 (class 2606 OID 16432)
-- Name: rooms rooms_room_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_number_key UNIQUE (room_number);


--
-- TOC entry 4898 (class 2606 OID 16445)
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (section_id);


--
-- TOC entry 4892 (class 2606 OID 16418)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- TOC entry 4890 (class 2606 OID 16406)
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (teacher_id);


--
-- TOC entry 4900 (class 2606 OID 16458)
-- Name: timetable timetable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_pkey PRIMARY KEY (entry_id);


--
-- TOC entry 4905 (class 2606 OID 16469)
-- Name: timetable timetable_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- TOC entry 4906 (class 2606 OID 16474)
-- Name: timetable timetable_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(section_id) ON DELETE CASCADE;


--
-- TOC entry 4907 (class 2606 OID 16464)
-- Name: timetable timetable_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;


--
-- TOC entry 4908 (class 2606 OID 16459)
-- Name: timetable timetable_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(teacher_id) ON DELETE CASCADE;


-- Completed on 2026-02-05 15:29:59

--
-- PostgreSQL database dump complete
--

\unrestrict fIx75dU8eQwU9EL6EXAXb9hCCYrkMavaPMXzsup6UxC7AjtQMeOzV2rol7H1w00

