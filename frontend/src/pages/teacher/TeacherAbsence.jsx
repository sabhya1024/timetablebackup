// src/pages/teacher/TeacherAbsence.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';

export default function TeacherAbsence() {
  const { user }     = useAuth();
  const [date,       setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [mySlots,    setMySlots]    = useState([]);
  const [selected,   setSelected]   = useState([]);
  const [status,     setStatus]     = useState('absent');
  const [subId,      setSubId]      = useState('');
  const [subs,       setSubs]       = useState([]);
  const [note,       setNote]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  // Load teacher's slots for the given date's day-of-week
  useEffect(() => {
    if (!user?.id || !date) return;
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    api.get('/timetable', { params: { teacher_id: user.id, day } })
      .then((r) => setMySlots(r.data.data));
  }, [user, date]);

  // Load available substitutes for first selected slot
  useEffect(() => {
    if (status !== 'substitute' || selected.length === 0) { setSubs([]); return; }
    api.get('/absences/substitutes', { params: { entry_id: selected[0], date } })
      .then((r) => setSubs(r.data.data))
      .catch(() => setSubs([]));
  }, [status, selected, date]);

  const toggleSlot = (id) => setSelected((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );

  const handleSubmit = async () => {
    if (!date) { setError('Select a date'); return; }
    setError(''); setSuccess(''); setSaving(true);
    try {
      await api.post('/absences', {
        absence_date: date,
        timetable_entries: selected.length > 0 ? selected : [null],
        status,
        substitute_id: status === 'substitute' ? subId || undefined : undefined,
        note,
      });
      setSuccess(`Absence marked successfully for ${date}`);
      setSelected([]);
      setNote('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to mark absence');
    } finally { setSaving(false); }
  };

  const dayName = date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }) : '';

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div><h1>Mark Absence</h1><p>Record your absence and optionally set lecture status.</p></div>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✓ {success}</div>}

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="form-group">
          <label className="form-label">Absence Date</label>
          <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {/* Show teacher's slots for that day */}
        {mySlots.length > 0 && (
          <div className="form-group">
            <label className="form-label">Select Affected Lectures ({dayName})</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mySlots.map((slot) => (
                <label
                  key={slot.entry_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: selected.includes(slot.entry_id) ? 'var(--accent-glow)' : 'var(--bg)',
                    border: `1px solid ${selected.includes(slot.entry_id) ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(slot.entry_id)}
                    onChange={() => toggleSlot(slot.entry_id)}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>{slot.subject_name}</strong>
                    <div className="text-muted text-sm">{slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)} · {slot.room_number} · {slot.section_name}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {mySlots.length === 0 && date && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            No lectures scheduled on {dayName}. You can still mark a full-day absence.
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Lecture Status</label>
          <div className="tabs">
            {['absent', 'cancelled', 'substitute'].map((s) => (
              <button key={s} className={`tab-btn ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
                {s === 'absent' ? '🔴 Absent' : s === 'cancelled' ? '🟡 Cancel' : '🔵 Substitute'}
              </button>
            ))}
          </div>
          <p className="text-muted text-sm" style={{ marginTop: 6 }}>
            {status === 'absent'     && 'Class will appear as cancelled. No substitute assigned.'}
            {status === 'cancelled'  && 'Lecture is officially cancelled for this date.'}
            {status === 'substitute' && 'Assign another available teacher to take the lecture.'}
          </p>
        </div>

        {status === 'substitute' && subs.length > 0 && (
          <div className="form-group">
            <label className="form-label">Available Substitute</label>
            <select className="form-select" value={subId} onChange={(e) => setSubId(e.target.value)}>
              <option value="">— Select Substitute —</option>
              {subs.map((t) => (
                <option key={t.teacher_id} value={t.teacher_id}>{t.name} ({t.dept_name} — {t.designation})</option>
              ))}
            </select>
          </div>
        )}

        {status === 'substitute' && subs.length === 0 && selected.length > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            No available substitutes for this slot (all teachers are busy or absent).
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Note (optional)</label>
          <input
            className="form-input"
            placeholder="e.g. Medical leave, conference…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button className="btn btn-primary btn-lg w-full" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Submitting…' : '✓ Submit Absence'}
        </button>
      </div>
    </div>
  );
}
