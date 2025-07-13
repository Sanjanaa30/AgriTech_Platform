// routes/refreshRoutes.js (already used in your server.js)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyRefreshToken = require('../middleware/verifyRefreshToken'); // you’ll write this

router.post('/refresh-token', verifyRefreshToken, (req, res) => {
  const user = req.user; // from decoded refresh token
  const newAccessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15m' });

  res.cookie('token', newAccessToken, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: false // set to true in production (HTTPS)
  });

  res.json({ message: 'Token refreshed' });
});

module.exports = router;
