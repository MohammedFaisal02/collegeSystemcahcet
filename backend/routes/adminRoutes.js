// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// —— Helper: custom rollNumber sort within group ——
function customRollSort(a, b) {
  const rollA = String(a.rollNumber || a.roll_number).trim();
  const rollB = String(b.rollNumber || b.roll_number).trim();
  const aHasR = /r/i.test(rollA);
  const bHasR = /r/i.test(rollB);
  if (aHasR && !bHasR) return 1;
  if (!aHasR && bHasR) return -1;
  const numA = parseInt(rollA.replace(/\D/g, ''), 10) || 0;
  const numB = parseInt(rollB.replace(/\D/g, ''), 10) || 0;
  return numA - numB;
}

// Composite sort: batchYear, branch, section, (optional date), then roll
function compositeSort(dayField) {
  return (a, b) => {
    if (a.batchYear !== b.batchYear) return a.batchYear - b.batchYear;
    if (a.branch !== b.branch) return String(a.branch).localeCompare(b.branch);
    if (a.section !== b.section) return String(a.section).localeCompare(b.section);
    if (dayField && a[dayField] !== b[dayField]) {
      return a[dayField] < b[dayField] ? -1 : 1;
    }
    return customRollSort(a, b);
  };
}

// 1️⃣ Day‑wise
router.get('/attendance/day', async (req, res, next) => {
  const { date, entry, branch } = req.query;
  const period = entry === 'AN' ? 5 : 1;
  try {
    const sql = `
      SELECT
        a.rollNumber  AS roll_number,
        s.name        AS student_name,
        a.branch,
        a.section,
        a.batchYear,
        a.record
      FROM attendance a
      JOIN students s ON a.rollNumber = s.rollNumber
      WHERE a.attendance_date = :date
        AND a.period = :period
        ${branch ? 'AND a.branch = :branch' : ''}
    `;
    const rows = await sequelize.query(sql, {
      replacements: { date, period, branch },
      type: QueryTypes.SELECT
    });
    const sorted = rows.sort(compositeSort());
    // Dedupe by roll_number
    const unique = [];
    const seen = new Set();
    for (const r of sorted) {
      if (!seen.has(r.roll_number)) {
        unique.push(r);
        seen.add(r.roll_number);
      }
    }
    res.json(unique);
  } catch (err) {
    next(err);
  }
});

// 2️⃣ Month‑wise
router.get('/attendance/month', async (req, res, next) => {
  const { month, entry, branch } = req.query;
  const period = entry === 'AN' ? 5 : 1;
  try {
    const sql = `
      SELECT
        a.rollNumber      AS roll_number,
        s.name            AS student_name,
        a.branch,
        a.section,
        a.batchYear,
        a.attendance_date,
        a.record
      FROM attendance a
      JOIN students s ON a.rollNumber = s.rollNumber
      WHERE DATE_FORMAT(a.attendance_date, '%Y-%m') = :month
        AND a.period = :period
        ${branch ? 'AND a.branch = :branch' : ''}
    `;
    const rows = await sequelize.query(sql, {
      replacements: { month, period, branch },
      type: QueryTypes.SELECT
    });
    const sorted = rows.sort(compositeSort('attendance_date'));
    res.json(sorted);
  } catch (err) {
    next(err);
  }
});

// 3️⃣ Duration‑wise
router.get('/attendance/duration', async (req, res, next) => {
  const { from, to, branch } = req.query;
  try {
    const sql = `
      SELECT
        a.rollNumber      AS roll_number,
        s.name            AS student_name,
        a.branch,
        a.section,
        a.batchYear,
        a.attendance_date,
        a.record
      FROM attendance a
      JOIN students s ON a.rollNumber = s.rollNumber
      WHERE a.attendance_date BETWEEN :from AND :to
        ${branch ? 'AND a.branch = :branch' : ''}
    `;
    const rows = await sequelize.query(sql, {
      replacements: { from, to, branch },
      type: QueryTypes.SELECT
    });
    const sorted = rows.sort(compositeSort('attendance_date'));
    res.json(sorted);
  } catch (err) {
    next(err);
  }
});

// 4️⃣ Subject‑wise
router.get('/attendance/subject', async (req, res, next) => {
  const { branch, subject, section } = req.query;
  try {
    const sql = `
      SELECT
        a.rollNumber      AS roll_number,
        s.name            AS student_name,
        a.branch,
        a.section,
        a.batchYear       AS batch,
        a.record
      FROM attendance a
      JOIN students s ON a.rollNumber = s.rollNumber
      WHERE a.branch = :branch
        AND a.subject_code = :subject
        AND a.section = :section
        AND a.attendance_date = CURDATE()
        AND a.period = 1
    `;
    const rows = await sequelize.query(sql, {
      replacements: { branch, subject, section },
      type: QueryTypes.SELECT
    });
    const sorted = rows.sort(compositeSort());
    res.json(sorted);
  } catch (err) {
    next(err);
  }
});

// 5️⃣ Below 75% Threshold
router.get('/attendance/threshold', async (req, res, next) => {
  const { branch } = req.query;
  try {
    const sql = `
      SELECT
        roll_number,
        student_name,
        branch,
        section,
        percentage
      FROM attendance_percentage
      WHERE percentage < 75
        AND subject_code = 'ALL'
        ${branch ? 'AND branch = :branch' : ''}
    `;
    const rows = await sequelize.query(sql, {
      replacements: { branch },
      type: QueryTypes.SELECT
    });
    const sorted = rows.sort((a, b) => {
      if (a.branch !== b.branch) return String(a.branch).localeCompare(b.branch);
      if (a.section !== b.section) return String(a.section).localeCompare(b.section);
      return customRollSort(a, b);
    });
    res.json(sorted);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
