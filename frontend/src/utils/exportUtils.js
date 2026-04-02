// src/utils/exportUtils.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
];

// Build a grid: rows = timeSlots, cols = days
function buildGrid(entries) {
  const grid = {};
  TIME_SLOTS.forEach((t) => {
    grid[t] = {};
    DAYS.forEach((d) => { grid[t][d] = null; });
  });
  entries.forEach((e) => {
    const t = e.start_time?.slice(0, 5);
    if (grid[t] && grid[t][e.day] !== undefined) {
      grid[t][e.day] = e;
    }
  });
  return grid;
}

export function exportToPDF(entries, title = 'Timetable') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  const grid = buildGrid(entries);
  const head = [['Time', ...DAYS]];
  const body = TIME_SLOTS.map((slot) => {
    const displaySlot = `${slot}–${String(parseInt(slot) + 1).padStart(2, '0')}:00`;
    const row = [displaySlot];
    DAYS.forEach((day) => {
      const e = grid[slot][day];
      if (!e) {
        row.push('–');
      } else if (e.absence_status === 'cancelled') {
        row.push(`${e.subject_name}\n[CANCELLED]`);
      } else if (e.absence_status === 'substitute') {
        row.push(`${e.subject_name}\n${e.substitute_teacher || 'Substitute'}\n${e.room_number}`);
      } else {
        row.push(`${e.subject_name}\n${e.teacher_name}\n${e.room_number}`);
      }
    });
    return row;
  });

  autoTable(doc, {
    head,
    body,
    startY: 28,
    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', minCellHeight: 16 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: { 0: { fillColor: [219, 234, 254], fontStyle: 'bold', cellWidth: 20 } },
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

export function exportToExcel(entries, title = 'Timetable') {
  const grid = buildGrid(entries);
  const wsData = [
    [title],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Time Slot', ...DAYS],
  ];

  TIME_SLOTS.forEach((slot) => {
    const displaySlot = `${slot}–${String(parseInt(slot) + 1).padStart(2, '0')}:00`;
    const row = [displaySlot];
    DAYS.forEach((day) => {
      const e = grid[slot][day];
      if (!e) row.push('');
      else if (e.absence_status === 'cancelled') row.push(`${e.subject_name} [CANCELLED]`);
      else if (e.absence_status === 'substitute') row.push(`${e.subject_name} | ${e.substitute_teacher} | ${e.room_number}`);
      else row.push(`${e.subject_name} | ${e.teacher_name} | ${e.room_number}`);
    });
    wsData.push(row);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [{ wch: 14 }, ...DAYS.map(() => ({ wch: 28 }))];

  XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}
