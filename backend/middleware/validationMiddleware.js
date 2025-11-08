const { body, validationResult } = require('express-validator');

// Helper function to send validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// REGEX PATTERNS (WHITELIST APPROACH)
const patterns = {
  // Only letters, spaces, hyphens, apostrophes - 2-50 characters
  fullName: /^[A-Za-z\s\-']{2,50}$/,
  
  // South African ID: 13 digits exactly
  idNumber: /^\d{13}$/,
  
  // Bank account: digits only, 8-20 characters
  accountNumber: /^\d{8,20}$/,
  
  // Username: alphanumeric, underscores, 3-30 characters
  username: /^[a-zA-Z0-9_]{3,30}$/,
  
  // Password: min 8 chars, at least one uppercase, one lowercase, one number
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  
  // Amount: positive numbers with up to 2 decimal places
  amount: /^\d+(\.\d{1,2})?$/,
  
  // Currency: 3 uppercase letters (USD, EUR, ZAR, etc.)
  currency: /^[A-Z]{3}$/,
  
  // SWIFT code: 8 or 11 alphanumeric characters
  swiftCode: /^[A-Za-z0-9]{8,11}$/,
  
  // Account info: alphanumeric and spaces, 5-34 characters (IBAN compatible)
  accountInfo: /^[A-Za-z0-9\s]{5,34}$/
};

// VALIDATION CHAINS

// User Registration Validation
const validateRegistration = [
  body('full_name')
    .trim()
    .matches(patterns.fullName)
    .withMessage('Full name must contain only letters, spaces, hyphens, and apostrophes (2-50 characters)'),
  
  body('id_number')
    .trim()
    .matches(patterns.idNumber)
    .withMessage('ID number must be exactly 13 digits'),
  
  body('account_number')
    .trim()
    .matches(patterns.accountNumber)
    .withMessage('Account number must contain only digits (8-20 characters)'),
  
  body('username')
    .trim()
    .toLowerCase()
    .matches(patterns.username)
    .withMessage('Username must be 3-30 characters (letters, numbers, underscores only)'),
  
  body('password')
    .matches(patterns.password)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  
  handleValidationErrors
];

// User Login Validation
const validateLogin = [
  body('username')
    .trim()
    .toLowerCase()
    .matches(patterns.username)
    .withMessage('Invalid username format'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Payment Transaction Validation
const validatePayment = [
  body('amount')
    .matches(patterns.amount)
    .withMessage('Amount must be a positive number with up to 2 decimal places'),
  
  body('currency')
    .trim()
    .toUpperCase()
    .matches(patterns.currency)
    .withMessage('Currency must be a 3-letter code (e.g., USD, EUR, ZAR)'),
  
  body('payee_account_info')
    .trim()
    .matches(patterns.accountInfo)
    .withMessage('Account info must be 5-34 alphanumeric characters'),
  
  body('swift_code')
    .trim()
    .toUpperCase()
    .matches(patterns.swiftCode)
    .withMessage('SWIFT code must be 8-11 alphanumeric characters'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePayment,
  patterns // Exporting for testing if needed
};