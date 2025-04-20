// src/components/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css'; // make sure this line is here

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin@cahcet') {
      navigate('/admin-dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="admin-login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        {error && <p>{error}</p>}
        <div className="filter-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="filter-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="action-button" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
