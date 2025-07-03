// ✅ model/otpVerification.js
const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // TTL index
});

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
