const express = require('express');
const router = express.Router();
const { loginWithPassword, loginWithOtp } = require('../controllers/loginController');

router.post('/login-password', loginWithPassword);
router.post('/login-otp', loginWithOtp);

module.exports = router;
