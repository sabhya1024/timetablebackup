// src/pages/admin/AdminConflicts.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminConflicts() {
  const [logs,      setLogs]      = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [logId,     setLogId]     = useState('');

  useEffect(() => {
    api.get('/timetable/logs').then((r) => setLogs(r.data.data));
    api.get('/timetable/conflicts').then((r) => setConflicts(r.data.data));
  }, []);

  const filtered = logId ? conflicts.filter((c) => String(c.log_id) === logId) : conflicts;

  const typeBadge = (t) => {
    const map = { NO_ROOM: 'badge-red', UNFULFILLED_HOURS: 'badge-amber', TEACHER_CONFLICT: 'badge-red' };
    return <span className={`badge ${map[t] || 'badge-blue'}`}>{t}</span>;
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div><h1>⚠ Conflict Logs</h1><p>Scheduling conflicts detected during timetable generation.</p></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters-bar">
          <div>
            <label className="form-label">Filter by Generation Run</label>
            <select className="form-select" value={logId} onChange={(e) => setLogId(e.target.value)}>
              <option value="">All Runs</option>
              {logs.map((l) => (
                <option key={l.log_id} value={l.log_id}>
                  #{l.log_id} — {new Date(l.generated_at).toLocaleString()} ({l.conflicts_found} conflicts)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <p className="text-muted">No conflicts found. Your timetable generated cleanly!</p>
            </div>
          )
          : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Run #</th><th>Type</th><th>Day</th><th>Time</th><th>Description</th><th>Logged At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.conflict_id}>
                    <td className="text-muted text-sm">#{c.conflict_id}</td>
                    <td><span className="badge badge-blue">#{c.log_id}</span></td>
                    <td>{typeBadge(c.conflict_type)}</td>
                    <td>{c.day || '—'}</td>
                    <td>{c.start_time ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.start_time.slice(0,5)}</span> : '—'}</td>
                    <td className="text-muted text-sm" style={{ maxWidth: 340 }}>{c.description}</td>
                    <td className="text-muted text-sm">{new Date(c.logged_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
