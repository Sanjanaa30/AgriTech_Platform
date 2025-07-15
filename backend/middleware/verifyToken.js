const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.accessToken;

  // Debug: Check if token exists
  if (!token) {
    console.warn('❌ No access token in cookie');
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  // Debug: Check if JWT_SECRET is available and matches login signing
  console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET || '(undefined)');
  console.log('🍪 AccessToken from cookie:', token.slice(0, 30) + '...'); // Only show part for security

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Add decoded user to request
    next(); // ✅ Continue to route
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn('🔒 Access token expired');
    } else {
      console.error('❌ Invalid access token:', err.message);
    }

    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};
