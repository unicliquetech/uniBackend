const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');


const handleTokenExpiration = (req, res, next) => {
    try {
      // Get the token from the request headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
      // If no token is found in the localStorage
      if (!token) {
        return res.status(401).json({ error: 'No token found in localStorage' });
      }
  
      // Verify the token
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        // If an error occurred during verification
        if (err) {
          // Check if the error is due to token expiration
          if (err.name === 'TokenExpiredError') {
            // If the token has expired, clear it from the localStorage
            return res.status(419).json({ error: 'Token expired' });
          } else {
            // For other errors, return the error message
            return res.status(401).json({ error: 'Invalid token' });
          }
        } else {
          // If the token is valid, call the next middleware
          req.user = decoded; // Attach the decoded user data to the request object
          next();
        }
      });
    } catch (error) {
      next(error);
    }
  };

  module.exports = handleTokenExpiration;