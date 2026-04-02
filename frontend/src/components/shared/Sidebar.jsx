// src/components/shared/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const adminLinks = [
  { label: 'Dashboard',   path: '/admin',             icon: '◈' },
  { label: 'Timetable',   path: '/admin/timetable',   icon: '⊞' },
  { label: 'Generate',    path: '/admin/generate',     icon: '⚡' },
  { label: 'Teachers',    path: '/admin/teachers',     icon: '👤' },
  { label: 'Subjects',    path: '/admin/subjects',     icon: '📘' },
  { label: 'Rooms',       path: '/admin/rooms',        icon: '🏛' },
  { label: 'Sections',    path: '/admin/sections',     icon: '🎓' },
  { label: 'Curriculum',  path: '/admin/curriculum',   icon: '📋' },
  { label: 'Absences',    path: '/admin/absences',     icon: '📅' },
  { label: 'Conflict Log',path: '/admin/conflicts',    icon: '⚠' },
];

const teacherLinks = [
  { label: 'My Schedule',  path: '/teacher',           icon: '⊞' },
  { label: 'Mark Absence', path: '/teacher/absence',   icon: '📅' },
  { label: 'My Absences',  path: '/teacher/my-absences',icon: '📋' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = user?.role === 'admin' ? adminLinks : teacherLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>TimeTable<br />Manager</h2>
        <span>{user?.role === 'admin' ? 'Admin Portal' : 'Teacher Portal'}</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {links.map((link) => (
          <button
            key={link.path}
            className={`nav-item ${pathname === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <strong>{user?.name || user?.username}</strong>
        {user?.dept || user?.role}
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 8, width: '100%' }}
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
