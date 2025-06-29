const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4 // UUID as the primary key
  },
  customId: {
    type: String,
    unique: true // Example: FARMER_001, EXPERT_002
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
    unique: true
  },
  aadhaar: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true // hashed with bcrypt
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
    type: [String], // Stores array like ['farmer'], ['farmer', 'expert']
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false // Set to true after OTP verification
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
