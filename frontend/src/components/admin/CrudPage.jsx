// src/components/admin/CrudPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

/**
 * Generic CRUD page component.
 * Props:
 *   title, endpoint, columns, formFields, emptyForm, buildRow
 */
export default function CrudPage({ title, icon, endpoint, columns, formFields, emptyForm, rowKey = 'id' }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal,   setModal]   = useState(false);
  const [form, setForm] = useState(emptyForm || {});
  const [editId,  setEditId]  = useState(null);
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [search,  setSearch]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      setRows(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

const openCreate = () => { setForm(emptyForm || {}); setEditId(null); setError(''); setModal(true); };
  const openEdit = (row) => {
    const f = {};
    formFields.forEach((field) => { f[field.name] = row[field.name] ?? ''; });
    setForm(f);
    setEditId(row[rowKey]);
    setError('');
    setModal(true);
  };

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      if (editId) await api.put(`${endpoint}/${editId}`, form);
      else        await api.post(endpoint, form);
      setModal(false);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const filtered = rows.filter((row) =>
    search === '' || JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div><h1>{icon} {title}</h1><p>Manage {title.toLowerCase()} records.</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add {title.slice(0, -1)}</button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 14 }}>
          <input
            className="form-input"
            style={{ maxWidth: 300 }}
            placeholder={`Search ${title.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading
          ? <div className="loading-center"><span className="spinner" /></div>
          : (
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No records found</td></tr>
                  : filtered.map((row) => (
                    <tr key={row[rowKey]}>
                      {columns.map((c) => (
                        <td key={c.key}>
                          {c.render ? c.render(row) : <span>{row[c.key] ?? '—'}</span>}
                        </td>
                      ))}
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row[rowKey])}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {Array.isArray(formFields) && formFields.map((field) => (
  <div className="form-group" key={field.name}>
    <label className="form-label">{field.label}</label>

    {field.type === 'select' ? (
      <select
        className="form-select"
        value={form?.[field.name] || ''}
        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
      >
        {field.required !== false && <option value="">— Select —</option>}
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    ) : field.type === 'textarea' ? (
      <textarea
        className="form-input"
        rows={3}
        value={form?.[field.name] || ''}
        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
      />
    ) : (
      <input
        className="form-input"
        type={field.type || 'text'}
        placeholder={field.placeholder}
        value={form?.[field.name] || ''}
        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
      />
    )}
  </div>
))}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
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
