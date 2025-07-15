require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const registerRoutes = require('./routes/registerRoutes');
const otpRoutes = require('./routes/otpRoutes');
const loginRoutes = require('./routes/loginRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const refreshRoutes = require('./routes/refreshRoutes');
const logoutRoutes = require('./routes/logoutRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',  // your frontend origin
  credentials: true                 // 🔥 allow sending cookies
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Error:', err));

app.get('/', (req, res) => res.send('🚀 Backend running...'));

// Routes
app.use('/api/auth', registerRoutes);
app.use('/api/auth', otpRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/auth', refreshRoutes);
app.use('/api/auth', logoutRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
