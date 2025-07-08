const otpVerification = require('../models/otpVerification');
const sendOtpEmail = require('../utils/sendOtpEmail');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createAndSendOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();
  const expiresAtUtc = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  await otpVerification.deleteMany({ email: normalizedEmail });

  await otpVerification.create({ email: normalizedEmail, otp, expiresAt: expiresAtUtc });

  await sendOtpEmail(normalizedEmail, otp);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔐 OTP for ${normalizedEmail}: ${otp}`);
  }

  return otp;
}

async function resendOtp(email) {
  if (!email) throw new Error('Email is required for resending OTP');

  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();

  await otpVerification.deleteMany({ email: normalizedEmail });

  await otpVerification.create({
    email: normalizedEmail,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  await sendOtpEmail(normalizedEmail, otp);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`📤 Resent OTP to: ${normalizedEmail} | OTP: ${otp}`);
  }

  return otp;
}

module.exports = {
  createAndSendOtp,
  resendOtp
};
