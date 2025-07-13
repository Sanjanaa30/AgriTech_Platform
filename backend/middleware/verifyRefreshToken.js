// middleware/verifyRefreshToken.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};
