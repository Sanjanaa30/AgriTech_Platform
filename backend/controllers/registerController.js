const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Counter = require('../models/Counter');
const { v4: uuidv4 } = require('uuid');

exports.registerUser = async (req, res) => {
  const {
    firstName, lastName, mobile, aadhaar, email,
    password, state, district, role
  } = Object.fromEntries(
    Object.entries(req.body).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
  );

  console.log('📝 Received registration for:', mobile);

  if (!firstName || !lastName || !mobile || !aadhaar || !email || !password || !state || !district || !role) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  const mobileRegex = /^\+91\d{10}$/;
  const aadhaarRegex = /^\d{12}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ message: 'Mobile must be +91 followed by 10 digits.' });
  }

  if (!aadhaarRegex.test(aadhaar)) {
    return res.status(400).json({ message: 'Aadhaar must be exactly 12 digits.' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must meet complexity requirements.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for existing user (inside session)
    const existing = await User.findOne({
      $or: [{ email }, { aadhaar }, { mobile }]
    }).session(session);

    if (existing) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'User already exists with this Email, Aadhaar or Mobile.' });
    }

    // Hash password here 🔐
    const hashedPassword = await bcrypt.hash(password, 10);

    // Increment counter inside session
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
      email,
      password: hashedPassword,
      state,
      district,
      roles: [role],
      isVerified: false,
      createdAt: new Date()
    });

    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
