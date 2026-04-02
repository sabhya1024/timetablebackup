// src/components/shared/TimetableGrid.jsx
import React from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { start: '09:00', end: '10:00', label: '9–10 AM' },
  { start: '10:00', end: '11:00', label: '10–11 AM' },
  { start: '11:00', end: '12:00', label: '11 AM–12 PM' },
  { start: '12:00', end: '13:00', label: '12–1 PM' },
  { start: '13:00', end: '14:00', label: '1–2 PM' },
  { start: '14:00', end: '15:00', label: '2–3 PM' },
  { start: '15:00', end: '16:00', label: '3–4 PM' },
  { start: '16:00', end: '17:00', label: '4–5 PM' },
];

function TimetableGrid({ entries = [], lunchType = null, onCellClick = null }) {
  // Build lookup: grid[day][startTime] = entry
  const grid = {};
  DAYS.forEach((d) => { grid[d] = {}; });
  entries.forEach((e) => {
    const t = e.start_time?.slice(0, 5);
    if (t && grid[e.day]) grid[e.day][t] = e;
  });

  const lunchSlot = lunchType === 'A' ? '12:00' : lunchType === 'B' ? '13:00' : null;

  const getCellClass = (entry, isLunch) => {
    const classes = ['tt-cell-inner'];
    if (isLunch) classes.push('is-lunch');
    else if (!entry) classes.push('');
    else if (entry.absence_status === 'cancelled') classes.push('is-cancelled');
    else if (entry.absence_status === 'substitute') classes.push('has-sub');
    else classes.push('has-class');
    return classes.join(' ');
  };

  return (
    <div className="tt-wrapper">
      <table className="tt-grid">
        <thead>
          <tr>
            <th style={{ width: 90 }}>Time</th>
            {DAYS.map((d) => <th key={d}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map(({ start, label }) => {
            const isLunch = start === lunchSlot;
            return (
              <tr key={start}>
                <td className="tt-time-cell">{label}</td>
                {DAYS.map((day) => {
                  const entry = isLunch ? null : grid[day][start];
                  return (
                    <td key={day}>
                      <div
                        className={getCellClass(entry, isLunch)}
                        onClick={() => onCellClick && onCellClick({ day, start, entry })}
                        style={onCellClick ? { cursor: 'pointer' } : {}}
                      >
                        {isLunch ? (
                          <span className="tt-tag lunch">🍽 Lunch Break</span>
                        ) : entry ? (
                          <>
                            <div className="tt-subject">{entry.subject_name}</div>
                            <div className="tt-teacher">
                              {entry.absence_status === 'substitute' && entry.substitute_teacher
                                ? `↪ ${entry.substitute_teacher}`
                                : entry.teacher_name}
                            </div>
                            <div className="tt-room">{entry.room_number}</div>
                            {entry.absence_status === 'cancelled' && (
                              <span className="tt-tag cancelled">Cancelled</span>
                            )}
                            {entry.absence_status === 'substitute' && (
                              <span className="tt-tag substitute">Substitute</span>
                            )}
                          </>
                        ) : (
                          <span className="tt-empty">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TimetableGrid;
