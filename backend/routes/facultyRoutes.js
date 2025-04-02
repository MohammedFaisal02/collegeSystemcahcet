// routes/facultyRoutes.js
const express = require("express");
const router = express.Router();
const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.decoded = decoded;
      next();
    });
  } else {
    res.status(403).json({ message: "No token provided" });
  }
};

// Faculty Login
// Faculty Login
router.post("/login", async (req, res) => {
  const { faculty_code, password } = req.body;

  if (!faculty_code || !password) {
    return res.status(400).json({ message: "Faculty code and password are required" });
  }

  try {
    // Get faculty from database
    const faculty = await sequelize.query(
      "SELECT * FROM faculties WHERE faculty_code = :faculty_code",
      {
        replacements: { faculty_code },
        type: QueryTypes.SELECT,
      }
    );

    if (!faculty.length) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Compare passwords
    if (faculty[0].password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT with faculty_code as a string
    const token = jwt.sign(
      {
        faculty_code: faculty[0].faculty_code.toString(),  // convert to string
        designation: faculty[0].designation,
        branch: faculty[0].branch
      },
      secretKey,
      { expiresIn: "1h" }
    );

    res.json({
      faculty: {
        code: faculty[0].faculty_code,
        name: faculty[0].faculty_name,
        designation: faculty[0].designation,
        branch: faculty[0].branch
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Faculty Registration
router.post("/register", async (req, res) => {
  const { faculty_code, faculty_name, designation, branch } = req.body;
  if (!faculty_code || !faculty_name || !designation || !branch) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existing = await sequelize.query(
      "SELECT faculty_code FROM faculties WHERE faculty_code = :faculty_code",
      {
        replacements: { faculty_code },
        type: QueryTypes.SELECT,
      }
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Faculty already exists" });
    }
    const password = faculty_name.replace(/\s+/g, '').substring(0, 4).toUpperCase() + 
                     faculty_code.toString().slice(-4);
    await sequelize.query(
      `INSERT INTO faculties 
       (faculty_code, faculty_name, designation, branch, password)
       VALUES (:code, :name, :designation, :branch, :password)`,
      {
        replacements: {
          code: faculty_code,
          name: faculty_name,
          designation,
          branch,
          password
        },
        type: QueryTypes.INSERT,
      }
    );
    res.status(201).json({
      message: "Faculty registered successfully",
      faculty_code,
      generated_password: password
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Faculty Details (protected route)
router.get("/details", verifyToken, async (req, res) => {
  const { faculty_code } = req.query;
  if (!faculty_code) {
    return res.status(400).json({ message: "Faculty code is required" });
  }
  // Ensure the token's faculty_code matches the requested faculty_code
  if (req.decoded.faculty_code !== faculty_code) {
    return res.status(403).json({ message: "Unauthorized access" });
  }
  try {
    const faculty = await sequelize.query(
      "SELECT faculty_code, faculty_name, designation, branch FROM faculties WHERE faculty_code = :faculty_code",
      {
        replacements: { faculty_code },
        type: QueryTypes.SELECT,
      }
    );
    if (!faculty.length) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.json(faculty[0]);
  } catch (error) {
    console.error("Details error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save or Update marks (Assessments)
router.post("/marks", async (req, res) => {
  try {
    const { branch, section, semester, batchYear, subjectCode, examType, assessments } = req.body;
    if (!branch || !section || !semester || !batchYear || !subjectCode || !examType || !assessments || !Array.isArray(assessments)) {
      return res.status(400).json({ error: "Missing required fields or invalid data format." });
    }
    for (const assessment of assessments) {
      const { rollNumber, marks } = assessment;
      const existingRecord = await sequelize.query(
        "SELECT * FROM marks WHERE rollNumber = ? AND subject_code = ?",
        {
          replacements: [rollNumber, subjectCode],
          type: QueryTypes.SELECT,
        }
      );
      if (existingRecord.length > 0) {
        const updateField =
          examType === "CAT1"
            ? "cat1_marks"
            : examType === "CAT2"
            ? "cat2_marks"
            : examType === "MODEL"
            ? "model_marks"
            : null;
        if (!updateField) {
          return res.status(400).json({ error: "Invalid exam type." });
        }
        await sequelize.query(
          `UPDATE marks SET ${updateField} = ? WHERE rollNumber = ? AND subject_code = ?`,
          {
            replacements: [marks, rollNumber, subjectCode],
            type: QueryTypes.UPDATE,
          }
        );
      } else {
        await sequelize.query(
          `INSERT INTO marks (rollNumber, subject_code, cat1_marks, cat2_marks, model_marks, batchYear, semester, section, branch)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              rollNumber,
              subjectCode,
              examType === "CAT1" ? marks : null,
              examType === "CAT2" ? marks : null,
              examType === "MODEL" ? marks : null,
              batchYear,
              semester,
              section,
              branch,
            ],
            type: QueryTypes.INSERT,
          }
        );
      }
    }
    res.json({ message: "Assessments stored successfully!" });
  } catch (error) {
    console.error("Error storing assessments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Students List
router.get("/students", async (req, res) => {
  try {
    const { branch, section, academicYear, semester, subjectCode } = req.query;
    if (!branch || !section || !academicYear) {
      return res.status(400).json({ error: "Branch, section, and academicYear are required." });
    }
    const query = `
      SELECT * FROM students
      WHERE branch = ? AND section = ? AND batchYear = ?
      ORDER BY rollNumber ASC
    `;
    const students = await sequelize.query(query, {
      replacements: [branch, section, academicYear],
      type: QueryTypes.SELECT,
    });
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Attendance Percentage
router.get("/attendance/percentage", async (req, res) => {
  const { branch, academicYear, semester, section, subject_code, from_date, to_date, entry } = req.query;
  if (!branch || !academicYear || !semester || !section || !from_date || !to_date || !entry || !subject_code) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    if (subject_code !== "ALL") {
      const results = await sequelize.query(
        `SELECT 
            a.rollNumber, 
            s.name AS student_name, 
            a.subject_code,
            SUM(CASE WHEN a.record = 'P' THEN 1 ELSE 0 END) AS present_count,
            COUNT(*) AS total_periods
         FROM attendance a
         JOIN students s ON a.rollNumber = s.rollNumber
         WHERE a.branch = :branch
           AND a.batchYear = :academicYear
           AND a.semester = :semester
           AND a.section = :section
           AND a.subject_code = :subject_code
           AND a.attendance_date BETWEEN :from_date AND :to_date
         GROUP BY a.rollNumber, s.name, a.subject_code`,
        {
          replacements: {
            branch,
            academicYear,
            semester: Number(semester),
            section,
            subject_code,
            from_date,
            to_date
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const computedResults = results.map((row) => {
        const pCount = Number(row.present_count);
        const tPeriods = Number(row.total_periods);
        const percentage = tPeriods ? parseFloat(((pCount / tPeriods) * 100).toFixed(2)) : 0;
        return {
          branch,
          academic_year: academicYear,
          semester: Number(semester),
          section,
          subject_code,
          roll_number: row.rollNumber,
          student_name: row.student_name || "",
          present_count: pCount,
          total_days: tPeriods,
          percentage,
          from_date,
          to_date,
          entry
        };
      });

      for (const record of computedResults) {
        await sequelize.query(
          `INSERT INTO attendance_percentage 
           (branch, academic_year, semester, section, subject_code, roll_number, student_name, present_count, total_days, percentage, from_date, to_date, entry)
           VALUES (:branch, :academic_year, :semester, :section, :subject_code, :roll_number, :student_name, :present_count, :total_days, :percentage, :from_date, :to_date, :entry)
           ON DUPLICATE KEY UPDATE
             present_count = VALUES(present_count),
             total_days = VALUES(total_days),
             percentage = VALUES(percentage)`,
          {
            replacements: record,
            type: sequelize.QueryTypes.INSERT,
          }
        );
      }
      return res.json(computedResults);
    } else {
      const results = await sequelize.query(
        `SELECT 
            a.rollNumber, 
            s.name AS student_name, 
            a.subject_code,
            SUM(CASE WHEN a.record = 'P' THEN 1 ELSE 0 END) AS present_count,
            COUNT(*) AS total_periods
         FROM attendance a
         JOIN students s ON a.rollNumber = s.rollNumber
         WHERE a.branch = :branch
           AND a.batchYear = :academicYear
           AND a.semester = :semester
           AND a.section = :section
           AND a.attendance_date BETWEEN :from_date AND :to_date
         GROUP BY a.rollNumber, s.name, a.subject_code`,
        {
          replacements: {
            branch,
            academicYear,
            semester: Number(semester),
            section,
            from_date,
            to_date
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const groupedResults = {};
      results.forEach((row) => {
        if (!groupedResults[row.rollNumber]) {
          groupedResults[row.rollNumber] = {
            branch,
            academic_year: academicYear,
            semester: Number(semester),
            section,
            roll_number: row.rollNumber,
            student_name: row.student_name || "",
            subjects: [],
          };
        }
        groupedResults[row.rollNumber].subjects.push({
          subject_code: row.subject_code,
          present_count: Number(row.present_count),
          total_periods: Number(row.total_periods),
          percentage:
            Number(row.total_periods) > 0
              ? parseFloat(((Number(row.present_count) / Number(row.total_periods)) * 100).toFixed(2))
              : 0,
        });
      });

      const computedResults = Object.values(groupedResults).map((student) => {
        const overallPresent = student.subjects.reduce((acc, subj) => acc + subj.present_count, 0);
        const overallTotal = student.subjects.reduce((acc, subj) => acc + subj.total_periods, 0);
        const overallPerc = overallTotal > 0 ? parseFloat(((overallPresent / overallTotal) * 100).toFixed(2)) : 0;
        return {
          branch,
          academic_year: academicYear,
          semester: Number(semester),
          section,
          roll_number: student.roll_number,
          student_name: student.student_name,
          present_count: overallPresent,
          total_days: overallTotal,
          percentage: overallPerc,
          from_date,
          to_date,
          entry,
          subject_code: "ALL",
          subject_breakdown: JSON.stringify(student.subjects),
        };
      });

      for (const record of computedResults) {
        const existingRecord = await sequelize.query(
          `SELECT * FROM attendance_percentage 
           WHERE branch = :branch 
             AND academic_year = :academic_year 
             AND semester = :semester 
             AND section = :section 
             AND roll_number = :roll_number 
             AND from_date = :from_date 
             AND to_date = :to_date 
             AND entry = :entry
             AND subject_code = :subject_code`,
          {
            replacements: record,
            type: sequelize.QueryTypes.SELECT,
          }
        );
        if (existingRecord && existingRecord.length > 0) {
          await sequelize.query(
            `UPDATE attendance_percentage 
             SET present_count = :present_count,
                 total_days = :total_days,
                 percentage = :percentage,
                 subject_breakdown = :subject_breakdown,
                 subject_code = :subject_code
             WHERE branch = :branch 
               AND academic_year = :academic_year 
               AND semester = :semester 
               AND section = :section 
               AND roll_number = :roll_number 
               AND from_date = :from_date 
               AND to_date = :to_date 
               AND entry = :entry
               AND subject_code = :subject_code`,
            {
              replacements: record,
              type: sequelize.QueryTypes.UPDATE,
            }
          );
        } else {
          await sequelize.query(
            `INSERT INTO attendance_percentage 
             (branch, academic_year, semester, section, roll_number, student_name, present_count, total_days, percentage, from_date, to_date, entry, subject_code, subject_breakdown)
             VALUES (:branch, :academic_year, :semester, :section, :roll_number, :student_name, :present_count, :total_days, :percentage, :from_date, :to_date, :entry, :subject_code, :subject_breakdown)`,
            {
              replacements: record,
              type: sequelize.QueryTypes.INSERT,
            }
          );
        }
      }
      return res.json(computedResults);
    }
  } catch (error) {
    console.error("Error in attendance percentage calculation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Save attendance
router.post("/attendance", async (req, res) => {
  try {
    const { branch, section, batchYear, semester, subject_code, attendance_date, attendanceData } = req.body;
    if (!branch || !section || !batchYear || !semester || !subject_code || !attendance_date || !attendanceData || !Array.isArray(attendanceData)) {
      console.error("Invalid request data:", req.body);
      return res.status(400).json({ error: "Missing required fields or invalid data format." });
    }
    for (const recordData of attendanceData) {
      if (!recordData || !recordData.rollNumber || !recordData.record || !recordData.period || recordData.day_order === undefined) {
        console.error("Invalid attendance record:", recordData);
        continue;
      }
      const { rollNumber, record, period, day_order } = recordData;
      const existingRecord = await sequelize.query(
        "SELECT * FROM attendance WHERE rollNumber = ? AND subject_code = ? AND attendance_date = ? AND period = ? AND day_order = ?",
        {
          replacements: [rollNumber, subject_code, attendance_date, period, day_order],
          type: QueryTypes.SELECT,
        }
      );
      if (existingRecord.length > 0) {
        return res.status(400).json({
          error: `Attendance for roll number ${rollNumber} for period ${period} on ${attendance_date} (Day Order: ${day_order}) is already recorded.`,
        });
      }
      await sequelize.query(
        `INSERT INTO attendance 
         (rollNumber, batchYear, semester, section, subject_code, branch, attendance_date, period, day_order, record)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [rollNumber, batchYear, semester, section, subject_code, branch, attendance_date, period, day_order, record],
          type: QueryTypes.INSERT,
        }
      );
    }
    res.json({ message: "Attendance saved successfully!" });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET student academic results
router.get("/student/results", async (req, res) => {
  try {
    const { rollNumber } = req.query;
    if (!rollNumber) {
      return res.status(400).json({ error: "Missing rollNumber parameter" });
    }
    const student = await sequelize.query(
      "SELECT branch, batchYear FROM students WHERE rollNumber = ?",
      {
        replacements: [rollNumber],
        type: QueryTypes.SELECT,
      }
    );
    if (!student || student.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    const { branch, batchYear } = student[0];
    const results = await sequelize.query(
      `SELECT 
          s.subject_code, 
          s.subject_name, 
          s.semester,
          m.cat1_marks AS cat1,
          m.cat2_marks AS cat2,
          m.model_marks AS model
       FROM subjects s
       LEFT JOIN marks m 
         ON s.subject_code = m.subject_code 
         AND m.rollNumber = :rollNumber
       WHERE s.branch = :branch 
         AND s.batchYear = :batchYear
       ORDER BY s.semester, s.subject_code`,
      {
        replacements: { rollNumber, branch, batchYear },
        type: QueryTypes.SELECT,
      }
    );
    res.json(results);
  } catch (error) {
    console.error("Error fetching student academic results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET student attendance
router.get("/student/attendance", async (req, res) => {
  try {
    const { rollNumber } = req.query;
    if (!rollNumber) {
      return res.status(400).json({ error: "Missing rollNumber parameter" });
    }
    const attendanceRecords = await sequelize.query(
      `SELECT * FROM attendance_percentage 
       WHERE roll_number = :rollNumber 
       ORDER BY semester, entry`,
      {
        replacements: { rollNumber },
        type: QueryTypes.SELECT,
      }
    );
    res.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
