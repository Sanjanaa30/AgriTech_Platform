// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/verifyToken'); // make sure path is correct

router.get('/check-auth', authMiddleware, (req, res) => {
  console.log('🧪 /check-auth hit. Cookies:', req.cookies);
  console.log('🧪 Decoded user:', req.user);

  res.json({
    message: 'Authenticated',
    user: req.user
  });
});

module.exports = router;
