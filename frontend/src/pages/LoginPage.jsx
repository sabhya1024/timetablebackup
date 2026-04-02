// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const [role, setRole]         = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password, role);
      navigate(user.role === 'admin' ? '/admin' : '/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card fade-in-up">
        <div className="logo-area">
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🏛</div>
          <h1>TimetableMS</h1>
          <p>College Timetable Management System</p>
        </div>

        {/* Role toggle */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>
            Admin
          </button>
          <button className={`tab-btn ${role === 'teacher' ? 'active' : ''}`} onClick={() => setRole('teacher')}>
            Teacher
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder={role === 'admin' ? 'admin' : 'teacher.john'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</> : `Sign in as ${role}`}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/timetable')}
          >
            👁 View Timetable (Public)
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
