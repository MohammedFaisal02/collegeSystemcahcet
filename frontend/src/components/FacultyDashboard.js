// src/components/FacultyDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import '../styles/FacultyDashboard.css';
import { jwtDecode } from 'jwt-decode';  // Updated import to use named export

const FacultyDashboard = () => {
  const [navActive, setNavActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStudents, setAttendanceStudents] = useState([]);

  // States for Attendance Percentage
  const [apBranch, setApBranch] = useState('');
  const [apAcademicYear, setApAcademicYear] = useState('');
  const [apSemester, setApSemester] = useState('');
  const [apSection, setApSection] = useState('');
  const [apSubject, setApSubject] = useState('');
  const [apFromDate, setApFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [apToDate, setApToDate] = useState(new Date().toISOString().split('T')[0]);
  const [apEntry, setApEntry] = useState('Entry1');
  const [apResults, setApResults] = useState([]);
  const [apLoading, setApLoading] = useState(false);
  const [apSubjects, setApSubjects] = useState([]);

  // Dropdown options
  const branches = ['CSE', 'AIDS', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const academicYears = ['2025', '2026', '2027', '2028'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const sections = ['A', 'B'];

  // Filters for assessments & attendance
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedDayOrder, setSelectedDayOrder] = useState('');

  // Data from backend
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [assessmentStudents, setAssessmentStudents] = useState([]);

  // States for the student tab
  const [searchRollNumber, setSearchRollNumber] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const toggleNav = () => setNavActive(prev => !prev);

  // Updated logout: remove token and faculty code from localStorage
  const handleLogout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyCode');
    window.location.href = '/';
  };

  // Verify token and fetch faculty details
// Inside FacultyDashboard.js useEffect for session verification
useEffect(() => {
  const verifyFacultySession = async () => {
    try {
      const token = localStorage.getItem('facultyToken');
      const facultyCode = localStorage.getItem('facultyCode');

      console.log('Stored facultyCode:', facultyCode);
      console.log('Token:', token);

      if (!token || !facultyCode) {
        console.log('Missing token or faculty code, redirecting...');
        navigate('/faculty-login');
        return;
      }

      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);

      // Convert decoded faculty_code to string for comparison
      if (decoded.exp * 1000 < Date.now() || decoded.faculty_code.toString() !== facultyCode) {
        console.log('Token expired or faculty code mismatch, redirecting...');
        localStorage.clear();
        navigate('/faculty-login');
        return;
      }

      // Fetch faculty details from backend
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/details`, {
        params: { faculty_code: facultyCode },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.faculty_code) {
        setFacultyDetails(res.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setError('Failed to load faculty details');
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/faculty-login');
      }
    } finally {
      setLoading(false);
    }
  };

  verifyFacultySession();
}, [navigate]);

  // Fetch subjects based on filters for assessments & attendance
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subjects/list`, {
          params: {
            batchYear: selectedAcademicYear,
            semester: selectedSemester,
            branch: selectedBranch
          },
        });
        setSubjects(res.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    if (selectedAcademicYear && selectedSemester && selectedBranch) {
      fetchSubjects();
    }
  }, [selectedAcademicYear, selectedSemester, selectedBranch]);

  // Fetch subjects for Attendance Percentage tab
  useEffect(() => {
    const fetchAPSubjects = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subjects/list`, {
          params: { batchYear: apAcademicYear, semester: apSemester, branch: apBranch },
        });
        setApSubjects(res.data);
      } catch (error) {
        console.error('Error fetching AP subjects:', error.message);
      }
    };
    if (apAcademicYear && apSemester && apBranch) {
      fetchAPSubjects();
    }
  }, [apAcademicYear, apSemester, apBranch]);

  // Fetch students for assessments
  const handleFetchAssessmentStudents = async () => {
    if (!selectedBranch || !selectedAcademicYear || !selectedSemester || !selectedSection || !selectedSubject || !selectedExamType) {
      alert('Please select all filters for assessments.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/students`, {
        params: {
          branch: selectedBranch,
          section: selectedSection,
          subjectCode: selectedSubject,
          academicYear: selectedAcademicYear,
          semester: selectedSemester,
        },
      });
      setAssessmentStudents(res.data);
    } catch (error) {
      console.error('Error fetching assessment students:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for attendance
  const handleFetchAttendanceStudents = async () => {
    if (!selectedBranch || !selectedAcademicYear || !selectedSemester || !selectedSection || !selectedSubject) {
      alert('Please select all filters for attendance.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/students`, {
        params: {
          branch: selectedBranch,
          section: selectedSection,
          subjectCode: selectedSubject,
          academicYear: selectedAcademicYear,
          semester: selectedSemester,
        },
      });
      const studentsWithAttendance = res.data.map(student => ({
        ...student,
        record: 'P'
      }));
      setAttendanceStudents(studentsWithAttendance);
    } catch (error) {
      console.error('Error fetching attendance students:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Save assessments
  const handleSaveAssessments = async () => {
    if (!selectedBranch || !selectedSection || !selectedSubject || assessmentStudents.length === 0 || !selectedExamType) {
      alert('Please ensure all filters are selected and students are fetched.');
      return;
    }
    const assessments = assessmentStudents.map(student => ({
      rollNumber: student.rollNumber,
      marks: Math.min(parseFloat(student[selectedExamType] || 0), 100.0),
    }));
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/marks`, {
        branch: selectedBranch,
        section: selectedSection,
        semester: selectedSemester,
        batchYear: selectedAcademicYear,
        subjectCode: selectedSubject,
        examType: selectedExamType,
        assessments,
      });
      alert('Assessments saved successfully!');
      setSelectedTab('details');
    } catch (error) {
      console.error('Error saving assessments:', error.message);
      alert('Error saving assessments.');
    }
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!selectedBranch || !selectedAcademicYear || !selectedSemester || !selectedSection || !selectedSubject || attendanceStudents.length === 0 || !selectedPeriod || !selectedDayOrder) {
      alert('Please ensure all filters (including period and day order) are selected and students are fetched.');
      return;
    }
    const attendanceData = attendanceStudents.map(student => ({
      rollNumber: student.rollNumber,
      record: student.record,
      attendance_date: selectedDate,
      period: selectedPeriod,
      day_order: selectedDayOrder
    }));
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/attendance`, {
        branch: selectedBranch,
        section: selectedSection,
        semester: selectedSemester,
        batchYear: selectedAcademicYear,
        subject_code: selectedSubject,
        attendance_date: selectedDate,
        attendanceData,
      });
      alert('Attendance saved successfully!');
      setSelectedTab('details');
    } catch (error) {
      console.error('Error saving attendance:', error.response?.data || error.message);
      alert(`Error saving attendance: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  // Calculate Attendance Percentage
  const handleCalculateAttendancePercentage = async () => {
    if (!apBranch || !apAcademicYear || !apSemester || !apSection || !apSubject || !apFromDate || !apToDate || !apEntry) {
      alert('Please select all filters for attendance percentage.');
      return;
    }
    try {
      setApLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/attendance/percentage`, {
        params: {
          branch: apBranch,
          academicYear: apAcademicYear,
          semester: apSemester,
          section: apSection,
          subject_code: apSubject,
          from_date: apFromDate,
          to_date: apToDate,
          entry: apEntry
        }
      });
      setApResults(response.data);
    } catch (error) {
      console.error('Error calculating attendance percentage:', error.message);
      alert('Error calculating attendance percentage.');
    } finally {
      setApLoading(false);
    }
  };

  // Grouping helper functions for student tab
  const groupResultsBySemester = (results) => {
    const groups = {};
    results.forEach(result => {
      const sem = result.semester;
      if (!groups[sem]) {
        groups[sem] = [];
      }
      groups[sem].push(result);
    });
    return Object.keys(groups)
      .sort((a, b) => a - b)
      .map(sem => ({ semester: sem, results: groups[sem] }));
  };

  const groupAttendanceBySemester = (attendanceRecords) => {
    const groups = {};
    attendanceRecords.forEach(record => {
      const sem = record.semester;
      if (!groups[sem]) {
        groups[sem] = [];
      }
      groups[sem].push(record);
    });
    return Object.keys(groups)
      .sort((a, b) => a - b)
      .map(sem => ({ semester: sem, attendance: groups[sem] }));
  };

  // Search student by roll number
  const handleSearchStudent = async () => {
    if (!searchRollNumber.trim()) {
      alert('Please enter a roll number.');
      return;
    }
    try {
      setStudentLoading(true);
      const detailsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/students/details`, {
        params: { rollNumber: searchRollNumber },
      });
      setStudentDetails(detailsRes.data);

      const resultsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/student/results`, {
        params: { rollNumber: searchRollNumber },
      });
      setStudentResults(resultsRes.data);

      const attendanceRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/student/attendance`, {
        params: { rollNumber: searchRollNumber },
      });
      setStudentAttendance(attendanceRes.data);
    } catch (error) {
      console.error('Error fetching student data:', error.message);
      alert('Error fetching student data.');
    } finally {
      setStudentLoading(false);
    }
  };

  // Render tab content based on selection
  const renderTabContent = () => {
    if (loading) return <p>Loading data...</p>;
    switch (selectedTab) {
      case 'details':
        return (
          <div className="tab-content details-tab">
            <h2>Faculty Details</h2>
            {facultyDetails ? (
              <>
                <p><strong>Faculty Code:</strong> {facultyDetails.faculty_code}</p>
                <p><strong>Name:</strong> {facultyDetails.faculty_name}</p>
                <p><strong>Designation:</strong> {facultyDetails.designation}</p>
                <p><strong>Branch:</strong> {facultyDetails.branch || 'N/A'}</p>
              </>
            ) : (
              <p>Loading faculty details...</p>
            )}
          </div>
        );
      case 'assessment':
        return (
          <div className="tab-content assessment-tab">
            <h2>Assessment</h2>
            <div className="filters-container">
              {/* Assessment filter groups (unchanged) */}
              <div className="filter-group">
                <label>Branch:</label>
                <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                  <option value="">-- Select Branch --</option>
                  {branches.map(b => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Academic Year:</label>
                <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
                  <option value="">-- Select Year --</option>
                  {academicYears.map(year => (<option key={year} value={year}>{year}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Semester:</label>
                <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                  <option value="">-- Select Semester --</option>
                  {semesters.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Section:</label>
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                  <option value="">-- Select Section --</option>
                  {sections.map(sec => (<option key={sec} value={sec}>{sec}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Subject:</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="">-- Select Subject --</option>
                  {subjects.map(sub => (
                    <option key={sub.subject_code} value={sub.subject_code}>
                      {sub.subject_name} ({sub.subject_code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Exam Type:</label>
                <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)}>
                  <option value="">-- Select Exam --</option>
                  <option value="CAT1">CAT1</option>
                  <option value="CAT2">CAT2</option>
                  <option value="MODEL">MODEL</option>
                </select>
              </div>
            </div>
            <button className="action-button" onClick={handleFetchAssessmentStudents}>
              Fetch Students
            </button>
            {loading && <p>Loading students...</p>}
            {assessmentStudents.length > 0 && (
              <div className="table-container">
                <h3>Students List (Assessments):</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>{selectedExamType} Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentStudents.map((student, index) => (
                      <tr key={student.rollNumber}>
                        <td>{student.rollNumber}</td>
                        <td>{student.name}</td>
                        <td>
                          <input
                            type="number"
                            className="marks-input"
                            value={student[selectedExamType] || ''}
                            onChange={(e) => {
                              const updated = [...assessmentStudents];
                              updated[index][selectedExamType] = e.target.value;
                              setAssessmentStudents(updated);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <br />
                <button className="action-button" onClick={handleSaveAssessments}>
                  Save Assessments
                </button>
              </div>
            )}
          </div>
        );
      case 'attendance':
        return (
          <div className="tab-content attendance-tab">
            <h2>Attendance</h2>
            <div className="filters-container">
              <div className="filter-group">
                <label>Branch:</label>
                <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                  <option value="">-- Select Branch --</option>
                  {branches.map(b => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Academic Year:</label>
                <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
                  <option value="">-- Select Year --</option>
                  {academicYears.map(year => (<option key={year} value={year}>{year}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Semester:</label>
                <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                  <option value="">-- Select Semester --</option>
                  {semesters.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Section:</label>
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                  <option value="">-- Select Section --</option>
                  {sections.map(sec => (<option key={sec} value={sec}>{sec}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Subject:</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="">-- Select Subject --</option>
                  {subjects.map(sub => (
                    <option key={sub.subject_code} value={sub.subject_code}>
                      {sub.subject_name} ({sub.subject_code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Date:</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="date-input" />
              </div>
              <div className="filter-group">
                <label>Period:</label>
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                  <option value="">-- Select Period --</option>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(period => (
                    <option key={period} value={period}>Period {period}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Day Order:</label>
                <select value={selectedDayOrder} onChange={(e) => setSelectedDayOrder(e.target.value)}>
                  <option value="">-- Select Day Order --</option>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="button-group">
              <button className="action-button" onClick={handleFetchAttendanceStudents}>
                Fetch Students
              </button>
            </div>
            {loading && <p>Loading...</p>}
            {attendanceStudents.length > 0 && (
              <div className="table-container">
                <h3>Students List (Attendance):</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceStudents.map((student, index) => (
                      <tr key={student.rollNumber}>
                        <td>{student.rollNumber}</td>
                        <td>{student.name}</td>
                        <td>
                          <button
                            className={`attendance-button ${student.record === 'P' ? 'present' : 'absent'}`}
                            onClick={() => {
                              const updatedStudents = [...attendanceStudents];
                              updatedStudents[index].record = updatedStudents[index].record === 'P' ? 'A' : 'P';
                              setAttendanceStudents(updatedStudents);
                            }}
                          >
                            {student.record}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <br />
                <button className="action-button" onClick={handleSaveAttendance}>
                  Save Attendance
                </button>
              </div>
            )}
          </div>
        );
      case 'attendancePercentage':
        return (
          <div className="tab-content attendance-percentage-tab">
            <h2>Attendance Percentage</h2>
            <div className="filters-container">
              <div className="filter-group">
                <label>Branch:</label>
                <select value={apBranch} onChange={(e) => setApBranch(e.target.value)}>
                  <option value="">-- Select Branch --</option>
                  {branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Academic Year:</label>
                <select value={apAcademicYear} onChange={(e) => setApAcademicYear(e.target.value)}>
                  <option value="">-- Select Year --</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Semester:</label>
                <select value={apSemester} onChange={(e) => setApSemester(e.target.value)}>
                  <option value="">-- Select Semester --</option>
                  {semesters.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Section:</label>
                <select value={apSection} onChange={(e) => setApSection(e.target.value)}>
                  <option value="">-- Select Section --</option>
                  {sections.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Subject:</label>
                <select value={apSubject} onChange={(e) => setApSubject(e.target.value)}>
                  <option value="">-- Select Subject --</option>
                  {apSubjects.map(sub => (
                    <option key={sub.subject_code} value={sub.subject_code}>
                      {sub.subject_name} ({sub.subject_code})
                    </option>
                  ))}
                  <option value="ALL">All Subjects</option>
                </select>
              </div>
              <div className="filter-group">
                <label>From Date:</label>
                <input
                  type="date"
                  value={apFromDate}
                  onChange={(e) => setApFromDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="filter-group">
                <label>To Date:</label>
                <input
                  type="date"
                  value={apToDate}
                  onChange={(e) => setApToDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="filter-group">
                <label>Entry:</label>
                <select value={apEntry} onChange={(e) => setApEntry(e.target.value)}>
                  <option value="Entry1">Entry 1</option>
                  <option value="Entry2">Entry 2</option>
                </select>
              </div>
            </div>
            <button className="action-button" onClick={handleCalculateAttendancePercentage}>
              Calculate Percentage
            </button>
            {apLoading && <p>Calculating attendance percentage...</p>}
            {apResults.length > 0 && (
              <div className="table-container" style={{ overflowX: "auto" }}>
                {apSubject === "ALL" ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Roll No.</th>
                        <th>Name</th>
                        {apSubjects.map((sub) => (
                          <th key={sub.subject_code}>{sub.subject_name}</th>
                        ))}
                        <th>Total Periods</th>
                        <th>Total Presents</th>
                        <th>Overall %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apResults.map((row) => {
                        const roll = row.roll_number || "N/A";
                        const name = row.student_name || "N/A";
                        // Parse the subject_breakdown JSON string from backend
                        const subjects = row.subject_breakdown
                          ? JSON.parse(row.subject_breakdown)
                          : [];
                        // Calculate overall totals from the parsed subjects array
                        const totalPresents = subjects.reduce(
                          (acc, subj) => acc + (Number(subj.present_count) || 0),
                          0
                        );
                        const totalPeriods = subjects.reduce(
                          (acc, subj) => acc + (Number(subj.total_periods) || 0),
                          0
                        );
                        const overallPerc =
                          totalPeriods > 0 ? (totalPresents / totalPeriods) * 100 : 0;
                        return (
                          <tr key={roll}>
                            <td>{roll}</td>
                            <td>{name}</td>
                            {apSubjects.map((sub) => {
                              // Find subject details from the parsed subjects array
                              const subjectData =
                                subjects.find(
                                  (s) =>
                                    s.subject_code.toUpperCase() ===
                                    sub.subject_code.toUpperCase()
                                ) || {};
                              const pres = Number(subjectData.present_count || 0);
                              const periods = Number(subjectData.total_periods || 0);
                              const perc = periods > 0 ? (pres / periods) * 100 : 0;
                              return (
                                <td key={`${roll}-${sub.subject_code}`}>
                                  {`${pres} / ${periods} (${perc.toFixed(2)}%)`}
                                </td>
                              );
                            })}
                            <td>{totalPeriods}</td>
                            <td>{totalPresents}</td>
                            <td>{overallPerc.toFixed(2)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  // Render for a specific subject remains unchanged.
                  <table>
                    <thead>
                      <tr>
                        <th>Roll No.</th>
                        <th>Name</th>
                        <th>Total Periods</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apResults.map((row) => {
                        const roll = row.roll_number || "N/A";
                        const name = row.student_name || "N/A";
                        const totalPeriods = Number(row.total_days) || 0;
                        const present = Number(row.present_count) || 0;
                        const absent = totalPeriods - present;
                        const percentage = totalPeriods > 0 ? parseFloat(row.percentage) : 0;
                        return (
                          <tr key={roll}>
                            <td>{roll}</td>
                            <td>{name}</td>
                            <td>{totalPeriods}</td>
                            <td>{present}</td>
                            <td>{absent}</td>
                            <td>{percentage.toFixed(2)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );

      case 'students':
        // Inside your student tab render function:
        const resultsBySemester = groupResultsBySemester(studentResults);
        const attendanceBySemester = groupAttendanceBySemester(studentAttendance);

        // Create a unified set of semesters that appear in either results or attendance.
        const semestersSet = new Set([
          ...resultsBySemester.map((group) => group.semester),
          ...attendanceBySemester.map((group) => group.semester)
        ]);
        const allSemesters = Array.from(semestersSet).sort((a, b) => a - b);

        return (
          <div className="tab-content student-tab">
            <h2>Student Academic Performance</h2>
            <div className="student-search">
              <input
                type="text"
                placeholder="Enter Roll Number"
                value={searchRollNumber}
                onChange={(e) => setSearchRollNumber(e.target.value)}
              /><br /><br></br>
              <center><button className="search-button" onClick={handleSearchStudent}>Search</button></center>
            </div>
            {studentLoading && <p>Loading student data...</p>}
            {studentDetails && (
              <div className="student-details">
                <center><strong><h2>Student Details</h2></strong></center>
                <table>
                  <tbody>
                    <tr>
                      <th>Roll Number</th>
                      <td>{studentDetails.rollNumber}</td>
                    </tr>
                    <tr>
                      <th>Name</th>
                      <td>{studentDetails.name}</td>
                    </tr>
                    <tr>
                      <th>DOB</th>
                      <td>{studentDetails.dob}</td>
                    </tr>
                    <tr>
                      <th>Register Number</th>
                      <td>{studentDetails.registerNumber}</td>
                    </tr>
                    <tr>
                      <th>Branch</th>
                      <td>{studentDetails.branch}</td>
                    </tr>
                    <tr>
                      <th>Section</th>
                      <td>{studentDetails.section}</td>
                    </tr>
                    <tr>
                      <th>Batch Year</th>
                      <td>{studentDetails.batchYear}</td>
                    </tr>
                    <tr>
                      <th>Year Of Entry:</th>
                      <td>{studentDetails.yearOfEntry}</td>
                    </tr>
                    <tr>
                      <th>Father's Name:</th>
                      <td>{studentDetails.fatherName}</td>
                    </tr>
                    <tr>
                      <th>Father's Occupation:</th>
                      <td>{studentDetails.fatherOccupation}</td>
                    </tr>
                    <tr>
                      <th>Educational Occupation:</th>
                      <td>{studentDetails.educationOccupation}</td>
                    </tr>
                    <tr>
                      <th>Family Background:</th>
                      <td>{studentDetails.familyBackground}</td>
                    </tr>
                    <tr>
                      <th>Parent Phone No:</th>
                      <td>{studentDetails.parentPhoneNo}</td>
                    </tr>
                    <tr>
                      <th>Address:</th>
                      <td>{studentDetails.address}</td>
                    </tr>
                    <tr>
                      <th>Languages Known:</th>
                      <td>{studentDetails.languagesKnown}</td>
                    </tr>
                    <tr>
                      <th>Guardian Name:</th>
                      <td>{studentDetails.guardianName}</td>
                    </tr>
                    <tr>
                      <th>Last School Name:</th>
                      <td>{studentDetails.lastSchoolName}</td>
                    </tr>
                    <tr>
                      <th>Medium Of Instructions:</th>
                      <td>{studentDetails.mediumOfInstructions}</td>
                    </tr>
                    <tr>
                      <th>Maths:</th>
                      <td>{studentDetails.maths}</td>
                    </tr>
                    <tr>
                      <th>Physics:</th>
                      <td>{studentDetails.physics}</td>
                    </tr>
                    <tr>
                      <th>Chemistry:</th>
                      <td>{studentDetails.chemistry}</td>
                    </tr>
                    <tr>
                      <th>Cut Off:</th>
                      <td>{studentDetails.cutOff}</td>
                    </tr>
                    <tr>
                      <th>Quota:</th>
                      <td>{studentDetails.quota}</td>
                    </tr>
                    <tr>
                      <th>First Year Counselor:</th>
                      <td>{studentDetails.firstYearCounselor}</td>
                    </tr>
                    <tr>
                      <th>Second Year Counselor:</th>
                      <td>{studentDetails.secondYearCounselor}</td>
                    </tr>
                    <tr>
                      <th>Third Year Counselor:</th>
                      <td>{studentDetails.thirdYearCounselor}</td>
                    </tr>
                    <tr>
                      <th>Final Year Counselor:</th>
                      <td>{studentDetails.finalYearCounselor}</td>
                    </tr>
                  </tbody>
                </table>
                <br></br>
                <center><strong><h2>Academic Performance</h2></strong></center><br></br>
              </div>
            )}
            {allSemesters.length > 0 &&
              allSemesters.map((sem) => {
                const resultsGroup = resultsBySemester.find((g) => g.semester === sem);
                const attendanceGroup = attendanceBySemester.find((g) => g.semester === sem);

                return (
                  <div key={sem}>
                    <strong><h2>Semester {sem}</h2></strong>
                    {resultsGroup && resultsGroup.results.length > 0 ? (
                      <div className="student-results">
                        <strong><h1>Academic Results</h1></strong>
                        <table>
                          <thead>
                            <tr>
                              <th>Subject Code</th>
                              <th>Subject Name</th>
                              <th>CAT1</th>
                              <th>CAT2</th>
                              <th>MODEL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultsGroup.results.map((result, idx) => (
                              <tr key={idx}>
                                <td>{result.subject_code}</td>
                                <td>{result.subject_name}</td>
                                <td>{result.cat1 !== null ? result.cat1 : ''}</td>
                                <td>{result.cat2 !== null ? result.cat2 : ''}</td>
                                <td>{result.model !== null ? result.model : ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>No academic results for this semester.</p>
                    )}<br></br>
                    <div className="student-attendance">
                      <strong><h1>Attendance Percentage</h1></strong>
                      <table>
                        <thead>
                          <tr>
                            <th>Entry</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Entry1', 'Entry2'].map((entry, idx) => {
                            // Find the attendance record for the default entry, if it exists.
                            const attData = attendanceGroup?.attendance.find(
                              (att) => att.entry.toLowerCase() === entry.toLowerCase()
                            );
                            return (
                              <tr key={idx}>
                                <td>{entry}</td>
                                <td>{attData && attData.percentage !== null ? attData.percentage : ''}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table><br></br>
                    </div>
                  </div>
                );
              })}
          </div>
        );

      default:
        return <p>Select a tab to view content.</p>;
    }
  };

  return (
    <div className="faculty-dashboard">
      <div className="taskbar">
        <div className="taskbar-left">
          <button className="nav-toggle" onClick={toggleNav}>
            {navActive ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        <div className="taskbar-center">
          <div className="brand">Faculty Dashboard</div>
          <div className="nav-links">
            <button onClick={() => setSelectedTab('details')}>Faculty Details</button>
            <button onClick={() => setSelectedTab('assessment')}>Assessments</button>
            <button onClick={() => setSelectedTab('attendance')}>Attendance</button>
            <button onClick={() => setSelectedTab('attendancePercentage')}>Attendance Percentage</button>
            <button onClick={() => setSelectedTab('students')}>Students</button>
          </div>
        </div>
        <div className="taskbar-right">
          {selectedTab === 'details' ? (
            <button className="log-out" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="homebutton" onClick={() => setSelectedTab('details')}>Home</button>
          )}
        </div>
        {/* Mobile Dropdown Navigation */}
        <div className={`nav-links mobile ${navActive ? 'active' : ''}`}>
          <button onClick={() => { setSelectedTab('details'); toggleNav(); }}>
            Faculty Details
          </button>
          <button onClick={() => { setSelectedTab('assessment'); toggleNav(); }}>
            Assessments
          </button>
          <button onClick={() => { setSelectedTab('attendance'); toggleNav(); }}>
            Attendance
          </button>
          <button onClick={() => { setSelectedTab('attendancePercentage'); toggleNav(); }}>
            Attendance Percentage
          </button>
          <button onClick={() => { setSelectedTab('students'); toggleNav(); }}>
            Students
          </button>
        </div>
      </div>

      <div className="main-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default FacultyDashboard;
