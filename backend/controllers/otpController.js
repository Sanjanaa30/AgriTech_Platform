const otpVerification = require('../models/otpVerification');
const sendOtpEmail = require('../utils/sendOtpEmail');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createAndSendOtp(email) {
  const otp = generateOtp();
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAtUtc = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in UTC

  await otpVerification.deleteMany({ email: normalizedEmail });

  await otpVerification.create({
    email: normalizedEmail,
    otp,
    expiresAt: expiresAtUtc
  });

  await sendOtpEmail(normalizedEmail, otp);

  // Optional (for development only):
  console.log(`🔐 OTP for ${normalizedEmail}: ${otp}`);

  return otp;
}

async function resendOtp(email) {
  if (!email) throw new Error('Email is required for resending OTP');

  const otp = generateOtp();
  const normalizedEmail = email.trim().toLowerCase();
  console.log(`🟡 Resend OTP triggered for: ${normalizedEmail}`);

  await otpVerification.deleteMany({ email: normalizedEmail });

  const newEntry = await otpVerification.create({
    email: normalizedEmail,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  console.log(`🟢 New OTP entry stored:`, newEntry);

  await sendOtpEmail(normalizedEmail, otp);

  console.log(`📤 OTP email sent to: ${normalizedEmail} | OTP: ${otp}`);

  return otp;
}

module.exports = {
  createAndSendOtp,
  resendOtp
};
