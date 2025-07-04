const express = require('express');
const router = express.Router();
const User = require('../models/User');
const otpVerification = require('../models/otpVerification');
const { resendOtp } = require('../controllers/otpController');

// ✅ 1. Check verification status
router.get('/check-verification/:email', async (req, res) => {
  try {
    const normalizedEmail = req.params.email.trim().toLowerCase();
    console.log('📩 Checking verification for:', normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ isVerified: false });

    return res.status(200).json({ isVerified: user.isVerified });
  } catch (err) {
    console.error('❌ Verification check error:', err);
    res.status(500).json({ isVerified: false });
  }
});

// ✅ 2. Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    await resendOtp(email);
    return res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (err) {
    console.error('❌ Resend OTP failed:', err.message);
    return res.status(500).json({ message: 'Failed to resend OTP.' });
  }
});

module.exports = router;
