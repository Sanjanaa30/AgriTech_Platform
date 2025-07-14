const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    console.warn('❌ No refresh token in cookie');
    return res.status(401).json({ message: 'Unauthorized: No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn('🔁 Refresh token expired');
    } else {
      console.error('❌ Invalid refresh token:', err.message);
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired refresh token' });
  }
};
