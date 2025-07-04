const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Counter = require('../models/Counter');
const { v4: uuidv4 } = require('uuid');
const { createAndSendOtp } = require('./otpController');
const otpVerification = require('../models/otpVerification');

// Instead of saving to DB, only send OTP for verification
exports.registerUser = async (req, res) => {
  const {
    firstName, lastName, mobile, aadhaar, email,
    password, state, district, role
  } = Object.fromEntries(
    Object.entries(req.body).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
  );

  console.log('📝 Received registration for:', email);

  if (!firstName || !lastName || !mobile || !aadhaar || !email || !password || !state || !district || !role) {
    console.warn('⛔ Missing required fields');
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  const mobileRegex = /^\+91\d{10}$/;
  const aadhaarRegex = /^\d{12}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    console.warn('⛔ Invalid email:', email);
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (!mobileRegex.test(mobile)) {
    console.warn('⛔ Invalid mobile:', mobile);
    return res.status(400).json({ message: 'Mobile must be +91 followed by 10 digits.' });
  }

  if (!aadhaarRegex.test(aadhaar)) {
    console.warn('⛔ Invalid Aadhaar:', aadhaar);
    return res.status(400).json({ message: 'Aadhaar must be exactly 12 digits.' });
  }

  if (!passwordRegex.test(password)) {
    console.warn('⛔ Weak password.');
    return res.status(400).json({ message: 'Password must meet complexity requirements.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  console.log('🔍 Checking for existing user...');

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile }, { aadhaar }] });
  if (existing) {
    console.warn('🚫 User already exists');
    return res.status(400).json({ message: 'User already exists with this Email, Aadhaar or Mobile.' });
  }

  // ✅ Only send OTP here; user creation will happen after OTP verified
  try {
    await createAndSendOtp(normalizedEmail);
    console.log('📨 OTP sent to:', normalizedEmail);
    return res.status(200).json({ message: 'OTP sent to your email for verification.', email: normalizedEmail });
  } catch (err) {
    console.error('❌ Failed to send OTP:', err.message);
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

exports.registerAfterOtp = async (req, res) => {
  const { otp, userData } = req.body;

  // ✅ Normalize all string fields from userData
  const normalizedData = Object.fromEntries(
    Object.entries(userData).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
  );
  const {
    firstName, lastName, mobile, aadhaar, email,
    password, state, district, role
  } = userData;

  if (!otp || !email) {
    return res.status(400).json({ message: 'OTP and email are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otpEntry = await otpVerification.findOne({ email: normalizedEmail });

  if (!otpEntry) {
    return res.status(400).json({ message: 'OTP not found. Please register again.' });
  }

  if (otpEntry.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }

  if (otpEntry.expiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP expired. Please re-register.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const counter = await Counter.findOneAndUpdate(
      { role },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );

    const customId = `${role.toUpperCase()}_${String(counter.seq).padStart(3, '0')}`;

    const newUser = new User({
      customId,
      firstName,
      lastName,
      mobile,
      aadhaar,
      email: normalizedEmail,
      password: hashedPassword,
      state,
      district,
      roles: [role],
      isVerified: true
    });

    await newUser.save({ session });
    await otpVerification.deleteMany({ email: normalizedEmail });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: 'User registered and verified successfully.' });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Error during registerAfterOtp:', err);
    return res.status(500).json({ message: 'Internal error. Please try again.' });
  }
};
