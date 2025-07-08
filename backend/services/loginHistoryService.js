// services/loginHistoryService.js
const mongoose = require('mongoose');
const uaParser = require('ua-parser-js');
const LoginHistory = require('../models/LoginHistory'); // ✅ confirm correct path and casing

/**
 * Logs a login attempt to the LoginHistory collection.
 * 
 * @param {Object} req - The Express request object
 * @param {boolean} success - Whether the login attempt was successful
 * @param {Object} [user] - Optional Mongoose User document
 */
async function logLoginAttempt(req, success, user = null) {
  try {
    const identifier = req.body.identifier?.trim() || 'unknown';
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const device = uaParser(userAgent);

    const entry = new LoginHistory({
      identifier,
      ip,
      device,
      success,
      userId: user?._id || undefined,
    });

    await entry.save();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📌 Login history recorded for ${identifier} [${success ? '✅' : '❌'}]`);
    }
  } catch (err) {
    console.error('❌ Failed to log login attempt:', err.message);
  }
}

module.exports = {
  logLoginAttempt
};

