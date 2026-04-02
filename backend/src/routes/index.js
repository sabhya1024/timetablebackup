// src/routes/index.js
const express = require('express');
const router = express.Router();

const authCtrl     = require('../controllers/authController');
const ttCtrl       = require('../controllers/timetableController');
const absCtrl      = require('../controllers/absenceController');
const adminCtrl    = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const admin  = [authenticate, authorize('admin')];
const teacher = [authenticate, authorize('teacher', 'admin')];
const any    = [authenticate];

// ── Auth ─────────────────────────────────────────────────────
router.post('/auth/admin/register', authCtrl.adminRegister);
router.post('/auth/admin/login',    authCtrl.adminLogin);
router.post('/auth/teacher/login',  authCtrl.teacherLogin);

// ── Timetable (public reads, admin writes) ───────────────────
router.get   ('/timetable',          ttCtrl.getTimetable);
router.post  ('/timetable',          ...admin, ttCtrl.createEntry);
router.put   ('/timetable/:id',      ...admin, ttCtrl.updateEntry);
router.delete('/timetable/:id',      ...admin, ttCtrl.deleteEntry);
router.post  ('/timetable/generate', ...admin, ttCtrl.triggerGenerate);
router.get   ('/timetable/logs',     ...admin, ttCtrl.getGenerationLogs);
router.get   ('/timetable/conflicts',...admin, ttCtrl.getConflictLogs);

// ── Absences ─────────────────────────────────────────────────
router.post  ('/absences',              ...teacher, absCtrl.markAbsence);
router.get   ('/absences',              ...teacher, absCtrl.getAbsences);
router.delete('/absences/:id',          ...teacher, absCtrl.cancelAbsence);
router.get   ('/absences/substitutes',  ...teacher, absCtrl.getAvailableSubstitutes);

// ── Admin CRUD ────────────────────────────────────────────────
router.get   ('/stats',             ...admin, adminCtrl.getDashboardStats);

router.get   ('/teachers',          adminCtrl.getTeachers);
router.post  ('/teachers',          ...admin, adminCtrl.createTeacher);
router.put   ('/teachers/:id',      ...admin, adminCtrl.updateTeacher);
router.delete('/teachers/:id',      ...admin, adminCtrl.deleteTeacher);

router.get   ('/subjects',          adminCtrl.getSubjects);
router.post  ('/subjects',          ...admin, adminCtrl.createSubject);
router.put   ('/subjects/:id',      ...admin, adminCtrl.updateSubject);
router.delete('/subjects/:id',      ...admin, adminCtrl.deleteSubject);

router.get   ('/rooms',             adminCtrl.getRooms);
router.post  ('/rooms',             ...admin, adminCtrl.createRoom);
router.put   ('/rooms/:id',         ...admin, adminCtrl.updateRoom);
router.delete('/rooms/:id',         ...admin, adminCtrl.deleteRoom);

router.get   ('/sections',          adminCtrl.getSections);
router.post  ('/sections',          ...admin, adminCtrl.createSection);
router.put   ('/sections/:id',      ...admin, adminCtrl.updateSection);
router.delete('/sections/:id',      ...admin, adminCtrl.deleteSection);

router.get   ('/curriculum',        ...any, adminCtrl.getCurriculum);
router.post  ('/curriculum',        ...admin, adminCtrl.assignCurriculum);
router.delete('/curriculum/:id',    ...admin, adminCtrl.removeCurriculum);

module.exports = router;
