const express = require('express');
const router = express.Router();
const { registerUser, registerAfterOtp } = require('../controllers/registerController');

// ✅ This must match frontend `pre-register` call
router.post('/pre-register', registerUser);

// ✅ This handles final user creation after OTP
router.post('/register-after-otp', registerAfterOtp);

module.exports = router;
