// src/components/StudentDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import "../styles/StudentDashboard.css";

const StudentDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("details");
  const [studentDetails, setStudentDetails] = useState(null);
  const [subjects, setSubjects] = useState({});
  const [marks, setMarks] = useState({});
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [navActive, setNavActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const navigate = useNavigate();

  // Toggle navigation for mobile view
  const toggleNav = () => setNavActive(!navActive);

  // Filter subjects for Doubt-Bot
  useEffect(() => {
    if (subjects) {
      // Flatten subjects (across all semesters) into one array
      const allSubjects = Object.values(subjects).flat();
      const filtered = allSubjects.filter(
        (subject) =>
          subject.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.subject_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSubjects(filtered);
    }
  }, [searchQuery, subjects]);

  // Helper to get subject name by semester and code
  const getSubjectName = (semester, subjectCode) => {
    if (subjects[semester]) {
      // Compare in uppercase for consistency
      const subject = subjects[semester].find(
        (sub) => sub.subject_code.toUpperCase() === subjectCode.toUpperCase()
      );
      return subject ? subject.subject_name : "Unknown";
    }
    return "Unknown";
  };

  const handleDownloadPYQ = (subjectCode) => {
    const pyqMap = {
      HS3152: "/pyqs/HS3152.pdf",
      // Add mappings for all subjects
    };

    const fileName = pyqMap[subjectCode];
    if (fileName) {
      const link = document.createElement("a");
      link.href = fileName;
      link.download = `${subjectCode}_PYQ.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("PYQ not available for this subject");
    }
  };

  const handleDownloadNotes = (subjectCode) => {
    const notesMap = {
      HS3152: "/notes/HS3152.pdf",
      // Add mappings for all subjects
    };

    const fileName = notesMap[subjectCode];
    if (fileName) {
      const link = document.createElement("a");
      link.href = fileName;
      link.download = `${subjectCode}_Notes.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Notes not available for this subject");
    }
  };

  // Restructure attendance data from API response.
  // Expected API response format:
  // {
  //   "1": { subjects: [ { subject_code, entry1, entry2, ... }, ... ], total: { entry1, entry2 } },
  //   "2": { ... }
  // }
  // This function builds a lookup object keyed by subject code (in uppercase) for each semester.
  const restructureAttendance = (attendanceData) => {
    const grouped = {};
    for (const sem in attendanceData) {
      grouped[sem] = {};
      const semesterSubjects = attendanceData[sem].subjects;
      if (semesterSubjects && Array.isArray(semesterSubjects)) {
        semesterSubjects.forEach((record) => {
          // Force subject code to uppercase for consistency
          const key = record.subject_code.toUpperCase();
          grouped[sem][key] = {
            entry1: record.entry1,
            entry2: record.entry2,
          };
        });
      }
    }
    return grouped;
  };

  // Compute total/average attendance for each semester.
  // Priority:
  // 1. Use the API's total field if available.
  // 2. Otherwise, search for any subject whose code equals or includes "ALL" (ignoring case) and use its value.
  // 3. Otherwise, compute the average over available subjects (excluding any record whose subject code includes "ALL").
  const computeTotalAttendance = (attendanceData, groupedAttendance) => {
    const totals = {};
    for (const sem in attendanceData) {
      // Use the API's total field if provided
      if (
        attendanceData[sem].total &&
        attendanceData[sem].total.entry1 &&
        attendanceData[sem].total.entry2
      ) {
        totals[sem] = {
          entry1: parseFloat(attendanceData[sem].total.entry1).toFixed(2),
          entry2: parseFloat(attendanceData[sem].total.entry2).toFixed(2),
        };
        continue;
      }
      // Search for any record whose subject code equals or includes "ALL"
      const keys = Object.keys(groupedAttendance[sem]);
      const allKey = keys.find(
        (key) => key.toUpperCase() === "ALL" || key.toUpperCase().includes("ALL")
      );
      if (allKey) {
        totals[sem] = {
          entry1: parseFloat(groupedAttendance[sem][allKey].entry1).toFixed(2),
          entry2: parseFloat(groupedAttendance[sem][allKey].entry2).toFixed(2),
        };
        continue;
      }
      // Otherwise, compute the average over subjects (ignoring any that include "ALL" if accidentally present)
      let sumEntry1 = 0,
        countEntry1 = 0;
      let sumEntry2 = 0,
        countEntry2 = 0;
      for (const subjectCode in groupedAttendance[sem]) {
        if (subjectCode.toUpperCase().includes("ALL")) continue;
        let { entry1, entry2 } = groupedAttendance[sem][subjectCode];
        entry1 = parseFloat(entry1);
        entry2 = parseFloat(entry2);
        if (!isNaN(entry1)) {
          sumEntry1 += entry1;
          countEntry1++;
        }
        if (!isNaN(entry2)) {
          sumEntry2 += entry2;
          countEntry2++;
        }
      }
      totals[sem] = {
        entry1: countEntry1 > 0 ? (sumEntry1 / countEntry1).toFixed(2) : null,
        entry2: countEntry2 > 0 ? (sumEntry2 / countEntry2).toFixed(2) : null,
      };
    }
    return totals;
  };

  // Fetch student details, subjects, marks, and attendance data
  useEffect(() => {
    const fetchStudentData = async () => {
      const rollNo = localStorage.getItem("studentRollNo");
      if (!rollNo) {
        navigate("/student-login");
        return;
      }
      try {
        // Fetch student details
        const studentResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/students/${rollNo}`
        );
        if (studentResponse.data) {
          const fetchedStudent = studentResponse.data;
          setStudentDetails(fetchedStudent);

          // Fetch subjects based on branch and batchYear
          const subjectsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/subjects`,
            {
              params: {
                branch: fetchedStudent.branch,
                batchYear: fetchedStudent.batchYear,
              },
            }
          );
          setSubjects(groupBySemester(subjectsResponse.data));

          // Fetch marks for the student
          const marksResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/students/marks`,
            { params: { rollNumber: rollNo } }
          );
          setMarks(groupMarksBySemester(marksResponse.data));

          // Fetch attendance for the student
          const attendanceResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/students/attendance`,
            { params: { rollNumber: rollNo } }
          );
          // The API returns an object keyed by semester
          setAttendance(attendanceResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  // Group subjects by semester (expects an array from API)
  const groupBySemester = (subjects) => {
    return subjects.reduce((acc, subject) => {
      const sem = subject.semester;
      // Force subject codes to uppercase for consistency
      subject.subject_code = subject.subject_code.toUpperCase();
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(subject);
      return acc;
    }, {});
  };

  // Group marks by semester
  const groupMarksBySemester = (marks) => {
    return marks.reduce((acc, mark) => {
      const sem = mark.semester;
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(mark);
      return acc;
    }, {});
  };

  const handleLogout = () => {
    localStorage.removeItem("studentRollNo");
    navigate("/");
  };

  const HomeButton = () => (
    <button className="homebutton" onClick={() => setSelectedTab("details")}>
      Home
    </button>
  );

  // Render tab content based on the selected tab
  const renderTabContent = () => {
    if (loading) return <p>Loading data...</p>;

    switch (selectedTab) {
      case "details":
        return (
          <div className="tab-content details-tab">
            <h2>Student Details</h2>
            {studentDetails ? (
              <>
                <p>
                  <strong>Name:</strong> {studentDetails.name}
                </p>
                <p>
                  <strong>DOB:</strong> {studentDetails.dob}
                </p>
                <p>
                  <strong>Roll Number:</strong> {studentDetails.rollNumber}
                </p>
                <p>
                  <strong>Register Number:</strong> {studentDetails.registerNumber}
                </p>
                <p>
                  <strong>Branch:</strong> {studentDetails.branch}
                </p>
                <p>
                  <strong>Section:</strong> {studentDetails.section}
                </p>
                <strong>Counsellor Names:</strong>
                <ul>
                  <li>
                    <strong>1st Year:</strong> {studentDetails.firstYearCounselor}
                  </li>
                  <li>
                    <strong>2nd Year:</strong> {studentDetails.secondYearCounselor}
                  </li>
                  <li>
                    <strong>3rd Year:</strong> {studentDetails.thirdYearCounselor}
                  </li>
                  <li>
                    <strong>4th Year:</strong> {studentDetails.finalYearCounselor}
                  </li>
                </ul>
              </>
            ) : (
              <p>No details available.</p>
            )}
          </div>
        );
      case "subjects":
        return (
          <div className="tab-content subjects-tab">
            <h2>Subjects</h2>
            {Object.keys(subjects).map((semester) => (
              <div key={semester} className="semester-table">
                <h3>Semester {semester}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects[semester].map((subject, index) => (
                      <tr key={subject.subject_id || index}>
                        <td>{subject.subject_code}</td>
                        <td>{subject.subject_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        );
      case "attendance":
        // Restructure the attendance data from the API into a lookup object keyed by subject code.
        const groupedAttendance = restructureAttendance(attendance);
        // Compute total/average attendance for each semester.
        // This function now prioritizes the API's total field, then an "ALL" record.
        const attendanceTotals = computeTotalAttendance(attendance, groupedAttendance);

        return (
          <div className="tab-content attendance-tab">
            <h2>Attendance</h2>
            {Object.keys(subjects).length > 0 ? (
              Object.keys(subjects)
                .sort((a, b) => a - b)
                .map((semester) => (
                  <div key={semester} className="semester-attendance">
                    <h3>Semester {semester}</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Subject Code</th>
                          <th>Subject Name</th>
                          <th>Entry1</th>
                          <th>Entry2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects[semester].map((subject, index) => {
                          const subjAttendance =
                            groupedAttendance[semester] &&
                            groupedAttendance[semester][subject.subject_code];
                          const formatPercentage = (value) =>
                            value !== "" && value !== null
                              ? `${parseFloat(value).toFixed(2)}%`
                              : "N/A";
                          return (
                            <tr key={subject.subject_id || index}>
                              <td>{subject.subject_code}</td>
                              <td>{subject.subject_name}</td>
                              <td>
                                {(subjAttendance?.entry1 ?? null) !== null
                                  ? formatPercentage(subjAttendance.entry1)
                                  : "N/A"}
                              </td>
                              <td>
                                {(subjAttendance?.entry2 ?? null) !== null
                                  ? formatPercentage(subjAttendance.entry2)
                                  : "N/A"}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="total-row">
                          <td colSpan="2">
                            <strong>Total Percentage</strong>
                          </td>
                          <td>
                            {(attendanceTotals[semester]?.entry1 ?? null) !== null
                              ? `${attendanceTotals[semester].entry1}%`
                              : "N/A"}
                          </td>
                          <td>
                            {(attendanceTotals[semester]?.entry2 ?? null) !== null
                              ? `${attendanceTotals[semester].entry2}%`
                              : "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))
            ) : (
              <p>No attendance records available.</p>
            )}
          </div>
        );
      case "results":
        return (
          <div className="tab-content results-tab">
            <h2>Results</h2>
            {Object.keys(marks).length > 0 ? (
              Object.keys(marks).map((semester) => (
                <div key={semester} className="semester-results">
                  <h3>Semester {semester}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>CAT 1</th>
                        <th>CAT 2</th>
                        <th>Model</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks[semester].map((mark, index) => (
                        <tr key={mark.marks_id || index}>
                          <td>{mark.subject_code}</td>
                          <td>{getSubjectName(semester, mark.subject_code)}</td>
                          <td>{mark.cat1 !== null ? mark.cat1 : "N/A"}</td>
                          <td>{mark.cat2 !== null ? mark.cat2 : "N/A"}</td>
                          <td>{mark.model !== null ? mark.model : "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p>No marks available.</p>
            )}
          </div>
        );
      case "doubtBot":
        return (
          <div className="tab-content doubt-bot-tab">
            <div className="doubt-bot-container">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="subject-grid">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject.subject_id}
                    className="subject-card"
                    onClick={() =>
                      navigate(
                        `/student-dashboard/doubt-bot/${encodeURIComponent(
                          subject.subject_code
                        )}`
                      )
                    }
                  >
                    <div className="avatar">
                      <img
                        src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(
                          subject.subject_code
                        )}`}
                        className="avatar-img"
                        alt="avatar"
                      />
                    </div>
                    <h3 className="subject-title">{subject.subject_name}</h3>
                    <div className="download-options">
                      <button
                        className="download-btn pyq"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPYQ(subject.subject_code);
                        }}
                      >
                        PYQ's
                      </button>
                      <button
                        className="download-btn notes"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadNotes(subject.subject_code);
                        }}
                      >
                        Notes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <p>Select a tab to view content.</p>;
    }
  };

  return (
    <div className="student-dashboard">
      <div className="taskbar">
        <div className="taskbar-left">
          <button className="nav-toggle" onClick={toggleNav}>
            {navActive ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        <div className="taskbar-center">
          <div className="brand">Student Dashboard</div>
          <div className="nav-links">
            <button onClick={() => setSelectedTab("details")}>Details</button>
            <button onClick={() => setSelectedTab("subjects")}>Subjects</button>
            <button onClick={() => setSelectedTab("attendance")}>Attendance</button>
            <button onClick={() => setSelectedTab("results")}>Results</button>
            <button onClick={() => setSelectedTab("doubtBot")}>Doubt-Bot</button>
          </div>
        </div>
        <div className="taskbar-right">
          {selectedTab === "details" ? (
            <button className="log-out" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="homebutton" onClick={() => setSelectedTab("details")}>
              Home
            </button>
          )}
        </div>
        <div className={`nav-links mobile ${navActive ? "active" : ""}`}>
          <button
            onClick={() => {
              setSelectedTab("details");
              toggleNav();
            }}
          >
            Details
          </button>
          <button
            onClick={() => {
              setSelectedTab("subjects");
              toggleNav();
            }}
          >
            Subjects
          </button>
          <button
            onClick={() => {
              setSelectedTab("attendance");
              toggleNav();
            }}
          >
            Attendance
          </button>
          <button
            onClick={() => {
              setSelectedTab("results");
              toggleNav();
            }}
          >
            Results
          </button>
          <button
            onClick={() => {
              setSelectedTab("doubtBot");
              toggleNav();
            }}
          >
            Doubt-Bot
          </button>
        </div>
      </div>
      <div className="main-content">{renderTabContent()}</div>
    </div>
  );
};

export default StudentDashboard;
