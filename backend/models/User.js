const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  customId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    index: true // ✅ index added
  },
  aadhaar: {
    type: String,
    required: true,
    unique: true,
    index: true // ✅ index added
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true // ✅ index added
  },
  password: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  roles: {
    type: [String],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false   // can be true if needed in OTP flow
  }
}, {
  timestamps: true // ✅ adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('User', userSchema);
