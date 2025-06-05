const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
  const {
    firstName, lastName, mobile, aadhaar, email,
    password, state, district, role // ✅ role, not roles
  } = req.body;

  if (!firstName || !lastName || !mobile || !aadhaar || !password || !state || !district || !role) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  const mobileRegex = /^\+91\d{10}$/;
  const aadhaarRegex = /^\d{12}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ message: 'Mobile must be +91 followed by 10 digits.' });
  }

  if (!aadhaarRegex.test(aadhaar)) {
    return res.status(400).json({ message: 'Aadhaar must be exactly 12 digits.' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must meet complexity requirements.' });
  }

  try {
    const existing = await User.findOne({ $or: [{ aadhaar }, { mobile }] });
    if (existing) {
      return res.status(400).json({ message: 'User with this Aadhaar or Mobile already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      mobile,
      aadhaar,
      email,
      password: hashedPassword,
      state,
      district,
      role
    });

    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
