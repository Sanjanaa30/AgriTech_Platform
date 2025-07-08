const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpVerification = require('../models/otpVerification');
const { logLoginAttempt } = require('../services/loginHistoryService'); // ✅ Correct import

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
      await logLoginAttempt(req, false); // ❌ login failed
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateJwtToken(user);

    await logLoginAttempt(req, true, user); // ✅ login success

    return res.json({
      token,
      userId: user._id,
      role: user.roles,
      message: 'Login successful'
    });

  } catch (err) {
    console.error('❌ Password login error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

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
      await logLoginAttempt(req, false); // ❌ user not found
      return res.status(404).json({ message: 'User not found' });
    }

    const otpEntry = await otpVerification.findOne({ email: user.email });

    if (!otpEntry || otpEntry.otp !== otp || otpEntry.expiresAt < new Date()) {
      await logLoginAttempt(req, false, user); // ❌ invalid OTP
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    await otpVerification.deleteMany({ email: user.email });

    const token = generateJwtToken(user);

    await logLoginAttempt(req, true, user); // ✅ OTP login success

    return res.json({
      token,
      userId: user._id,
      role: user.roles,
      message: 'OTP verified successfully'
    });

  } catch (err) {
    console.error('❌ OTP login error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

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

function generateJwtToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}
