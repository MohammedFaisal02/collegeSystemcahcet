// src/components/CombinedLogin.js
import React from "react";
import { Link } from "react-router-dom";
import FacultyLogin from "./FacultyLogin";
import StudentLogin from "./StudentLogin";
import LoginBanner from "../data/LoginBanner.jpg";
import "../styles/CombinedLogin.css";

const CombinedLogin = () => {
  return (
    <div className="combined-login-container">
      <div className="banner-container">
        <img src={LoginBanner} alt="Login Banner" />
      </div>
      <div className="login-blocks">
        <div className="login-block faculty-login-block">
          <FacultyLogin />
          <div className="register-link">
            <p>Don't have an account?</p>
            <Link to="/faculty-register">
              <button className="link-button">Register as Faculty</button>
            </Link>
          </div>
        </div>
        <div className="login-block student-login-block">
          <StudentLogin />
          <div className="register-link">
            <p>Don't have an account?</p>
            <Link to="/student-register">
              <button className="link-button">Register as Student</button>
            </Link>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Link to="/admin-login">
        <button className="link-button">Admin Login</button>
      </Link>
    </div>
    </div>
  );
};

export default CombinedLogin;
