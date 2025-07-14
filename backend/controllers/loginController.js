const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpVerification = require('../models/otpVerification');
const { logLoginAttempt } = require('../services/loginHistoryService');

// Updated: Generate Refresh Token including role
const generateRefreshToken = user =>
  jwt.sign({ userId: user._id, role: user.roles }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// Generate Access Token (already correct)
const generateAccessToken = user =>
  jwt.sign({ userId: user._id, role: user.roles }, process.env.JWT_SECRET, { expiresIn: '15m' });


// Determine cookie flags based on environment
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
};

// -------------------- LOGIN WITH PASSWORD --------------------
exports.loginWithPassword = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const normalized = normalizeIdentifier(identifier);

    console.log(`🔐 Password login attempt for: ${normalized.display}`);

    const user = await User.findOne({
      $or: [
        { email: normalized.email },
        { mobile: normalized.mobile },
        { aadhaar: normalized.aadhaar }
      ]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await logLoginAttempt(req, false);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await logLoginAttempt(req, true, user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',     // false in dev
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Lax is safe for localhost
      maxAge: 15 * 60 * 1000 // ✅ 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',     // false in dev
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Lax is safe for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000                     // 7 days
    });

    return res.json({ userId: user._id, role: user.roles, message: 'Login successful' });
  } catch (err) {
    console.error('❌ Password login error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// -------------------- LOGIN WITH OTP --------------------
exports.loginWithOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const normalized = normalizeIdentifier(identifier);

    console.log(`🔐 OTP login attempt for: ${normalized.display}`);

    const user = await User.findOne({
      $or: [
        { email: normalized.email },
        { mobile: normalized.mobile },
        { aadhaar: normalized.aadhaar }
      ]
    });

    if (!user) {
      await logLoginAttempt(req, false);
      return res.status(404).json({ message: 'User not found' });
    }

    const otpEntry = await otpVerification.findOne({ email: user.email });

    if (!otpEntry || otpEntry.otp !== otp || otpEntry.expiresAt < new Date()) {
      await logLoginAttempt(req, false, user);
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    await otpVerification.deleteMany({ email: user.email });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await logLoginAttempt(req, true, user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',     // false in dev
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Lax is safe for localhost
      maxAge: 15 * 60 * 1000 // ✅ 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',     // false in dev
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Lax is safe for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000                     // 7 days
    });

    return res.json({ userId: user._id, role: user.roles, message: 'Login successful' });
  } catch (err) {
    console.error('❌ OTP login error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// -------------------- REFRESH TOKEN --------------------
exports.refreshToken = (req, res) => {
  const token = req.cookies?.refreshToken;

  console.log('🔁 Attempting refresh with token:', token); // 🔍 Debug log

  if (!token) {
    console.warn('❌ No refresh token cookie found');
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    console.log('🔁 Refresh token valid for user:', payload.userId);

    const accessToken = jwt.sign(
      { userId: payload.userId, role: payload.role }, // ✅ Include role here
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    });

    return res.json({ message: 'Access token refreshed' });
  } catch (err) {
    console.error('❌ Refresh token invalid/expired:', err.message);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// -------------------- LOGOUT --------------------
exports.logout = (req, res) => {
  console.log('👋 Logging out user');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  console.log('✅ Cookies cleared. Logout complete.');
  return res.status(200).json({ message: 'Logged out successfully' });
};

// -------------------- Utility --------------------
function normalizeIdentifier(identifier) {
  const trimmed = identifier.trim();
  const isEmail = trimmed.includes('@');

  return {
    email: isEmail ? trimmed.toLowerCase() : '',
    mobile: /^\d{10}$/.test(trimmed) ? trimmed : '',
    aadhaar: /^\d{12}$/.test(trimmed) ? trimmed : '',
    display: trimmed
  };
}
