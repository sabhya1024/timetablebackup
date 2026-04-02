// src/pages/admin/AdminSubjects.jsx
import React from 'react';
import CrudPage from '../../components/admin/CrudPage';

export function AdminSubjects() {
  return (
    <CrudPage
      title="Subjects"
      icon="📘"
      endpoint="/subjects"
      rowKey="subject_id"
      columns={[
        { key: 'subject_id',   label: 'ID' },
        { key: 'subject_name', label: 'Subject', render: (r) => <strong>{r.subject_name}</strong> },
        { key: 'credits',      label: 'Credits',      render: (r) => <span className="badge badge-teal">{r.credits} cr</span> },
        { key: 'weekly_hours', label: 'Weekly Hours',  render: (r) => <span className="badge badge-amber">{r.weekly_hours} hr/wk</span> },
      ]}
      formFields={[
        { name: 'subject_name', label: 'Subject Name', placeholder: 'e.g. Machine Learning' },
        { name: 'credits',      label: 'Credits',      type: 'number', placeholder: '3' },
        { name: 'weekly_hours', label: 'Weekly Hours', type: 'number', placeholder: '3' },
      ]}
      emptyForm={{ subject_name: '', credits: '', weekly_hours: '' }}
    />
  );
}

// src/pages/admin/AdminRooms.jsx
export function AdminRooms() {
  return (
    <CrudPage
      title="Rooms"
      icon="🏛"
      endpoint="/rooms"
      rowKey="room_id"
      columns={[
        { key: 'room_id',     label: 'ID' },
        { key: 'room_number', label: 'Room', render: (r) => <strong>{r.room_number}</strong> },
        { key: 'type',        label: 'Type', render: (r) => <span className={`badge badge-${r.type === 'Lab' ? 'amber' : 'blue'}`}>{r.type}</span> },
        { key: 'capacity',    label: 'Capacity' },
      ]}
      formFields={[
        { name: 'room_number', label: 'Room Number', placeholder: 'e.g. CS-101' },
        { name: 'type',        label: 'Type', type: 'select', options: [
          { value: 'Theory', label: 'Theory' },
          { value: 'Lab',    label: 'Lab' },
        ]},
        { name: 'capacity', label: 'Capacity', type: 'number', placeholder: '60' },
      ]}
      emptyForm={{ room_number: '', type: 'Theory', capacity: '' }}
    />
  );
}

// src/pages/admin/AdminSections.jsx
export function AdminSections() {
  return (
    <CrudPage
      title="Sections"
      icon="🎓"
      endpoint="/sections"
      rowKey="section_id"
      columns={[
        { key: 'section_id',   label: 'ID' },
        { key: 'section_name', label: 'Section', render: (r) => <strong>{r.section_name}</strong> },
        { key: 'branch',       label: 'Branch',  render: (r) => <span className="badge badge-blue">{r.branch}</span> },
        { key: 'year',         label: 'Year',    render: (r) => <span className="badge badge-teal">Year {r.year}</span> },
        { key: 'lunch_type',   label: 'Lunch',   render: (r) => (
          <span className="badge badge-amber">
            Type {r.lunch_type?.trim()} ({r.lunch_type?.trim() === 'A' ? '12–1' : '1–2'})
          </span>
        )},
      ]}
      formFields={[
        { name: 'section_name', label: 'Section Name',  placeholder: 'e.g. CS3A' },
        { name: 'branch',       label: 'Branch',        placeholder: 'e.g. CSE' },
        { name: 'year',         label: 'Year (1–4)',     type: 'number', placeholder: '3' },
        { name: 'lunch_type',   label: 'Lunch Type',    type: 'select', options: [
          { value: 'A', label: 'A — 12:00–13:00' },
          { value: 'B', label: 'B — 13:00–14:00' },
        ]},
      ]}
      emptyForm={{ section_name: '', branch: 'CSE', year: '', lunch_type: 'A' }}
    />
  );
}
