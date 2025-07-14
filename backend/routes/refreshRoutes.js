// backend/routes/refreshRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyRefreshToken = require('../middleware/verifyRefreshToken');

router.post('/refresh-token', verifyRefreshToken, (req, res) => {
  const { userId, role } = req.user;

  // ✅ Generate a fresh access token (no `exp` in payload)
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // ✅ Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  console.log('✅ New access token issued for user:', userId);
  return res.status(200).json({ message: 'Access token refreshed' });
});

module.exports = router;
