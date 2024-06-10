const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { scryptSync } = require('crypto');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    scryptSync(Buffer.from(JWT_SECRET), 'salt', 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === 'object' && decoded !== null) {
      if (decoded.exp) {
        const currentTime = Date.now() / 1000; // Convert to Unix timestamp (seconds)
        if (decoded.exp > currentTime) {
          // Token is valid
          req.user = decoded;
          next();
        } else {
          // Token has expired
          return res.status(401).json({ error: 'Token has expired' });
        }
      } else {
        // Token doesn't have the exp property
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      // Decoded token is not an object or is null
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.log(error);
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
      if (!roles.includes(req.user.role)){
          throw new CustomError.UnauthorizedError(
              'Unauthorized to access this route'
          );
      }
      next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
}