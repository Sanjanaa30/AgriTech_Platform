// backend/server.js
require('dotenv').config();
console.log('JWT_SECRET at runtime:', process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const registerRoutes = require('./routes/registerRoutes');
const otpRoutes = require('./routes/otpRoutes');
const loginRoutes = require('./routes/loginRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cookieParser = require('cookie-parser');
const refreshRoutes = require('./routes/refreshRoutes');
const logoutRoutes = require('./routes/logoutRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200', // or wherever your frontend runs
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());


// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
console.log('🔗 Connecting to MongoDB using URI:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Backend running...');
});

// Register routes
app.use('/api/auth', registerRoutes);
app.use('/api/auth', otpRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', refreshRoutes);
app.use('/api/auth', logoutRoutes);
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
