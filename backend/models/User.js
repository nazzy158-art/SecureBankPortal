const bcrypt = require('bcryptjs');
const db = require('../config/database');

// =========================
// Helper: run SQLite queries as Promises
// =========================
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// =========================
// USER MODEL FUNCTIONS
// =========================

const User = {
  async create(userData) {
    const { full_name, id_number, account_number, username, password_hash, role = 'customer' } = userData;
    const sql = `
      INSERT INTO users (full_name, id_number, account_number, username, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await runQuery(sql, [full_name, id_number, account_number, username, password_hash, role]);
    return {
      id: result.id,
      full_name,
      id_number,
      account_number,
      username,
      role
    };
  },

  async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = ?`;
    return await getQuery(sql, [username]);
  },

  async findById(id) {
    const sql = `SELECT * FROM users WHERE id = ?`;
    return await getQuery(sql, [id]);
  },

  async findAllEmployees() {
    const sql = `SELECT id, full_name, username, role, created_at FROM users WHERE role = 'employee' ORDER BY created_at DESC`;
    return await allQuery(sql, []);
  },

  async updateRole(userId, role) {
    const sql = `UPDATE users SET role = ? WHERE id = ?`;
    const result = await runQuery(sql, [role, userId]);
    if (result.changes === 0) {
      throw new Error('User not found');
    }
    return { id: userId, role };
  },

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
};

module.exports = User;