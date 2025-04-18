// src/components/FacultyDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/FacultyDashboard.css';
import { jwtDecode } from 'jwt-decode';
import logo from '../data/logo.jpeg';

const FacultyDashboard = () => {
  // Navigation and loading
  const [navActive, setNavActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');
  const [loading, setLoading] = useState(true);

  // Date states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance states (for marking attendance)
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const togglePeriod = (p) => {
    setSelectedPeriods(prev =>
      prev.includes(p)
        ? prev.filter(x => x !== p)
        : [...prev, p]
    );
  };

  // Attendance Percentage tab
  const [apShowPercentage, setApShowPercentage] = useState('Yes');  // 'Yes' or 'No'
  const [apRawData, setApRawData] = useState([]);                  // will hold the raw P/A records
  const [apDatesRange, setApDatesRange] = useState([]);            // list of dates from from→to

  // States for Attendance Percentage tab
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

  // New Lab Attendance states
  const [isLab, setIsLab] = useState("No");   // "No" by default
  const [labBatch, setLabBatch] = useState("1"); // default lab batch if Lab = Yes

  // Dropdown options
  const branches = ['CSE', 'AIDS', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MCA', 'MBA'];
  const academicYears = ['2025', '2026', '2027', '2028'];
  // Default full list of semesters
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const sections = ['A', 'B'];

  // Other filter states (assessments & attendance)
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedDayOrder, setSelectedDayOrder] = useState('');

  // Data fetched from back end
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [assessmentStudents, setAssessmentStudents] = useState([]);

  // States for Student tab (search)
  const [searchRollNumber, setSearchRollNumber] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState({
    total: 0,
    present: 0,
    absent: 0
  });

  const navigate = useNavigate();

  const toggleNav = () => setNavActive(prev => !prev);

  // Logout: remove token & facultyCode from localStorage, then redirect to login
  const handleLogout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyCode');
    window.location.href = '/';
  };

  // Verify faculty session and fetch faculty details
  useEffect(() => {
    const verifyFacultySession = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        const facultyCode = localStorage.getItem('facultyCode');

        if (!token || !facultyCode) {
          navigate('/');
          return;
        }

        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now() || decoded.faculty_code.toString() !== facultyCode) {
          localStorage.clear();
          navigate('/');
          return;
        }

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
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyFacultySession();
  }, [navigate]);

  // Fetch subjects for assessments & attendance
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

  // Fetch students for attendance – now considers lab attendance
  const handleFetchAttendanceStudents = async () => {
    // For lab mode, we only need branch, academicYear, and section.
    // For non-lab mode, semester and subject are required.
    if (
      !selectedBranch ||
      !selectedAcademicYear ||
      !selectedSection ||
      (isLab === "No" && (!selectedSemester || !selectedSubject))
    ) {
      alert('Please select all filters for attendance.');
      return;
    }
    try {
      setLoading(true);
      let params = {
        branch: selectedBranch,
        section: selectedSection,
        academicYear: selectedAcademicYear,
      };
      // If lab attendance is enabled, remove semester and subjectCode from parameters.
      if (isLab === "Yes") {
        params.isLab = "Yes";
        params.labBatch = labBatch;
      } else {
        params.subjectCode = selectedSubject;
        params.semester = selectedSemester;
      }
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/students`, { params });
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

  // Save attendance – if lab flag is Yes, duplicate the attendance data for both batches (or merge as appropriate)
  const handleSaveAttendance = async () => {
    // 1) Ensure all filters are present
    if (
      !selectedBranch ||
      !selectedAcademicYear ||
      !selectedSemester ||
      !selectedSection ||
      !selectedSubject ||
      attendanceStudents.length === 0 ||
      !selectedDayOrder ||
      (isLab === "No" && !selectedPeriod) ||
      (isLab === "Yes" && selectedPeriods.length === 0)
    ) {
      alert('Please ensure all filters (including period(s) and day order) are selected and students are fetched.');
      return;
    }

    // 2) Build base entries per student (date, record, day_order)
    const baseEntries = attendanceStudents.map(student => ({
      rollNumber: student.rollNumber,
      record: student.record,
      attendance_date: selectedDate,
      day_order: selectedDayOrder
    }));

    // 3) Expand for lab vs non‑lab
    let attendanceData = [];
    if (isLab === "Yes") {
      // for each student × each selected period × each batch (1 & 2)
      attendanceData = baseEntries.flatMap(base =>
        selectedPeriods.flatMap(period =>
          ['1', '2'].map(batch => ({
            ...base,
            period: period,
            labBatch: batch
          }))
        )
      );
    } else {
      // one entry per student for the single period
      attendanceData = baseEntries.map(base => ({
        ...base,
        period: selectedPeriod
      }));
    }

    // 4) POST to server
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/attendance`, {
        branch: selectedBranch,
        section: selectedSection,
        semester: selectedSemester,
        batchYear: selectedAcademicYear,
        subject_code: selectedSubject,
        attendanceData,
        attendance_date: selectedDate,
        day_order: selectedDayOrder,
        isLab: isLab === "Yes" ? "Yes" : undefined  // ✅ explicitly include
      });


      // Calculate summary
      const total = attendanceStudents.length;
      const present = attendanceStudents.filter(s => s.record === 'P').length;
      const absent = total - present;

      // Show summary dialog
      setAttendanceSummary({ total, present, absent });
      setShowSummaryDialog(true);

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
    setApLoading(true);
    try {
      if (apShowPercentage === 'Yes') {
        // KEEP your existing GET /attendance/percentage call:
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
      } else {
        // NEW: fetch the raw attendance records in the date range
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/faculty/attendance/data`,
          {
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
          }
        );
        // response.data should be an array of { roll_number, student_name, attendance_date, record: 'P'|'A' }
        setApRawData(response.data);

        // also build the date range array for column headers
        const from = new Date(apFromDate);
        const to = new Date(apToDate);
        const dates = [];
        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }
        setApDatesRange(dates);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching attendance data.');
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

  // PDF Generation Function
  const generatePdf = () => {
  const collegeName = "C. ABDUL HAKEEM COLLEGE OF ENGINEERING & TECHNOLOGY";
  const collegeLocation = "MELVISHARAM - 632509";
  // derive department based on branch
  const deptMap = {
    CSE: "Department of Computer Science and Engineering",
    ECE: "Department of Electronics and Communication Engineering",
    EEE: "Department of Electrical and Electronics Engineering",
    MECH: "Department of Mechanical Engineering",
    CIVIL: "Department of Civil Engineering",
    IT: "Department of Information Technology",
    AIDS: "Department of Artificial Intelligence and Data Science",
    MCA: "Department of Computer Applications",
    MBA: "Department of Business Administration"
  };
  const department = deptMap[apBranch] || "";
  const academicYearStr = "Academic Year 2024 - 2025";
  const branch = apBranch;
  const section = apSection;
  const fromDate = apFromDate;
  const toDate = apToDate;
  const entry = apEntry;
  const showPerc = apShowPercentage; // Yes or No
  const facultyName = facultyDetails ? facultyDetails.faculty_name : "";

  const doc = new jsPDF('p', 'mm', 'a4');
  const marginLeft = 10;
  const marginRight = 200;
  doc.addImage(logo, 'JPEG', marginLeft, 5, 20, 20);
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(collegeName, 105, 12, { align: "center" });
  doc.setFontSize(12);
  doc.text(collegeLocation, 105, 18, { align: "center" });
  doc.text(department, 105, 24, { align: "center" });
  doc.text(academicYearStr, 105, 30, { align: "center" });
  doc.setDrawColor(0, 0, 0);
  doc.line(marginLeft, 33, marginRight, 33);

  const titleY = 42;
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(showPerc === 'Yes' ? "Attendance Percentage" : "Attendance Register", 105, titleY, { align: "center" });

  const headerY = 52;
  let y = headerY;
  const leftX = 22;
  const rightX = 120;
  // Left details
  doc.setFontSize(9);
  doc.setFont("times", "bold");
  doc.text("Subject Handler:", leftX, y);
  let lw = doc.getTextWidth("Subject Handler:");
  doc.setFont("times", "normal");
  doc.text(` ${facultyName}`, leftX + lw + 2, y);
  y += 6;
  doc.setFont("times", "bold");
  doc.text("Subject:", leftX, y);
  lw = doc.getTextWidth("Subject:");
  doc.setFont("times", "normal");
  const subjectDetail = apSubject !== 'ALL'
    ? `${apSubjects.find(s => s.subject_code === apSubject)?.subject_name || ''} (${apSubject})`
    : "All Subjects";
  doc.text(` ${subjectDetail}`, leftX + lw + 2, y);
  y += 6;
  doc.setFont("times", "bold");
  doc.text("Entry:", leftX, y);
  lw = doc.getTextWidth("Entry:");
  doc.setFont("times", "normal");
  doc.text(` ${entry}`, leftX + lw + 2, y);

  // Right details
  y = headerY;
  doc.setFont("times", "bold");
  doc.text("Batch/Sem/Sec:", rightX, y);
  lw = doc.getTextWidth("Batch/Sem/Sec:");
  doc.setFont("times", "normal");
  doc.text(` ${apAcademicYear || ''} / ${apSemester || ''} / ${section}`, rightX + lw + 2, y);
  y += 6;
  doc.setFont("times", "bold");
  doc.text("From Date:", rightX, y);
  lw = doc.getTextWidth("From Date:");
  doc.setFont("times", "normal");
  doc.text(` ${fromDate}`, rightX + lw + 2, y);
  y += 6;
  doc.setFont("times", "bold");
  doc.text("To Date:", rightX, y);
  lw = doc.getTextWidth("To Date:");
  doc.setFont("times", "normal");
  doc.text(` ${toDate}`, rightX + lw + 2, y);

  // Title above table
  const tableY = y + 10;
  doc.setFont("times", "bold");
  doc.setFontSize(12);

  // Build table columns & data
  let columns = [];
  let data = [];

  if (showPerc === 'Yes') {
    if (apSubject === 'ALL') {
      columns = [
        { header: 'Roll No.', dataKey: 'roll_number' },
        { header: 'Name', dataKey: 'student_name' },
        ...apSubjects.map(sub => ({ header: sub.subject_name, dataKey: sub.subject_code })),
        { header: 'Total Periods', dataKey: 'total_periods' },
        { header: 'Total Presents', dataKey: 'total_presents' },
        { header: 'Overall %', dataKey: 'overall_percentage' }
      ];
      data = apResults.map(r => {
        const subjectsData = r.subject_breakdown ? JSON.parse(r.subject_breakdown) : [];
        const totalP = subjectsData.reduce((a,s) => a + Number(s.present_count||0),0);
        const totalT = subjectsData.reduce((a,s) => a + Number(s.total_periods||0),0);
        const row = { roll_number: r.roll_number, student_name: r.student_name };
        apSubjects.forEach(sub => {
          const sd = subjectsData.find(s=>s.subject_code===sub.subject_code) || {};
          const pres = Number(sd.present_count||0);
          const tot = Number(sd.total_periods||0);
          row[sub.subject_code] = `${pres}/${tot} (${ tot>0?((pres/tot)*100).toFixed(2):0 }%)`;
        });
        return { ...row, total_periods: totalT, total_presents: totalP, overall_percentage: `${ totalT>0?((totalP/totalT)*100).toFixed(2):0 }%` };
      });
    } else {
      columns = [
        { header: 'Roll No.', dataKey: 'roll_number' },
        { header: 'Name', dataKey: 'student_name' },
        { header: 'Total Periods', dataKey: 'total_periods' },
        { header: 'Present', dataKey: 'present' },
        { header: 'Absent', dataKey: 'absent' },
        { header: 'Percentage', dataKey: 'percentage' }
      ];
      data = apResults.map(r => ({
        roll_number: r.roll_number,
        student_name: r.student_name,
        total_periods: r.total_days,
        present: r.present_count,
        absent: r.total_days - r.present_count,
        percentage: `${ Number(r.percentage).toFixed(2) }%`
      }));
    }
  } else {
    columns = [
      { header: 'Roll No.', dataKey: 'roll_number' },
      { header: 'Name', dataKey: 'student_name' },
      ...apDatesRange.map(d => ({ header: d, dataKey: d }))
    ];
    const mapRows = {};
    apRawData.forEach(({ roll_number, student_name, attendance_date, record }) => {
      if (!mapRows[roll_number]) {
        mapRows[roll_number] = { roll_number, student_name };
        apDatesRange.forEach(d => { mapRows[roll_number][d] = 'A'; });
      }
      mapRows[roll_number][attendance_date] = record;
    });
    data = Object.values(mapRows);
  }

  autoTable(doc, {
    startY: tableY + 8,
    head: [columns.map(c => c.header)],
    body: data.map(row => columns.map(c => row[c.dataKey])),
    theme: 'grid',
    styles: { font: 'times', fontSize: 8, lineWidth: 0.1, lineColor: [0,0,0] },
    headStyles: { fontStyle: 'bold', textColor: [0,0,0], fillColor: [255,255,255] }
  });

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : tableY + 40;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text("Faculty In-Charge", 40, finalY + 30);
  doc.text("HOD", 140, finalY + 30);

  doc.save(`Attendance_${fromDate}_to_${toDate}.pdf`);
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
        // Compute semester options: if selectedBranch is MBA or MCA, only semesters 1-4 are allowed.
        const availableSemestersAssessment = (selectedBranch === "MBA" || selectedBranch === "MCA")
          ? ['1', '2', '3', '4']
          : semesters;
        return (
          <div className="tab-content assessment-tab">
            <h2>Assessment</h2>
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
                  {availableSemestersAssessment.map(s => (<option key={s} value={s}>{s}</option>))}
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
        // For attendance, use the same logic based on selectedBranch.
        const availableSemestersAttendance = (selectedBranch === "MBA" || selectedBranch === "MCA")
          ? ['1', '2', '3', '4']
          : semesters;
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
                  {availableSemestersAttendance.map(s => (<option key={s} value={s}>{s}</option>))}
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
                <label>Is Lab?</label>
                <select value={isLab} onChange={(e) => setIsLab(e.target.value)}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              {isLab === "Yes" && (
                <div className="filter-group">
                  <label>Lab Batch:</label>
                  <select value={labBatch} onChange={(e) => setLabBatch(e.target.value)}>
                    <option value="1">Batch 1</option>
                    <option value="2">Batch 2</option>
                  </select>
                </div>
              )}
              <div className="filter-group">
                <label>Date:</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="date-input" />
              </div>
              {isLab === "Yes" ? (
                <div className="filter-group">
                  <label>Periods:</label>
                  <div className="period-dropdown">
                    {/* Toggle open on label click */}
                    <div
                      className="dropdown-label"
                      onClick={() => setPeriodDropdownOpen(o => !o)}
                    >
                      {selectedPeriods.length > 0
                        ? selectedPeriods.map(p => `P${p}`).join(', ')
                        : 'Select periods'}
                    </div>

                    {/* Only render menu when open */}
                    {periodDropdownOpen && (
                      <div className="dropdown-menu">
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(p => (
                          <label key={p} style={{ display: 'block', margin: '4px 0' }}>
                            <input
                              type="checkbox"
                              checked={selectedPeriods.includes(p)}
                              onChange={() => togglePeriod(p)}
                            />{' '}
                            Period {p}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="filter-group">
                  <label>Period:</label>
                  <select
                    value={selectedPeriod}
                    onChange={e => setSelectedPeriod(e.target.value)}
                  >
                    <option value="">-- Select Period --</option>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(p => (
                      <option key={p} value={p}>Period {p}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="filter-group">
                <label>Day Order:</label>
                <select value={selectedDayOrder} onChange={(e) => setSelectedDayOrder(e.target.value)}>
                  <option value="">-- Select Day Order --</option>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
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
                              const updated = [...attendanceStudents];
                              updated[index].record = updated[index].record === 'P' ? 'A' : 'P';
                              setAttendanceStudents(updated);
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
          const availableAPSemesters = (apBranch === "MBA" || apBranch === "MCA")
            ? ['1', '2', '3', '4']
            : semesters;
          return (
            <div className="tab-content attendance-percentage-tab">
              <h2>Attendance Details</h2>
              <div className="filters-container">
                <div className="filter-group">
                  <label>Branch:</label>
                  <select value={apBranch} onChange={e => setApBranch(e.target.value)}>
                    <option value="">-- Select Branch --</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Academic Year:</label>
                  <select value={apAcademicYear} onChange={e => setApAcademicYear(e.target.value)}>
                    <option value="">-- Select Year --</option>
                    {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Semester:</label>
                  <select value={apSemester} onChange={e => setApSemester(e.target.value)}>
                    <option value="">-- Select Semester --</option>
                    {availableAPSemesters.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Section:</label>
                  <select value={apSection} onChange={e => setApSection(e.target.value)}>
                    <option value="">-- Select Section --</option>
                    {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Subject:</label>
                  <select value={apSubject} onChange={e => setApSubject(e.target.value)}>
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
                  <input type="date" value={apFromDate} onChange={e => setApFromDate(e.target.value)} className="date-input" />
                </div>
                <div className="filter-group">
                  <label>To Date:</label>
                  <input type="date" value={apToDate} onChange={e => setApToDate(e.target.value)} className="date-input" />
                </div>
                <div className="filter-group">
                  <label>Entry:</label>
                  <select value={apEntry} onChange={e => setApEntry(e.target.value)}>
                    <option value="Entry1">Entry 1</option>
                    <option value="Entry2">Entry 2</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Show Percentage?</label>
                  <select value={apShowPercentage} onChange={e => setApShowPercentage(e.target.value)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
        
              <button className="action-button" onClick={handleCalculateAttendancePercentage}>
                {apShowPercentage === 'Yes' ? 'Calculate Percentage' : 'Show Attendance Data'}
              </button>
              {apLoading && <p>Loading...</p>}
        
              {apShowPercentage === 'Yes' && apResults.length > 0 && (
                <>
                  <div className="table-container" style={{ overflowX: 'auto' }}>
                    {apSubject === 'ALL' ? (
                      <table>
                        <thead>
                          <tr>
                            <th>Roll No.</th>
                            <th>Name</th>
                            {apSubjects.map(sub => <th key={sub.subject_code}>{sub.subject_name}</th>)}
                            <th>Total Periods</th>
                            <th>Total Presents</th>
                            <th>Overall %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apResults.map(row => {
                            const subjectsData = row.subject_breakdown ? JSON.parse(row.subject_breakdown) : [];
                            const totalP = subjectsData.reduce((acc, s) => acc + (Number(s.present_count) || 0), 0);
                            const totalT = subjectsData.reduce((acc, s) => acc + (Number(s.total_periods) || 0), 0);
                            return (
                              <tr key={row.roll_number}>
                                <td>{row.roll_number}</td>
                                <td>{row.student_name}</td>
                                {apSubjects.map(sub => {
                                  const sd = subjectsData.find(s => s.subject_code === sub.subject_code) || {};
                                  const pres = Number(sd.present_count || 0);
                                  const tot = Number(sd.total_periods || 0);
                                  const perc = tot > 0 ? ((pres / tot) * 100).toFixed(2) : '0.00';
                                  return <td key={sub.subject_code}>{`${pres}/${tot} (${perc}%)`}</td>;
                                })}
                                <td>{totalT}</td>
                                <td>{totalP}</td>
                                <td>{totalT > 0 ? ((totalP/totalT)*100).toFixed(2) + '%' : '0.00%'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
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
                          {apResults.map(row => {
                            const total = Number(row.total_days) || 0;
                            const present = Number(row.present_count) || 0;
                            const absent = total - present;
                            const perc = total > 0 ? parseFloat(row.percentage).toFixed(2) + '%' : '0.00%';
                            return (
                              <tr key={row.roll_number}>
                                <td>{row.roll_number}</td>
                                <td>{row.student_name}</td>
                                <td>{total}</td>
                                <td>{present}</td>
                                <td>{absent}</td>
                                <td>{perc}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <button className="action-button" onClick={generatePdf}>
                    Print PDF
                  </button>
                </>
              )}
        
              {apShowPercentage === 'No' && apRawData.length > 0 && (
                <div className="table-container" style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Roll No.</th>
                        <th>Name</th>
                        {apDatesRange.map(d => <th key={d}>{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(
                        apRawData.reduce((acc, { roll_number, student_name, attendance_date, record }) => {
                          const key = roll_number;
                          if (!acc[key]) acc[key] = { roll_number, student_name, recs: {} };
                          acc[key].recs[attendance_date] = record;
                          return acc;
                        }, {})
                      ).map(({ roll_number, student_name, recs }) => (
                        <tr key={roll_number}>
                          <td>{roll_number}</td>
                          <td>{student_name}</td>
                          {apDatesRange.map(d => <td key={d}>{recs[d] || 'A'}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="action-button" onClick={generatePdf}>
                    Print PDF
                  </button>
                </div>
              )}
            </div>
          );
        
      case 'students':
        const resultsBySemester = groupResultsBySemester(studentResults);
        const attendanceBySemester = groupAttendanceBySemester(studentAttendance);
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
              /><br /><br />
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
                <br />
                <center><strong><h2>Academic Performance</h2></strong></center><br />
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
                    )}
                    <br />
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
                      </table>
                      <br />
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
            <button onClick={() => setSelectedTab('attendancePercentage')}>Attendance Details</button>
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
            Attendance Details
          </button>
          <button onClick={() => { setSelectedTab('students'); toggleNav(); }}>
            Students
          </button>
        </div>
      </div>

      <div className="main-content">
        {renderTabContent()}
      </div>
      {showSummaryDialog && (
        <div className="summary-dialog-overlay">
          <div className="summary-dialog-box">
            <h3>Attendance Saved ✅</h3>
            <p><strong>Total Students:</strong> {attendanceSummary.total}</p>
            <p><strong>Present:</strong> {attendanceSummary.present}</p>
            <p><strong>Absent:</strong> {attendanceSummary.absent}</p>
            <button onClick={() => {
              setShowSummaryDialog(false);
              setSelectedTab('details');
            }}>
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyDashboard;
