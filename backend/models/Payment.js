const db = require('../config/database');

class Payment {
  // Create a new payment transaction
  static create(paymentData, callback) {
    const { user_id, amount, currency, payee_account_info, swift_code } = paymentData;
    
    const sql = `INSERT INTO payments (user_id, amount, currency, payee_account_info, swift_code, status) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [user_id, amount, currency, payee_account_info, swift_code, 'pending'], function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { 
        id: this.lastID, 
        user_id, 
        amount, 
        currency, 
        payee_account_info, 
        swift_code,
        status: 'pending'
      });
    });
  }

  // Get all payments for a specific user
  static findByUserId(userId, callback) {
    const sql = `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC`;
    
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    });
  }

  // Get all pending payments (for bank employees)
  static findPending(callback) {
    const sql = `SELECT p.*, u.full_name, u.account_number as user_account_number 
                 FROM payments p 
                 JOIN users u ON p.user_id = u.id 
                 WHERE p.status = 'pending' 
                 ORDER BY p.created_at ASC`;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    });
  }

  // Update payment status (for bank employees to verify)
  static updateStatus(paymentId, status, callback) {
    const sql = `UPDATE payments SET status = ? WHERE id = ?`;
    
    db.run(sql, [status, paymentId], function(err) {
      if (err) {
        return callback(err);
      }
      if (this.changes === 0) {
        return callback(new Error('Payment not found'));
      }
      callback(null, { id: paymentId, status: status });
    });
  }

  // Get payment by ID
  static findById(paymentId, callback) {
    const sql = `SELECT p.*, u.full_name, u.account_number as user_account_number 
                 FROM payments p 
                 JOIN users u ON p.user_id = u.id 
                 WHERE p.id = ?`;
    
    db.get(sql, [paymentId], (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    });
  }
}

module.exports = Payment;