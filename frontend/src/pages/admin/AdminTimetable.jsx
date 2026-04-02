// src/pages/admin/AdminTimetable.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import TimetableGrid from '../../components/shared/TimetableGrid';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SLOTS = [
  '09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00',
];

const emptyForm = { day:'Monday', start_time:'09:00', end_time:'10:00', teacher_id:'', subject_id:'', room_id:'', section_id:'' };

export default function AdminTimetable() {
  const [sections,  setSections]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [rooms,     setRooms]     = useState([]);
  const [entries,   setEntries]   = useState([]);
  const [sectionId, setSectionId] = useState('');
  const [lunchType, setLunchType] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [modal,     setModal]     = useState(null); // null | 'create' | 'edit'
  const [form,      setForm]      = useState(emptyForm);
  const [editId,    setEditId]    = useState(null);
  const [error,     setError]     = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/sections'), api.get('/teachers'),
      api.get('/subjects'), api.get('/rooms'),
    ]).then(([s, t, sub, r]) => {
      setSections(s.data.data);
      setTeachers(t.data.data);
      setSubjects(sub.data.data);
      setRooms(r.data.data);
    });
  }, []);

  const load = useCallback(async () => {
    if (!sectionId) return;
    setLoading(true);
    const sec = sections.find((s) => String(s.section_id) === String(sectionId));
    setLunchType(sec?.lunch_type?.trim() || null);
    try {
      const { data } = await api.get('/timetable', { params: { section_id: sectionId } });
      setEntries(data.data);
    } finally { setLoading(false); }
  }, [sectionId, sections]);

  useEffect(() => { load(); }, [load]);

  const openCreate = ({ day, start }) => {
    setForm({ ...emptyForm, day, start_time: start, end_time: `${String(parseInt(start)+1).padStart(2,'0')}:00`, section_id: sectionId });
    setEditId(null);
    setError('');
    setModal('edit');
  };

  const openEdit = (entry) => {
    setForm({
      day: entry.day,
      start_time: entry.start_time.slice(0,5),
      end_time: entry.end_time.slice(0,5),
      teacher_id: entry.teacher_id,
      subject_id: entry.subject_id,
      room_id: entry.room_id,
      section_id: entry.section_id,
    });
    setEditId(entry.entry_id);
    setError('');
    setModal('edit');
  };

  const handleCellClick = ({ day, start, entry }) => {
    if (entry) openEdit(entry);
    else if (sectionId) openCreate({ day, start });
  };

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        end_time: `${String(parseInt(form.start_time)+1).padStart(2,'0')}:00`,
      };
      if (editId) await api.put(`/timetable/${editId}`, payload);
      else        await api.post('/timetable', payload);
      setModal(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!editId || !window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/timetable/${editId}`);
      setModal(null);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Delete failed'); }
  };

  const sec = sections.find((s) => String(s.section_id) === String(sectionId));
  const exportTitle = sec ? `Timetable_${sec.section_name}` : 'Timetable';

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1>Timetable Manager</h1>
          <p>Click a cell to edit an entry, or an empty cell to create one.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToPDF(entries, exportTitle)}>↓ PDF</button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToExcel(entries, exportTitle)}>↓ Excel</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters-bar">
          <div>
            <label className="form-label">Section</label>
            <select className="form-select" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              <option value="">— Select Section —</option>
              {sections.map((s) => (
                <option key={s.section_id} value={s.section_id}>{s.section_name} ({s.branch})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="loading-center"><span className="spinner" />Loading…</div>}

      {!loading && (
        <div className="card">
          <TimetableGrid entries={entries} lunchType={lunchType} onCellClick={handleCellClick} />
        </div>
      )}

      {/* Edit/Create Modal */}
      {modal === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Entry' : 'New Entry'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Day</label>
                <select className="form-select" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <select className="form-select" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}>
                  {SLOTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Section</label>
              <select className="form-select" value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value })}>
                <option value="">— Select —</option>
                {sections.map((s) => <option key={s.section_id} value={s.section_id}>{s.section_name} ({s.branch})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
                <option value="">— Select —</option>
                {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Teacher</label>
              <select className="form-select" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
                <option value="">— Select —</option>
                {teachers.map((t) => <option key={t.teacher_id} value={t.teacher_id}>{t.name} ({t.dept_name})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Room</label>
              <select className="form-select" value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })}>
                <option value="">— Select —</option>
                {rooms.map((r) => <option key={r.room_id} value={r.room_id}>{r.room_number} ({r.type}, cap {r.capacity})</option>)}
              </select>
            </div>

            <div className="modal-footer">
              {editId && <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>}
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
