// routes/logoutRoutes.js
const express = require('express');
const router = express.Router();
const { logout } = require('../controllers/loginController'); //

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
