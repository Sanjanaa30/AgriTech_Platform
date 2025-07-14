// routes/logoutRoutes.js
const express = require('express');
const router = express.Router();
const { logout } = require('../controllers/loginController'); //

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
