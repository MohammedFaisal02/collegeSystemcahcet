// src/components/StudentRegister.js
import React, { useState } from "react";
import axios from "axios";
import "../styles/Register.css";
import { useNavigate } from "react-router-dom";
const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    dob: "",
    registerNumber: "",
    branch: "",
    section: "",
    batchYear: "",
    yearOfEntry: "",
    fatherName: "",
    fatherOccupation: "",
    educationOccupation: "",
    familyBackground: "",
    parentPhoneNo: "",
    address: "",
    languagesKnown: "",
    guardianName: "", // optional
    lastSchoolName: "",
    mediumOfInstructions: "",
    maths: "",
    physics: "",
    chemistry: "",
    cutOff: "",
    quota: "",
    firstYearCounselor: "",  // optional
    secondYearCounselor: "", // optional
    thirdYearCounselor: "",  // optional
    finalYearCounselor: "",  // optional
  });

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to convert optional fields to "N/A" if empty
  const normalizeOptionalFields = (data) => {
    return {
      ...data,
      guardianName: data.guardianName.trim() || "N/A",
      firstYearCounselor: data.firstYearCounselor.trim() || "N/A",
      secondYearCounselor: data.secondYearCounselor.trim() || "N/A",
      thirdYearCounselor: data.thirdYearCounselor.trim() || "N/A",
      finalYearCounselor: data.finalYearCounselor.trim() || "N/A",
    };
  };

  // Submit the form data to the API endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Normalize optional fields before sending
    const normalizedData = normalizeOptionalFields(formData);

    try {
      // Post the registration data to the server.
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/students/register`,
        normalizedData
      );
      console.log("Registration successful:", response.data);
      alert("Student registered successfully!");
      navigate("/"); // Redirect as needed (e.g., to login)
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Student Registration</h2>
        <form onSubmit={handleSubmit}>
          {/* Basic Student Details */}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name *"
            className="register-input"
            required
          />
          <input
            type="number"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            placeholder="Roll Number *"
            className="register-input"
            required
          />
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            placeholder="DOB *"
            className="register-input"
            required
          />
          <input
            type="number"
            name="registerNumber"
            value={formData.registerNumber}
            onChange={handleChange}
            placeholder="Register Number *"
            className="register-input"
            required
          />
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="register-input"
            required
          >
            <option value="" disabled>
              Select Branch *
            </option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="AIDS">AIDS</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>
          <select
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="register-input"
            required
          >
            <option value="" disabled>
              Select Section *
            </option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
          <select
            name="batchYear"
            value={formData.batchYear}
            onChange={handleChange}
            className="register-input"
            required
          >
            <option value="" disabled>
              Select Batch Year *
            </option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
          <input
            type="number"
            name="yearOfEntry"
            value={formData.yearOfEntry}
            onChange={handleChange}
            placeholder="Year of Entry *"
            className="register-input"
            required
          />

          {/* Parent and Background Details */}
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Father's Name *"
            className="register-input"
            required
          />
          <input
            type="text"
            name="fatherOccupation"
            value={formData.fatherOccupation}
            onChange={handleChange}
            placeholder="Father's Occupation *"
            className="register-input"
            required
          />
          <input
            type="text"
            name="educationOccupation"
            value={formData.educationOccupation}
            onChange={handleChange}
            placeholder="Education Occupation *"
            className="register-input"
            required
          />
          <textarea
            name="familyBackground"
            value={formData.familyBackground}
            onChange={handleChange}
            placeholder="Family Background *"
            className="register-input"
            required
          />
          <input
            type="number"
            name="parentPhoneNo"
            value={formData.parentPhoneNo}
            onChange={handleChange}
            placeholder="Parent's Phone Number *"
            className="register-input"
            required
          />
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address *"
            className="register-input"
            required
          />
          <input
            type="text"
            name="languagesKnown"
            value={formData.languagesKnown}
            onChange={handleChange}
            placeholder="Languages Known *"
            className="register-input"
            required
          />
          {/* Optional Field: Guardian Name */}
          <input
            type="text"
            name="guardianName"
            value={formData.guardianName}
            onChange={handleChange}
            placeholder="Guardian Name (optional)"
            className="register-input"
          />
          <input
            type="text"
            name="lastSchoolName"
            value={formData.lastSchoolName}
            onChange={handleChange}
            placeholder="Last School Name *"
            className="register-input"
            required
          />
          <input
            type="text"
            name="mediumOfInstructions"
            value={formData.mediumOfInstructions}
            onChange={handleChange}
            placeholder="Medium of Instructions *"
            className="register-input"
            required
          />

          {/* Academic Details */}
          <input
            type="number"
            name="maths"
            value={formData.maths}
            onChange={handleChange}
            placeholder="Marks in Maths *"
            className="register-input"
            required
          />
          <input
            type="number"
            name="physics"
            value={formData.physics}
            onChange={handleChange}
            placeholder="Marks in Physics *"
            className="register-input"
            required
          />
          <input
            type="number"
            name="chemistry"
            value={formData.chemistry}
            onChange={handleChange}
            placeholder="Marks in Chemistry *"
            className="register-input"
            required
          />
          <input
            type="number"
            name="cutOff"
            value={formData.cutOff}
            onChange={handleChange}
            placeholder="CutOff *"
            className="register-input"
            required
          />
          <input
            type="text"
            name="quota"
            value={formData.quota}
            onChange={handleChange}
            placeholder="Quota *"
            className="register-input"
            required
          />

          {/* Optional Counselor Names */}
          <input
            type="text"
            name="firstYearCounselor"
            value={formData.firstYearCounselor}
            onChange={handleChange}
            placeholder="Counselor Name (1st Year)"
            className="register-input"
          />
          <input
            type="text"
            name="secondYearCounselor"
            value={formData.secondYearCounselor}
            onChange={handleChange}
            placeholder="Counselor Name (2nd Year)"
            className="register-input"
          />
          <input
            type="text"
            name="thirdYearCounselor"
            value={formData.thirdYearCounselor}
            onChange={handleChange}
            placeholder="Counselor Name (3rd Year)"
            className="register-input"
          />
          <input
            type="text"
            name="finalYearCounselor"
            value={formData.finalYearCounselor}
            onChange={handleChange}
            placeholder="Counselor Name (Final Year)"
            className="register-input"
          />

          <button type="register-submit" className="submit-button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;
