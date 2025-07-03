const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Counter = require('../models/Counter');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const OtpVerification = require('../models/otpVerification');
const sendOtpEmail = require('../utils/sendOtpEmail');
const router = express.Router();

exports.registerUser = async (req, res) => {
  const {
    firstName, lastName, mobile, aadhaar, email,
    password, state, district, role
  } = Object.fromEntries(
    Object.entries(req.body).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
  );

  console.log('📝 Received registration for:', email, mobile);

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

  try {
    console.log('🔍 Checking for existing user...');
    const existing = await User.findOne({ $or: [{ email }, { aadhaar }, { mobile }] }).session(session);


    if (existing) {
      console.warn('🚫 Duplicate user found');
      await session.abortTransaction();
      return res.status(400).json({ message: 'User already exists with this Email, Aadhaar or Mobile.' });
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Increment counter inside session
    const counter = await Counter.findOneAndUpdate(
      { role },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );

    const customId = `${role.toUpperCase()}_${String(counter.seq).padStart(3, '0')}`;

    console.log('🧾 Creating user with ID:', customId);

    const newUser = new User({
      customId,
      firstName,
      lastName,
      mobile,
      aadhaar,
      email,
      password: hashedPassword,
      state,
      district,
      roles: [role],
      isVerified: false,
      createdAt: new Date()
    });

    await newUser.save({ session });

    // 🔐 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Store OTP in DB with safe logging
    try {
      await OtpVerification.create({ email, otp });
      console.log('📝 OTP stored in database for:', email);
    } catch (otpErr) {
      console.error('❌ Failed to store OTP in DB:', otpErr);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: 'Failed to store OTP in database.' });
    }

    // 📧 Send OTP email
    try {
      await sendOtpEmail(email, otp);
      console.log('📨 OTP sent to:', email);
    } catch (emailErr) {
      console.error('❌ Failed to send OTP email:', emailErr.message);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: 'Failed to send OTP email.' });
    }

    await session.commitTransaction();
    session.endSession();

    console.log('✅ Registration successful for:', email);
    return res.status(200).json({
      message: 'Registration successful. OTP sent to your email.',
      email
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    console.error('🔥 Internal server error during registration:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
