// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles/global.css';

// Pages
import LoginPage           from './pages/LoginPage';
import PublicTimetablePage from './pages/PublicTimetablePage';
import Sidebar             from './components/shared/Sidebar';

// Admin pages
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminTimetable  from './pages/admin/AdminTimetable';
import AdminGenerate   from './pages/admin/AdminGenerate';
import AdminTeachers   from './pages/admin/AdminTeachers';
import AdminCurriculum from './pages/admin/AdminCurriculum';
import AdminAbsences   from './pages/admin/AdminAbsences';
import AdminConflicts  from './pages/admin/AdminConflicts';
import { AdminSubjects, AdminRooms, AdminSections } from './pages/admin/AdminEntities';

// Teacher pages
import TeacherSchedule   from './pages/teacher/TeacherSchedule';
import TeacherAbsence    from './pages/teacher/TeacherAbsence';
import TeacherMyAbsences from './pages/teacher/TeacherMyAbsences';

// ── Protected shell ───────────────────────────────────────────
function AppShell({ requiredRole, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Navigate to="/timetable" replace />} />
          <Route path="/timetable" element={<PublicTimetablePage />} />
          <Route path="/login"     element={<LoginPage />} />

          {/* Admin */}
          <Route path="/admin"            element={<AppShell requiredRole="admin"><AdminDashboard /></AppShell>} />
          <Route path="/admin/timetable"  element={<AppShell requiredRole="admin"><AdminTimetable /></AppShell>} />
          <Route path="/admin/generate"   element={<AppShell requiredRole="admin"><AdminGenerate /></AppShell>} />
          <Route path="/admin/teachers"   element={<AppShell requiredRole="admin"><AdminTeachers /></AppShell>} />
          <Route path="/admin/subjects"   element={<AppShell requiredRole="admin"><AdminSubjects /></AppShell>} />
          <Route path="/admin/rooms"      element={<AppShell requiredRole="admin"><AdminRooms /></AppShell>} />
          <Route path="/admin/sections"   element={<AppShell requiredRole="admin"><AdminSections /></AppShell>} />
          <Route path="/admin/curriculum" element={<AppShell requiredRole="admin"><AdminCurriculum /></AppShell>} />
          <Route path="/admin/absences"   element={<AppShell requiredRole="admin"><AdminAbsences /></AppShell>} />
          <Route path="/admin/conflicts"  element={<AppShell requiredRole="admin"><AdminConflicts /></AppShell>} />

          {/* Teacher */}
          <Route path="/teacher"              element={<AppShell requiredRole="teacher"><TeacherSchedule /></AppShell>} />
          <Route path="/teacher/absence"      element={<AppShell requiredRole="teacher"><TeacherAbsence /></AppShell>} />
          <Route path="/teacher/my-absences"  element={<AppShell requiredRole="teacher"><TeacherMyAbsences /></AppShell>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/timetable" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
