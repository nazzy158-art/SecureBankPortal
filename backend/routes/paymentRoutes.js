const express = require('express');
const router = express.Router();

const {
  createPayment,
  getUserPayments,
  getPendingPayments,
  verifyPayment,
  submitToSwift
} = require('../controllers/paymentController');

const { authenticateToken, requireEmployee, requireCustomer } = require('../middleware/authMiddleware');
const { validatePayment } = require('../middleware/validationMiddleware');

// ==================================================
// CUSTOMER ROUTES
// ==================================================

// Create a new payment (Customers only)
router.post('/', authenticateToken, requireCustomer, validatePayment, createPayment);

// Get user's payment history (Customers only)
router.get('/my-payments', authenticateToken, requireCustomer, getUserPayments);

// ==================================================
// EMPLOYEE ROUTES
// ==================================================

// Get all pending payments (Employees only)
router.get('/pending', authenticateToken, requireEmployee, getPendingPayments);

// Verify a payment (Employees only)
router.put('/:paymentId/verify', authenticateToken, requireEmployee, verifyPayment);

// Submit verified payments to SWIFT (Employees only)
router.post('/submit-to-swift', authenticateToken, requireEmployee, submitToSwift);

module.exports = router;