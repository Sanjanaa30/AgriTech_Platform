// routes/logoutRoutes.js
const express = require('express');
const router = express.Router();
const { logout } = require('../controllers/loginController');

// ✅ Correct: uses logout function from controller
router.post('/logout', logout);

module.exports = router;
