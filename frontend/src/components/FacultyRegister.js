// src/components/FacultyRegister.js
import React, { useState } from 'react';
import '../styles/Register.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FacultyRegister = () => {
  const [formData, setFormData] = useState({
    faculty_code: '',
    faculty_name: '',
    designation: '',
    branch: '',
  });

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend will compute the password using faculty_name and faculty_code
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/register`, formData);
      console.log('Registration successful:', response.data);
      alert('Faculty registered successfully');
      navigate('/');
    } catch (err) {
      console.error('Error registering faculty:', err);
      alert('Error occurred while registering');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Faculty Registration</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Faculty Code"
            name="faculty_code"
            value={formData.faculty_code}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="text"
            placeholder="Faculty Name"
            name="faculty_name"
            value={formData.faculty_name}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="text"
            placeholder="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
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
              Select Branch
            </option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="AIDS">AIDS</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>
          <button type="submit" className="register-btn">
            Register Faculty
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacultyRegister;
