const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    console.warn('❌ No access token in cookie');
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn('🔒 Access token expired');
    } else {
      console.error('❌ Invalid access token:', err.message);
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};
