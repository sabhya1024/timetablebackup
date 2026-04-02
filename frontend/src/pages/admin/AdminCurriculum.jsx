// src/pages/admin/AdminCurriculum.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

export default function AdminCurriculum() {
  const [sections,    setSections]    = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [teachers,    setTeachers]    = useState([]);
  const [curriculum,  setCurriculum]  = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [filterSec,   setFilterSec]   = useState('');
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState({ section_id: '', subject_id: '', teacher_id: '' });
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    Promise.all([api.get('/sections'), api.get('/subjects'), api.get('/teachers')]).then(([s, sub, t]) => {
      setSections(s.data.data);
      setSubjects(sub.data.data);
      setTeachers(t.data.data);
    });
  }, []);

  const loadCurriculum = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterSec ? { section_id: filterSec } : {};
      const { data } = await api.get('/curriculum', { params });
      setCurriculum(data.data);
    } finally { setLoading(false); }
  }, [filterSec]);

  useEffect(() => { loadCurriculum(); }, [loadCurriculum]);

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      await api.post('/curriculum', form);
      setModal(false);
      loadCurriculum();
    } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this curriculum entry?')) return;
    await api.delete(`/curriculum/${id}`);
    loadCurriculum();
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1>📋 Curriculum</h1>
          <p>Assign subjects and teachers to sections. This drives timetable generation.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ section_id: filterSec || '', subject_id: '', teacher_id: '' }); setError(''); setModal(true); }}>
          + Assign Subject
        </button>
      </div>

      <div className="card">
        <div className="filters-bar" style={{ marginBottom: 14 }}>
          <div>
            <label className="form-label">Filter by Section</label>
            <select className="form-select" value={filterSec} onChange={(e) => setFilterSec(e.target.value)}>
              <option value="">All Sections</option>
              {sections.map((s) => <option key={s.section_id} value={s.section_id}>{s.section_name} ({s.branch})</option>)}
            </select>
          </div>
        </div>

        {loading
          ? <div className="loading-center"><span className="spinner" /></div>
          : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Subject</th>
                  <th>Credits</th>
                  <th>Weekly Hours</th>
                  <th>Assigned Teacher</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {curriculum.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No curriculum entries. Add some to enable timetable generation.</td></tr>
                  : curriculum.map((row) => (
                    <tr key={row.id}>
                      <td><span className="badge badge-blue">{row.section_name}</span></td>
                      <td><strong>{row.subject_name}</strong></td>
                      <td><span className="badge badge-teal">{row.credits} cr</span></td>
                      <td><span className="badge badge-amber">{row.weekly_hours} hr/wk</span></td>
                      <td>{row.teacher_name || <span className="text-muted">— Unassigned —</span>}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Subject to Section</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Section</label>
              <select className="form-select" value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value })}>
                <option value="">— Select —</option>
                {sections.map((s) => <option key={s.section_id} value={s.section_id}>{s.section_name} — {s.branch} Year {s.year}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
                <option value="">— Select —</option>
                {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.subject_name} ({s.weekly_hours} hr/wk)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Teacher (optional — assign later)</label>
              <select className="form-select" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
                <option value="">— Select —</option>
                {teachers.map((t) => <option key={t.teacher_id} value={t.teacher_id}>{t.name} ({t.dept_name})</option>)}
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.section_id || !form.subject_id}>
                {saving ? 'Saving…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
