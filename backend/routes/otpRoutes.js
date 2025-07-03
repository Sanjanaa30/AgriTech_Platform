const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OtpVerification = require('../models/otpVerification');
const sendOtpEmail = require('../utils/sendOtpEmail'); // ✅ Make sure this path is correct

// ✅ 1. Check verification status
router.get('/check-verification/:email', async (req, res) => {
  try {
    console.log('📩 Checking verification for:', req.params.email);
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ isVerified: false });
    return res.status(200).json({ isVerified: user.isVerified });
  } catch (err) {
    console.error('❌ Verification check error:', err);
    res.status(500).json({ isVerified: false });
  }
});

// ✅ 2. OTP verification (with clearer error messages)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const entry = await OtpVerification.findOne({ email });

    if (!entry) {
      return res.status(400).json({ message: 'OTP expired or not found.' });
    }

    if (entry.otp !== otp) {
      return res.status(401).json({ message: 'Incorrect OTP.' });
    }

    await User.updateOne({ email }, { $set: { isVerified: true } });
    await OtpVerification.deleteOne({ _id: entry._id });

    res.status(200).json({ message: 'Verified successfully.' });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ✅ 3. Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // 💾 Delete old and store new OTP
    await OtpVerification.deleteMany({ email });
    await OtpVerification.create({ email, otp: newOtp });
    console.log('📝 OTP saved to DB for:', email);
  } catch (dbErr) {
    console.error('❌ Failed to store OTP in DB:', dbErr);
    return res.status(500).json({ message: 'Failed to generate new OTP.' });
  }

  try {
    // 📧 Send email
    await sendOtpEmail(email, newOtp);
    console.log('📨 OTP email sent to:', email);
  } catch (emailErr) {
    console.error('❌ Failed to send OTP email:', emailErr);
    return res.status(500).json({ message: 'OTP saved but failed to send email.' });
  }

  return res.status(200).json({ message: 'OTP resent successfully.' });
});


module.exports = router;
