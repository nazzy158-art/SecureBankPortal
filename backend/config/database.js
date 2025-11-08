const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create/connect to the SQLite database file
const dbPath = path.join(__dirname, '..', 'database', 'bankportal.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create the Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      id_number TEXT NOT NULL UNIQUE,
      account_number TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table created or already exists.');
      }
    });

    // Create the Payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      currency TEXT NOT NULL,
      payee_account_info TEXT NOT NULL,
      swift_code TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating payments table:', err);
      } else {
        console.log('Payments table created or already exists.');
      }
    });
  }
});

module.exports = db;