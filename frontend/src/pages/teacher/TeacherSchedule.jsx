// src/pages/teacher/TeacherSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import TimetableGrid from '../../components/shared/TimetableGrid';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

export default function TeacherSchedule() {
  const { user }   = useAuth();
  const [entries,  setEntries]  = useState([]);
  const [date,     setDate]     = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const params = { teacher_id: user.id };
    if (date) params.date = date;
    api.get('/timetable', { params })
      .then((r) => setEntries(r.data.data))
      .finally(() => setLoading(false));
  }, [user, date]);

  const exportTitle = `MySchedule_${user?.name?.replace(/\s+/g, '_')}`;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1>My Schedule</h1>
          <p>{user?.name} — {user?.dept}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToPDF(entries, exportTitle)}>↓ PDF</button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToExcel(entries, exportTitle)}>↓ Excel</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters-bar">
          <div>
            <label className="form-label">Date (absence overlay)</label>
            <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      {loading
        ? <div className="loading-center"><span className="spinner" /></div>
        : (
          <div className="card">
            {entries.length === 0
              ? <div style={{ textAlign: 'center', padding: 48 }}><p className="text-muted">No schedule entries found for your account.</p></div>
              : <TimetableGrid entries={entries} />
            }
          </div>
        )}
    </div>
  );
}
