// src/pages/admin/AdminAbsences.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminAbsences() {
  const [absences, setAbsences] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate)   params.to   = toDate;
      const { data } = await api.get('/absences', { params });
      setAbsences(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const statusBadge = (s) => {
    const map = { absent: 'badge-red', cancelled: 'badge-amber', substitute: 'badge-teal' };
    return <span className={`badge ${map[s] || 'badge-blue'}`}>{s}</span>;
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1>📅 Absences</h1>
          <p>All teacher absence records. Teachers manage their own absences from their portal.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters-bar">
          <div><label className="form-label">From</label><input className="form-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
          <div><label className="form-label">To</label><input className="form-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
          <div style={{ alignSelf: 'flex-end' }}><button className="btn btn-secondary" onClick={load}>Apply Filter</button></div>
        </div>
      </div>

      <div className="card">
        {loading
          ? <div className="loading-center"><span className="spinner" /></div>
          : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Teacher</th>
                  <th>Subject</th>
                  <th>Slot</th>
                  <th>Status</th>
                  <th>Substitute</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {absences.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No absence records found.</td></tr>
                  : absences.map((a) => (
                    <tr key={a.absence_id}>
                      <td><strong>{a.absence_date}</strong></td>
                      <td>{a.teacher_name}</td>
                      <td>{a.subject_name || '—'}</td>
                      <td>{a.day ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{a.day} {a.start_time?.slice(0,5)}</span> : '—'}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>{a.substitute_name || '—'}</td>
                      <td className="text-muted text-sm">{a.note || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
