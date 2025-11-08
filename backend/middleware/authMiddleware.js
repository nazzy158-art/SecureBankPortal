const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

// Basic authentication - checks if user has valid token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user; // Attach decoded token data to request
    next();
  });
};

// Employee-only access
const requireEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'employee') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Employee privileges required.'
    });
  }

  next();
};

// Customer-only access
const requireCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer account required.'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireEmployee,
  requireCustomer
};
