const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ================================
// JWT Secret Key
// ================================
const JWT_SECRET = process.env.JWT_SECRET || 'your_very_secure_secret_key_here_change_in_production';

// Generate JWT Token with role
const generateToken = (userId, username, role) => {
  return jwt.sign(
    { userId, username, role },
    JWT_SECRET,
    { expiresIn: '24h' } // Token valid for 24 hours
  );
};

// ================================
// USER REGISTRATION (Customers only)
// ================================
const registerUser = async (req, res) => {
  try {
    console.log('📩 Incoming registration data:', req.body);

    const { full_name, id_number, account_number, username, password } = req.body;

    // Check if username exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Create new user record (customers only, employees are pre-created)
    const newUser = await User.create({
      full_name,
      id_number,
      account_number,
      username,
      password_hash,
      role: 'customer' // All registrations are customers
    });

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.username, newUser.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        username: newUser.username,
        account_number: newUser.account_number,
        role: newUser.role
      },
      token
    });

 } catch (error) {
  console.error('❌ Registration error:', error);

  if (error.code === 'SQLITE_CONSTRAINT') {
    // Unique constraint violation
    let message = 'Duplicate entry';
    if (error.message.includes('users.username')) message = 'Username already exists';
    if (error.message.includes('users.account_number')) message = 'Account number already exists';

    return res.status(409).json({
      success: false,
      message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error during registration'
  });
}
};

// ================================
// USER LOGIN (Both customers and employees)
// ================================
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token with role
    const token = generateToken(user.id, user.username, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        account_number: user.account_number,
        role: user.role || 'customer' // Fallback for old records
      },
      token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// ================================
// GET CURRENT USER
// ================================
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        account_number: user.account_number,
        role: user.role || 'customer'
      }
    });
  } catch (error) {
    console.error('❌ Fetch user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  JWT_SECRET
};