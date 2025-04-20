const express = require("express");
const router = express.Router();
const sequelize = require("../config/db"); // Sequelize instance
const { QueryTypes } = require("sequelize");

router.get('/adminlist', async (req, res) => {
  try {
    const subjects = await sequelize.query(
      'SELECT * FROM subjects ORDER BY batchYear, semester',
      { type: QueryTypes.SELECT }
    );
    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { batchYear, semester, branch } = req.query;

    if (!branch || !batchYear || !semester) {
      return res.status(400).json({ error: "semester, branch, batchYear are required" });
    }

    const subjects = await sequelize.query(
      'SELECT * FROM subjects WHERE branch = ? AND batchYear = ? AND semester = ? ORDER BY semester',
      {
        replacements: [branch, batchYear, semester], // Pass query parameters safely
        type: QueryTypes.SELECT, // Ensure it returns an array of objects
      }
    );

    if (subjects.length === 0) {
      return res.status(404).json({ error: "No subjects found for the given branch and batchYear" });
    }

    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get subject details by subject code, returning subject name
router.get("/:subjectCode", async (req, res) => {
  try {
    // Normalize the subject code to uppercase and trim spaces
    const subjectCode = req.params.subjectCode.trim().toUpperCase();
    
    const subject = await sequelize.query(
      `SELECT subject_code, subject_name 
       FROM subjects 
       WHERE subject_code = ?`,
      {
        replacements: [subjectCode],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!subject || subject.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: `Subject with code ${subjectCode} not found` 
      });
    }

    // Return the subject name along with subject code
    res.json({
      success: true,
      subject_code: subject[0].subject_code,
      subject_name: subject[0].subject_name
    });
  } catch (error) {
    console.error("Error fetching subject:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
});

// Get subjects by branch and batchYear
router.get('/', async (req, res) => {
  try {
    const { branch, batchYear} = req.query;

    if (!branch || !batchYear) {
      return res.status(400).json({ error: "Both branch and batchYear are required" });
    }

    const subjects = await sequelize.query(
      'SELECT * FROM subjects WHERE branch = ? AND batchYear = ? ORDER BY semester',
      {
        replacements: [branch, batchYear], // Pass query parameters safely
        type: QueryTypes.SELECT, // Ensure it returns an array of objects
      }
    );

    if (subjects.length === 0) {
      return res.status(404).json({ error: "No subjects found for the given branch and batchYear" });
    }

    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
