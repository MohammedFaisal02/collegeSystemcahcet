import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import StudentLogin from './components/StudentLogin';
import FacultyLogin from './components/FacultyLogin';
import StudentRegister from './components/StudentRegister';
import FacultyRegister from './components/FacultyRegister';
import RegisterPage from './components/RegisterPage';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import DoubtBot from "./components/DoubtBot";
import CombinedLogin from './components/CombinedLogin';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CombinedLogin />} />
                <Route path="/form-container" element={<RegisterPage />} />
                <Route path="/student-login" element={<StudentLogin />} />
                <Route path="/faculty-login" element={<FacultyLogin />} />
                <Route path="/student-register" element={<StudentRegister />} />
                <Route path="/faculty-register" element={<FacultyRegister />} />
                <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/student-dashboard/doubt-bot/:subjectCode" element={<DoubtBot />} />
            </Routes>
        </Router>
    );
}

export default App;