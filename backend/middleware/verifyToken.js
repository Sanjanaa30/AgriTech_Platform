const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.accessToken; // ✅ make sure it's accessToken here

  if (!token) {
    console.warn('❌ No access token in cookie');
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
