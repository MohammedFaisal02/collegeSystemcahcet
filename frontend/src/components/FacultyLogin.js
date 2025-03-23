// src/components/FacultyLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import '../styles/FacultyLogin.css';

const FacultyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Optionally store token/email in localStorage
      localStorage.setItem('facultyToken', idToken);
      localStorage.setItem('facultyEmail', email);

      // Send the idToken and email to your backend for verification and to fetch faculty details
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/login`, { idToken, email });
      navigate('/faculty-dashboard');
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="faculty-login-container">
      <form onSubmit={handleLogin}>
        <h2><strong>Faculty Login</strong></h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
  
};

export default FacultyLogin;
