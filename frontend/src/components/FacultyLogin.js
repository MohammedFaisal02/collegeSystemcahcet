// src/components/FacultyLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/FacultyLogin.css';

const FacultyLogin = () => {
  const [facultyCode, setFacultyCode] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/faculty/login`,
        { faculty_code: facultyCode, password },
        { validateStatus: (status) => status < 500 }
      );

      if (response.data.token && response.data.faculty) {
        // Store token and faculty code in localStorage
        localStorage.setItem('facultyToken', response.data.token);
        localStorage.setItem('facultyCode', response.data.faculty.code.toString());
        
        // If "Remember Me" is checked, use Credential Management API to store credentials
        if (remember && navigator.credentials) {
          try {
            const cred = new window.PasswordCredential({
              id: facultyCode,
              password: password
            });
            await navigator.credentials.store(cred);
          } catch (credError) {
            console.warn("Credential store failed:", credError);
          }
        }
        
        // Redirect to dashboard
        navigate('/faculty-dashboard');
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-login-container">
      <form onSubmit={handleLogin}>
  <h2><strong>Faculty Login</strong></h2>
  
  {error && <div className="error-message">{error}</div>}

  <input
    type="text"
    name="username"  // ✅ Ensure name is set correctly
    value={facultyCode}
    onChange={(e) => setFacultyCode(e.target.value)}
    placeholder="Faculty Code"
    required
    pattern="\d{7}"
    title="7-digit faculty code"
    autoComplete="username"
  />

  <input
    type="password"
    name="password" // ✅ Ensure name is set correctly
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Password"
    required
    minLength="8"
    autoComplete="current-password"
  />

  <button type="submit" disabled={loading}>
    {loading ? 'Logging in...' : 'Login'}
  </button>
</form>

    </div>
  );
};

export default FacultyLogin;
