const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser
} = require('../controllers/authController');

// ✅ Import from the new middleware structure
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../middleware/validationMiddleware');

// =========================================
// 🧾 AUTHENTICATION ROUTES
// =========================================

// ✅ Register new user
router.post('/register', validateRegistration, registerUser);

// ✅ User login
router.post('/login', validateLogin, loginUser);

// ✅ Get current user profile (Protected)
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;