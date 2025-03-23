// server.js
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting (adjust as needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(limiter);
app.options('*', cors(corsOptions));

// Database (if needed)
// const sequelize = require('./config/db');
// sequelize.sync({ alter: true })
//   .then(() => console.log('Database connected'))
//   .catch(err => console.error('DB error:', err));

// Mount routes
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const botRoutes = require('./routes/botRoutes');

app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/ask', botRoutes);

// Simple health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "active", ai: "ready" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
