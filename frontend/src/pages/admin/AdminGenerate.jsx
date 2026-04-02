// src/pages/admin/AdminGenerate.jsx
import React, { useState } from 'react';
import api from '../../utils/api';

export default function AdminGenerate() {
  const [clearExisting, setClearExisting] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState('');

  const handleGenerate = async () => {
    if (!window.confirm(clearExisting ? 'This will DELETE the existing timetable and regenerate. Continue?' : 'Append new entries to existing timetable?')) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const { data } = await api.post('/timetable/generate', { clearExisting });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Generation failed. Check curriculum setup.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1>Generate Timetable</h1>
          <p>Runs the Greedy CSP scheduling algorithm across all sections.</p>
        </div>
      </div>

      {/* Algorithm explainer */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Algorithm: Greedy CSP</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { step: '1', title: 'Load Data', desc: 'Fetch sections, subjects, teachers, rooms, and curriculum map from DB.' },
            { step: '2', title: 'Build Slot Universe', desc: 'Generate all Mon–Sat × 9AM–5PM slots. Remove lunch slot per section lunch_type (A→12–1, B→1–2).' },
            { step: '3', title: 'Sort Hardest-First', desc: 'Order requirements by weekly_hours descending so constrained subjects are placed before easy ones.' },
            { step: '4', title: 'Greedy Assign', desc: 'Iterate slots round-robin per section. Check teacher, room, section conflicts. Pick first valid slot + room.' },
            { step: '5', title: 'Persist & Log', desc: 'Bulk INSERT all entries in one transaction. Write generation log with conflict details.' },
          ].map((s) => (
            <div key={s.step} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.7rem', marginBottom: 4 }}>STEP {s.step}</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{s.title}</div>
              <div className="text-muted text-sm">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints checklist */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Constraints Enforced</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            '✓ No teacher double-booking',
            '✓ No room double-booking',
            '✓ No section double-booking',
            '✓ Lunch break per section type',
            '✓ Room type match (Lab/Theory)',
            '✓ Weekly hours fulfilled',
            '✓ Transaction-safe inserts',
            '✓ Conflict logging',
          ].map((c) => (
            <span key={c} className="badge badge-green" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Pre-requisites */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <div>
          <strong>Pre-requisites before generating:</strong>
          <ol style={{ marginTop: 6, paddingLeft: 18, lineHeight: 2 }}>
            <li>Teachers are created (Admin → Teachers)</li>
            <li>Subjects are created (Admin → Subjects)</li>
            <li>Sections are created with lunch_type (Admin → Sections)</li>
            <li>Rooms are available (Admin → Rooms)</li>
            <li>Curriculum is set up: each section assigned its subjects + teacher (Admin → Curriculum)</li>
          </ol>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
            />
            Clear existing timetable before generating
          </label>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Generating…</> : '⚡ Generate Timetable Now'}
        </button>

        {/* Result */}
        {result && (
          <div className="fade-in-up" style={{ marginTop: 24 }}>
            <div className={`alert alert-${result.conflicts?.length > 0 ? 'warning' : 'success'}`}>
              <div>
                <strong>{result.conflicts?.length > 0 ? '⚠ Partial Success' : '✓ Timetable Generated Successfully'}</strong>
                <p style={{ marginTop: 4 }}>
                  Created <strong>{result.entriesCreated}</strong> entries • {result.conflicts?.length || 0} conflicts • Log ID #{result.logId}
                </p>
              </div>
            </div>

            {result.conflicts?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 8, fontSize: '0.875rem', fontWeight: 700 }}>Conflict Details:</h4>
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {result.conflicts.map((c, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: 6, borderLeft: '3px solid var(--amber)' }}>
                      <span className="badge badge-amber" style={{ marginRight: 8 }}>{c.type}</span>
                      <span className="text-sm text-muted">{c.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
