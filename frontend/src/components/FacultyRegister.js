// src/components/FacultyRegister.js
import React, { useState } from 'react';
import '../styles/Register.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const FacultyRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
      const response = await axios.post(`http://localhost:5000/api/faculty/register`, formData);
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
            type="text"
            placeholder="Faculty Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
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
