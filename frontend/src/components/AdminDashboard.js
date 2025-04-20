// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/FacultyDashboard.css';
import logo from '../data/logo.jpeg';

const API_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const [navActive, setNavActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('student');
  const [selectedSection, setSelectedSection] = useState('day');
  const [deptBranch, setDeptBranch] = useState('');
  const navigate = useNavigate();

  const branches = ['CSE', 'AIDS', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MCA', 'MBA'];
  const [subjectsList, setSubjectsList] = useState([]);

  // Load subjects for Subject‑wise filter
  useEffect(() => {
    axios.get(`${API_URL}/api/subjects/adminlist`)
      .then(res => setSubjectsList(res.data))
      .catch(err => console.error(err));
  }, []);

  // === State for each section ===
  // Day‑wise
  const [dwDate, setDwDate] = useState('');
  const [dwEntry, setDwEntry] = useState('FN');
  const [dwData, setDwData] = useState([]);
  // Month‑wise
  const [mwMonth, setMwMonth] = useState('');
  const [mwEntry, setMwEntry] = useState('FN');
  const [mwCols, setMwCols] = useState([]);
  const [mwRows, setMwRows] = useState([]);
  // Duration‑wise
  const [durFrom, setDurFrom] = useState('');
  const [durTo, setDurTo] = useState('');
  const [durCols, setDurCols] = useState([]);
  const [durRows, setDurRows] = useState([]);
  // Subject‑wise
  const [swBranch, setSwBranch] = useState('');
  const [swSubject, setSwSubject] = useState('');
  const [swData, setSwData] = useState([]);
  // Below 75%
  const [ltData, setLtData] = useState([]);

  // Auto‑select first subject when branch changes
  useEffect(() => {
    if (swBranch) {
      const filtered = subjectsList.filter(s => s.branch === swBranch);
      setSwSubject(filtered.length ? filtered[0].subject_code : '');
    } else {
      setSwSubject('');
    }
  }, [swBranch, subjectsList]);

  const toggleNav = () => setNavActive(v => !v);

  // === Fetch functions ===
  const fetchDayWise = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/attendance/day`, {
        params: {
          date: dwDate,
          entry: dwEntry,
          branch: selectedTab === 'department' ? deptBranch : undefined
        }
      });
      setDwData(data);
    } catch {
      setDwData([]);
    }
  };

  const fetchMonthWise = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/attendance/month`, {
        params: {
          month: mwMonth,
          entry: mwEntry,
          branch: selectedTab === 'department' ? deptBranch : undefined
        }
      });
      const dates = Array.from(new Set(data.map(d => d.attendance_date))).sort();
      setMwCols(dates);

      const map = {};
      data.forEach(r => {
        if (!map[r.roll_number]) {
          map[r.roll_number] = {
            rollNumber: r.roll_number,
            name: r.student_name,
            branch: r.branch,
            ...Object.fromEntries(dates.map(d => [d, 'A']))
          };
        }
        map[r.roll_number][r.attendance_date] = r.record;
      });
      setMwRows(Object.values(map));
    } catch {
      setMwCols([]); setMwRows([]);
    }
  };

  const fetchDurationWise = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/attendance/duration`, {
        params: {
          from: durFrom,
          to: durTo,
          branch: selectedTab === 'department' ? deptBranch : undefined
        }
      });
      const dates = Array.from(new Set(data.map(d => d.attendance_date))).sort();
      setDurCols(dates);

      const map = {};
      data.forEach(r => {
        if (!map[r.roll_number]) {
          map[r.roll_number] = {
            rollNumber: r.roll_number,
            name: r.student_name,
            branch: r.branch,
            ...Object.fromEntries(dates.map(d => [d, 'A']))
          };
        }
        map[r.roll_number][r.attendance_date] = r.record;
      });
      setDurRows(Object.values(map));
    } catch {
      setDurCols([]); setDurRows([]);
    }
  };

  const fetchSubjectWise = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/attendance/subject`, {
        params: {
          branch: swBranch,
          subject: swSubject
        }
      });
      setSwData(data);
    } catch {
      setSwData([]);
    }
  };

  const fetchThreshold = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/attendance/threshold`, {
        params: {
          branch: selectedTab === 'department' ? deptBranch : undefined
        }
      });
      setLtData(data);
    } catch {
      setLtData([]);
    }
  };

  // === PDF generator ===
  const generatePdf = (title, columns, rows) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.addImage(logo, 'JPEG', 10, 5, 20, 20);
    doc.setFont('times', 'bold').setFontSize(12);
    doc.text('C. ABDUL HAKEEM COLLEGE OF ENGINEERING & TECHNOLOGY', 105, 12, { align: 'center' });
    doc.text('MELVISHARAM - 632509', 105, 18, { align: 'center' });
    doc.line(10, 33, 200, 33);
    doc.setFontSize(16);
    doc.text(title, 105, 42, { align: 'center' });

    autoTable(doc, {
      startY: 50,
      head: [columns],
      body: rows.map(r => columns.map(c => r[c] || '')),
      theme: 'grid',
      styles: { font: 'times', fontSize: 8 }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFont('times', 'normal').setFontSize(10);
    doc.text('Admin In-Charge', 40, finalY);
    doc.text('HOD', 140, finalY);

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  // === Section renderer ===
  const renderSection = () => {
    switch (selectedSection) {
      case 'day':
        return (
          <section className="admin-section">
            <div className="filters-container">
              <div className="filter-group">
                <label>Date:</label>
                <input type="date" value={dwDate} onChange={e => setDwDate(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>Entry:</label>
                <select value={dwEntry} onChange={e => setDwEntry(e.target.value)}>
                  <option>FN</option>
                  <option>AN</option>
                </select>
              </div>
              <button className="action-button" onClick={fetchDayWise}>Fetch</button>
            </div>
            {dwData.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Branch</th>
                      <th>Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dwData.map((r, i) => (
                      <tr key={i}>
                        <td>{r.roll_number}</td>
                        <td>{r.student_name}</td>
                        <td>{r.branch}</td>
                        <td>{r.record}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="action-button"
                  onClick={() => generatePdf(
                    'Day-wise',
                    ['roll_number', 'student_name', 'branch', 'record'],
                    dwData
                  )}>
                  Print PDF
                </button>
              </div>
            )}
          </section>
        );

      case 'month':
        return (
          <section className="admin-section">
            <div className="filters-container">
              <div className="filter-group">
                <label>Month:</label>
                <input type="month" value={mwMonth} onChange={e => setMwMonth(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>Entry:</label>
                <select value={mwEntry} onChange={e => setMwEntry(e.target.value)}>
                  <option>FN</option>
                  <option>AN</option>
                </select>
              </div>
              <button className="action-button" onClick={fetchMonthWise}>Fetch</button>
            </div>
            {mwRows.length > 0 && (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Branch</th>
                      {mwCols.map(d => <th key={d}>{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {mwRows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.rollNumber}</td>
                        <td>{r.name}</td>
                        <td>{r.branch}</td>
                        {mwCols.map(d => <td key={d}>{r[d]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="action-button"
                  onClick={() => generatePdf(
                    'Month-wise',
                    ['rollNumber', 'name', 'branch', ...mwCols],
                    mwRows
                  )}>
                  Print PDF
                </button>
              </div>
            )}
          </section>
        );

      case 'duration':
        return (
          <section className="admin-section">
            <div className="filters-container">
              <div className="filter-group">
                <label>From:</label>
                <input type="date" value={durFrom} onChange={e => setDurFrom(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>To:</label>
                <input type="date" value={durTo} onChange={e => setDurTo(e.target.value)} />
              </div>
              <button className="action-button" onClick={fetchDurationWise}>Fetch</button>
            </div>
            {durRows.length > 0 && (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Branch</th>
                      {durCols.map(d => <th key={d}>{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {durRows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.rollNumber}</td>
                        <td>{r.name}</td>
                        <td>{r.branch}</td>
                        {durCols.map(d => <td key={d}>{r[d]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="action-button"
                  onClick={() => generatePdf(
                    'Duration-wise',
                    ['rollNumber', 'name', 'branch', ...durCols],
                    durRows
                  )}>
                  Print PDF
                </button>
              </div>
            )}
          </section>
        );

      case 'subject':
        return (
          <section className="admin-section">
            <div className="filters-container">
              <div className="filter-group">
                <label>Branch:</label>
                <select value={swBranch} onChange={e => setSwBranch(e.target.value)}>
                  <option value="">-- Select Branch --</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Subject:</label>
                <select value={swSubject} onChange={e => setSwSubject(e.target.value)} disabled={!swBranch}>
                  <option value="">-- Select Subject --</option>
                  {subjectsList
                    .filter(s => s.branch === swBranch)
                    .map(s => (
                      <option key={s.subject_code} value={s.subject_code}>
                        {s.subject_name}
                      </option>
                    ))
                  }
                </select>
              </div>
              <button className="action-button" onClick={fetchSubjectWise} disabled={!swBranch || !swSubject}>
                Fetch
              </button>
            </div>
            {swData.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Branch</th>
                      <th>Batch</th>
                      <th>Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swData.map((r, i) => (
                      <tr key={i}>
                        <td>{r.roll_number}</td>
                        <td>{r.student_name}</td>
                        <td>{r.branch}</td>
                        <td>{r.batch}</td>
                        <td>{r.record}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="action-button"
                  onClick={() => generatePdf(
                    'Subject-wise',
                    ['roll_number', 'student_name', 'branch', 'batch', 'record'],
                    swData
                  )}>
                  Print PDF
                </button>
              </div>
            )}
          </section>
        );

      case 'threshold':
        return (
          <section className="admin-section">
            <div className="filters-container">
              {/* No input headings needed here */}
              <button className="action-button" onClick={fetchThreshold}>Fetch</button>
            </div>
            {ltData.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Branch</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ltData.map((r, i) => (
                      <tr key={i}>
                        <td>{r.roll_number}</td>
                        <td>{r.student_name}</td>
                        <td>{r.branch}</td>
                        <td>{r.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="action-button"
                  onClick={() => generatePdf(
                    'Below 75%',
                    ['roll_number', 'student_name', 'branch', 'percentage'],
                    ltData
                  )}>
                  Print PDF
                </button>
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  // === Tab renderers ===
  const renderStudentTab = () => (
    <div className="tab-content student-tab">
      <h2>Student Attendance</h2>
      <div className="filters-container sub-nav-links" style={{
        overflowX: 'auto',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap'
      }}>
        {['day', 'month', 'duration', 'subject', 'threshold'].map(key => (
          <button
            key={key}
            className={`action-button ${selectedSection === key ? 'active' : ''}`}
            onClick={() => setSelectedSection(key)}
          >
            {{
              day: 'Day-wise',
              month: 'Month-wise',
              duration: 'Duration-wise',
              subject: 'Subject-wise',
              threshold: 'Below 75%'
            }[key]}
          </button>
        ))}
      </div>
      {renderSection()}
    </div>
  );

  const renderDepartmentTab = () => (
    <div className="tab-content department-tab">
      <h2>Department Attendance</h2>
      <div className="filters-container">
        <div className="filter-group">
          <label>Branch:</label>
          <select value={deptBranch} onChange={e => setDeptBranch(e.target.value)}>
            <option value="">-- Select Branch --</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="filters-container sub-nav-links" style={{
        overflowX: 'auto',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap'
      }}>
        {['day', 'month', 'duration', 'threshold'].map(key => (
          <button
            key={key}
            className={`action-button ${selectedSection === key ? 'active' : ''}`}
            onClick={() => setSelectedSection(key)}
          >
            {{
              day: 'Day-wise',
              month: 'Month-wise',
              duration: 'Duration-wise',
              threshold: 'Below 75%'
            }[key]}
          </button>
        ))}
      </div>
      {renderSection()}
    </div>
  );

  return (
    <div className="faculty-dashboard">
      <div className="taskbar">
        <div className="taskbar-left">
          <button className="nav-toggle" onClick={toggleNav}>
            {navActive ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <div className="taskbar-center">
          <div className="brand">Admin Dashboard</div>
          <div className="nav-links">
            <button onClick={() => { setSelectedTab('student'); setSelectedSection('day'); }}>Student</button>
            <button onClick={() => { setSelectedTab('department'); setSelectedSection('day'); }}>Department</button>
          </div>
        </div>
        <div className="taskbar-right">
          <button className="homebutton" onClick={() => navigate('/')}>Logout</button>
        </div>
        <div className={`nav-links mobile ${navActive ? 'active' : ''}`}>
          <button onClick={() => { setSelectedTab('student'); setSelectedSection('day'); toggleNav(); }}>Student</button>
          <button onClick={() => { setSelectedTab('department'); setSelectedSection('day'); toggleNav(); }}>Department</button>
        </div>
      </div>
      <div className="main-content">
        {selectedTab === 'student' ? renderStudentTab() : renderDepartmentTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;
