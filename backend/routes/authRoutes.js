// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/loginController');
const authMiddleware = require('../middleware/verifyToken');

// ✅ Protected route to verify if user is authenticated
router.get('/check-auth', authMiddleware, (req, res) => {
  console.log('🧪 /check-auth hit. Cookies:', req.cookies);
  console.log('🧪 Decoded user:', req.user);

  res.json({
    message: 'Authenticated',
    user: req.user
  });
});

// ✅ Add these routes to support full auth flow
router.post('/login-password', authController.loginWithPassword);
router.post('/login-otp', authController.loginWithOtp);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
