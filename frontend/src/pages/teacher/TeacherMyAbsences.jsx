// src/pages/teacher/TeacherMyAbsences.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function TeacherMyAbsences() {
  const [absences, setAbsences] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/absences');
      setAbsences(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this absence record?')) return;
    await api.delete(`/absences/${id}`);
    load();
  };

  const statusBadge = (s) => {
    const map = { absent: 'badge-red', cancelled: 'badge-amber', substitute: 'badge-teal' };
    return <span className={`badge ${map[s] || 'badge-blue'}`}>{s}</span>;
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div><h1>My Absences</h1><p>Your absence history.</p></div>
      </div>

      <div className="card">
        {loading
          ? <div className="loading-center"><span className="spinner" /></div>
          : (
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Subject</th><th>Slot</th><th>Status</th><th>Substitute</th><th>Note</th><th></th></tr>
              </thead>
              <tbody>
                {absences.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No absence records.</td></tr>
                  : absences.map((a) => (
                    <tr key={a.absence_id}>
                      <td><strong>{a.absence_date}</strong></td>
                      <td>{a.subject_name || '—'}</td>
                      <td>{a.day ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{a.day} {a.start_time?.slice(0,5)}</span> : '—'}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>{a.substitute_name || '—'}</td>
                      <td className="text-muted text-sm">{a.note || '—'}</td>
                      <td>
                        {new Date(a.absence_date) >= new Date(new Date().toDateString()) && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.absence_id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
