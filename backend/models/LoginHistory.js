const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // Email, mobile, or Aadhaar
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: link to User
  ip: { type: String, required: true },         // Captures client IP address
  device: { type: Object, required: true },     // Parsed UA info (browser, OS, etc.)
  location: { type: String },                   // Optional: City/Country if geo-IP is added
  success: { type: Boolean, required: true },   // True if login succeeded
  timestamp: { type: Date, default: Date.now }  // Auto-filled timestamp
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
