// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/loginController');
const authMiddleware = require('../middleware/verifyToken');

const User = require('../models/User'); // add at the top if not already

router.get('/check-auth', authMiddleware, async (req, res) => {
  console.log('🧪 /check-auth hit. Cookies:', req.cookies);
  console.log('🧪 Decoded user:', req.user);

  try {
    const user = await User.findById(req.user.userId).select('firstName lastName email roles');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Authenticated',
      user: {
        userId: user._id,
        username: `${user.firstName} ${user.lastName}`,  // ✅ Construct full name
        email: user.email,
        role: user.roles
      }
    });
  } catch (err) {
    console.error('❌ Error fetching user in /check-auth:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ✅ Add these routes to support full auth flow
router.post('/login-password', authController.loginWithPassword);
router.post('/login-otp', authController.loginWithOtp);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
