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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration with dynamic origin handling
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://college-systemcahcet.vercel.app',
      'https://main.d1dqbntcyikp3v.amplifyapp.com',
      'https://localhost:3000'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};


app.use(express.json());
app.use(cors());
app.use(limiter);
app.options('*', cors(corsOptions));

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
