// src/pages/PublicTimetablePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TimetableGrid from '../components/shared/TimetableGrid';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

function PublicTimetablePage() {
  const [sections,    setSections]   = useState([]);
  const [entries,     setEntries]    = useState([]);
  const [sectionId,   setSectionId]  = useState('');
  const [date,        setDate]       = useState('');
  const [lunchType,   setLunchType]  = useState(null);
  const [loading,     setLoading]    = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchSections = async () => {
    try {
      const res = await api.get('/sections');
      setSections(res.data.data);
    } catch (err) {
      console.error("Sections error:", err);
    }
  };

  fetchSections();
}, []);

  useEffect(() => {
    if (!sectionId) return;
    const sec = sections.find((s) => String(s.section_id) === String(sectionId));
    setLunchType(sec?.lunch_type?.trim() || null);
    fetchTimetable();
    // eslint-disable-next-line
  }, [sectionId, date]);

  const fetchTimetable = async () => {
    if (!sectionId) return;
    setLoading(true);
    try {
      const params = { section_id: sectionId };
      if (date) params.date = date;
      const { data } = await api.get('/timetable', { params });
      setEntries(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedSection = sections.find((s) => String(s.section_id) === String(sectionId));
  const exportTitle = selectedSection
    ? `Timetable_${selectedSection.section_name}_${selectedSection.branch}`
    : 'Timetable';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-4" style={{ marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>
              🏛 College Timetable
            </h1>
            <p className="text-muted text-sm">Select your section to view the weekly schedule</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
            Staff Login →
          </button>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="filters-bar">
            <div>
              <label className="form-label">Section</label>
              <select
                className="form-select"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
              >
                <option value="">— Choose Section —</option>
                {sections.map((s) => (
                  <option key={s.section_id} value={s.section_id}>
                    {s.section_name} — {s.branch} Year {s.year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Date (for absence overlay)</label>
              <input
                className="form-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            {sectionId && (
              <>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => exportToPDF(entries, exportTitle)}>
                    ↓ PDF
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => exportToExcel(entries, exportTitle)}>
                    ↓ Excel
                  </button>
                </div>
              </>
            )}
          </div>

          {selectedSection && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              <span className="badge badge-blue">{selectedSection.branch}</span>
              <span className="badge badge-teal">Year {selectedSection.year}</span>
              <span className="badge badge-amber">Lunch: {selectedSection.lunch_type === 'A' ? '12–1 PM' : '1–2 PM'}</span>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading && <div className="loading-center"><span className="spinner" /> Loading timetable…</div>}

        {!loading && sectionId && entries.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <p className="text-muted">No timetable entries found for this section.</p>
            <p className="text-muted text-sm" style={{ marginTop: 4 }}>
              Ask your admin to generate or assign the timetable.
            </p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="card fade-in-up">
            <TimetableGrid entries={entries} lunchType={lunchType} />
          </div>
        )}

        {!sectionId && (
          <div className="card" style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📅</div>
            <p style={{ color: 'var(--text-2)', fontSize: '1rem' }}>Select a section above to view its weekly timetable</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicTimetablePage;
