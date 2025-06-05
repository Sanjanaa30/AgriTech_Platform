const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  aadhaar: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  role: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
