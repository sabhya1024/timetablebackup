import React, { useState, useEffect } from 'react';
import './App.css';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api';

export default function TimetableApp() {
  const [currentView, setCurrentView] = useState('login');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  // --- LOGIN HANDLERS ---
  const handleLogin = async (e, role) => {
    e.preventDefault();
    setError('');
    
    let payload = { role };
    if (role === 'admin') {
      payload.identifier = e.target.adminUsername.value;
      payload.password = e.target.adminPassword.value;
    } else if (role === 'teacher') {
      payload.identifier = e.target.teacherId.value;
    } else if (role === 'student') {
      payload.identifier = e.target.rollNo.value;
      payload.studentClass = e.target.studentClass.value;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
        setCurrentView(role);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server disconnected. Is the backend running?');
    }
  };

  const logout = () => {
    setCurrentView('login');
    setUserData(null);
    setError('');
  };

  // --- VIEWS ---
  const AdminView = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(`${API_BASE_URL}/timetable/all`)
        .then(res => res.json())
        .then(data => { setTimetable(data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }, []);

    return (
      <div className="content-wrapper">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px' }}>
          <div className="view-header">
            <div>
              <h2>Admin Dashboard</h2>
              <p>Master Timetable View</p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span className="user-badge">Admin</span>
              <button className="secondary" onClick={logout}>Logout</button>
            </div>
          </div>
          
          {loading ? <div className="loading">Loading timetable...</div> : (
             <div className="timetable-container">
             <table>
               <thead>
                 <tr>
                   <th>Day</th>
                   <th>Time</th>
                   <th>Section</th>
                   <th>Subject</th>
                   <th>Teacher</th>
                   <th>Room</th>
                 </tr>
               </thead>
               <tbody>
                 {timetable.map((entry, idx) => (
                   <tr key={idx}>
                     <td>{entry.day}</td>
                     <td>{entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}</td>
                     <td>{entry.section_name}</td>
                     <td>{entry.subject_name}</td>
                     <td>{entry.teacher_name}</td>
                     <td>{entry.room_number}</td>
                   </tr>
                 ))}
                 {timetable.length === 0 && (
                   <tr><td colSpan="6" style={{textAlign: 'center'}}>No schedule available</td></tr>
                 )}
               </tbody>
             </table>
           </div>
          )}
        </div>
      </div>
    );
  };

  const TeacherView = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(`${API_BASE_URL}/timetable/teacher/${userData.id}`)
        .then(res => res.json())
        .then(data => { setTimetable(data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }, [userData.id]);

    return (
      <div className="content-wrapper">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '900px' }}>
          <div className="view-header">
            <div>
              <h2>Teacher Schedule</h2>
              <p>Welcome, <strong>{userData.name}</strong></p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span className="user-badge">Teacher ID: {userData.id}</span>
              <button className="secondary" onClick={logout}>Logout</button>
            </div>
          </div>

          {loading ? <div className="loading">Loading your schedule...</div> : (
            <div className="timetable-container">
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Section</th>
                    <th>Subject</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((entry, idx) => (
                    <tr key={idx}>
                      <td>{entry.day}</td>
                      <td>{entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}</td>
                      <td>{entry.section_name}</td>
                      <td>{entry.subject_name}</td>
                      <td>{entry.room_number}</td>
                    </tr>
                  ))}
                  {timetable.length === 0 && (
                     <tr><td colSpan="5" style={{textAlign: 'center'}}>No schedule assigned yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const StudentView = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(`${API_BASE_URL}/timetable/student/${userData.sectionId}`)
        .then(res => res.json())
        .then(data => { setTimetable(data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }, [userData.sectionId]);

    return (
      <div className="content-wrapper">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '900px' }}>
         <div className="view-header">
            <div>
              <h2>Class Schedule</h2>
              <p>Section: <strong>{userData.class}</strong></p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span className="user-badge">Roll No: {userData.rollNo}</span>
              <button className="secondary" onClick={logout}>Logout</button>
            </div>
          </div>

          {loading ? <div className="loading">Loading your schedule...</div> : (
           <div className="timetable-container">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{entry.day}</td>
                    <td>{entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}</td>
                    <td>{entry.subject_name}</td>
                    <td>{entry.teacher_name}</td>
                    <td>{entry.room_number}</td>
                  </tr>
                ))}
                {timetable.length === 0 && (
                   <tr><td colSpan="5" style={{textAlign: 'center'}}>No schedule available for this section.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    );
  };

  // --- LOGIN PORTAL ---
  const LoginPortal = () => (
    <div className="content-wrapper">
      <h1>Timetable Management System</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="login-grid">
        <div className="glass-panel">
          <h3>Admin Access</h3>
          <form onSubmit={(e) => handleLogin(e, 'admin')}>
            <input type="text" name="adminUsername" placeholder="Admin Username" required defaultValue="admin" />
            <input type="password" name="adminPassword" placeholder="Password" required defaultValue="admin" />
            <button type="submit">Admin Login</button>
          </form>
        </div>

        <div className="glass-panel">
          <h3>Teacher Portal</h3>
          <form onSubmit={(e) => handleLogin(e, 'teacher')}>
            <input type="number" name="teacherId" placeholder="Teacher ID (e.g. 1)" required />
            <button type="submit">View Timetable</button>
          </form>
        </div>

        <div className="glass-panel">
          <h3>Student Portal</h3>
          <form onSubmit={(e) => handleLogin(e, 'student')}>
            <input type="text" name="rollNo" placeholder="Roll Number" required />
            <input type="text" name="studentClass" placeholder="Class/Section (e.g. CS3)" required />
            <button type="submit">View Timetable</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {currentView === 'login' && <LoginPortal />}
      {currentView === 'admin' && <AdminView />}
      {currentView === 'teacher' && <TeacherView />}
      {currentView === 'student' && <StudentView />}
    </div>
  );
}
