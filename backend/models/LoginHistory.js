const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  userId: { type: String, ref: 'User' }, // ✅ fix: match UUID string _id
  ip: { type: String, required: true },
  device: { type: Object, required: true },
  location: { type: String },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('LoginHistory', loginHistorySchema); // ✅ confirm exact name
