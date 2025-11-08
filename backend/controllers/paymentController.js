const Payment = require('../models/Payment');

// ===================================================
// 1️⃣ Create a new payment transaction
// ===================================================
const createPayment = async (req, res) => {
  try {
    console.log('📩 Incoming payment data:', req.body);
    console.log('👤 Authenticated user:', req.user);

    // ✅ Ensure user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not authenticated or token missing'
      });
    }

    const user_id = req.user.userId;
    const { amount, currency, payee_account_info, swift_code } = req.body;

    // ✅ Field validation
    if (!amount || !currency || !payee_account_info || !swift_code) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // ✅ Create payment
    Payment.create(
      {
        user_id,
        amount: numericAmount.toFixed(2),
        currency,
        payee_account_info,
        swift_code
      },
      (err, newPayment) => {
        if (err) {
          console.error('❌ Payment creation error:', err.message);
          const message =
            err.code === 'SQLITE_BUSY'
              ? 'Database is busy. Please try again.'
              : 'Failed to create payment';
          return res.status(500).json({ success: false, message });
        }

        console.log('✅ Payment created successfully:', newPayment);
        res.status(201).json({
          success: true,
          message: 'Payment created successfully',
          payment: newPayment
        });
      }
    );
  } catch (error) {
    console.error('❌ Unexpected createPayment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ===================================================
// 2️⃣ Get all payments for current user
// ===================================================
const getUserPayments = (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: no user found in token'
    });
  }

  const user_id = req.user.userId;
  Payment.findByUserId(user_id, (err, payments) => {
    if (err) {
      console.error('❌ Get user payments error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve payments'
      });
    }

    res.json({
      success: true,
      payments
    });
  });
};

// ===================================================
// 3️⃣ Get all pending payments (for staff use)
// ===================================================
const getPendingPayments = (req, res) => {
  Payment.findPending((err, payments) => {
    if (err) {
      console.error('Get pending payments error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending payments'
      });
    }

    res.json({
      success: true,
      payments
    });
  });
};

// ===================================================
// 4️⃣ Verify/Approve payment (staff action)
// ===================================================
const verifyPayment = (req, res) => {
  const { paymentId } = req.params;

  Payment.updateStatus(paymentId, 'verified', (err, result) => {
    if (err) {
      if (err.message === 'Payment not found') {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }
      console.error('Verify payment error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: result
    });
  });
};

// ===================================================
// 5️⃣ Submit verified payments to SWIFT (mock integration)
// ===================================================
const submitToSwift = (req, res) => {
  const { paymentIds } = req.body;

  if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Payment IDs array is required'
    });
  }

  let completed = 0;
  let errors = [];

  paymentIds.forEach(paymentId => {
    Payment.updateStatus(paymentId, 'submitted_to_swift', (err, result) => {
      if (err) {
        errors.push({ paymentId, error: err.message });
      } else {
        completed++;
      }

      if (completed + errors.length === paymentIds.length) {
        if (errors.length > 0) {
          return res.status(207).json({
            success: true,
            message: `Submitted ${completed} payments, ${errors.length} failed`,
            completed,
            errors
          });
        }

        res.json({
          success: true,
          message: `Successfully submitted ${completed} payments to SWIFT`,
          submitted_count: completed
        });
      }
    });
  });
};

// ===================================================
// Export all controller functions
// ===================================================
module.exports = {
  createPayment,
  getUserPayments,
  getPendingPayments,
  verifyPayment,
  submitToSwift
};
