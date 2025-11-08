const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create/connect to the SQLite database file
const dbPath = path.join(__dirname, '..', 'database', 'bankportal.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Starting database migration...');

// Add role column to users table
db.serialize(() => {
  // Check if role column exists
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
      console.error('Error checking table structure:', err);
      return;
    }

    const hasRoleColumn = columns.some(col => col.name === 'role');

    if (!hasRoleColumn) {
      console.log('➕ Adding role column to users table...');
      db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer'`, (err) => {
        if (err) {
          console.error('❌ Error adding role column:', err);
        } else {
          console.log('✅ Role column added successfully');
          createEmployeeAccounts();
        }
      });
    } else {
      console.log('✅ Role column already exists');
      createEmployeeAccounts();
    }
  });
});

// Create pre-registered employee accounts
async function createEmployeeAccounts() {
  console.log('\n👥 Creating employee accounts...');

  const employees = [
    {
      full_name: 'John Employee',
      id_number: '9001015800087',
      account_number: 'EMP001',
      username: 'employee1',
      password: 'Employee123',
      role: 'employee'
    },
    {
      full_name: 'Sarah Manager',
      id_number: '8505125900088',
      account_number: 'EMP002',
      username: 'employee2',
      password: 'Employee123',
      role: 'employee'
    }
  ];

  for (const emp of employees) {
    try {
      // Hash password
      const password_hash = await bcrypt.hash(emp.password, 10);

      // Check if employee already exists
      db.get('SELECT * FROM users WHERE username = ?', [emp.username], (err, row) => {
        if (err) {
          console.error(`❌ Error checking for ${emp.username}:`, err);
          return;
        }

        if (row) {
          console.log(`⚠️  Employee ${emp.username} already exists`);
        } else {
          // Insert employee
          const sql = `
            INSERT INTO users (full_name, id_number, account_number, username, password_hash, role)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          db.run(sql, [
            emp.full_name,
            emp.id_number,
            emp.account_number,
            emp.username,
            password_hash,
            emp.role
          ], function(err) {
            if (err) {
              console.error(`❌ Error creating employee ${emp.username}:`, err);
            } else {
              console.log(`✅ Created employee: ${emp.username} (ID: ${this.lastID})`);
            }
          });
        }
      });
    } catch (error) {
      console.error(`❌ Error processing employee ${emp.username}:`, error);
    }
  }

  setTimeout(() => {
    console.log('\n📋 Employee Login Credentials:');
    console.log('================================');
    employees.forEach(emp => {
      console.log(`Username: ${emp.username}`);
      console.log(`Password: ${emp.password}`);
      console.log('--------------------------------');
    });
    console.log('\n✅ Database migration completed!');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed.');
      }
    });
  }, 2000);
}