// src/pages/admin/AdminTeachers.jsx
import React from 'react';
import CrudPage from '../../components/admin/CrudPage';

export default function AdminTeachers() {
  return (
    <CrudPage
      title="Teachers"
      icon="👤"
      endpoint="/teachers"
      rowKey="teacher_id"
      columns={[
        { key: 'teacher_id', label: 'ID' },
        { key: 'name',       label: 'Name', render: (r) => <strong>{r.name}</strong> },
        { key: 'dept_name',  label: 'Dept', render: (r) => <span className="badge badge-blue">{r.dept_name}</span> },
        { key: 'designation',label: 'Designation' },
        { key: 'specialization', label: 'Specialization', render: (r) => <span className="truncate" style={{ maxWidth: 220, display: 'block' }}>{r.specialization || '—'}</span> },
      ]}
      formFields={[
        { name: 'name',           label: 'Full Name',      placeholder: 'Dr. Jane Smith' },
        { name: 'dept_name',      label: 'Department',     type: 'select', options: [
          { value: 'CSE', label: 'CSE' },
          { value: 'ECE', label: 'ECE' },
          { value: 'ME',  label: 'ME' },
          { value: 'CE',  label: 'CE' },
        ]},
        { name: 'designation',    label: 'Designation',    placeholder: 'Assistant Professor' },
        { name: 'specialization', label: 'Specialization', type: 'textarea' },
        { name: 'username',       label: 'Login Username (optional)', placeholder: 'teacher.jane' },
        { name: 'password',       label: 'Login Password (optional)', type: 'password', placeholder: 'Min 8 chars' },
      ]}
      emptyForm={{ name: '', dept_name: 'CSE', designation: '', specialization: '', username: '', password: '' }}
    />
  );
}
