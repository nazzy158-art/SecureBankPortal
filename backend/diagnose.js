// Quick diagnostic script to check users and their roles
// Save as: backend/diagnose.js
// Run with: node diagnose.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'bankportal.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('\n╔════════════════════════════════════════╗');
console.log('║  Database Diagnostic Report            ║');
console.log('╚════════════════════════════════════════╝\n');

// Check if role column exists
db.all("PRAGMA table_info(users)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error reading table structure:', err);
    return;
  }
  
  const hasRoleColumn = columns.some(col => col.name === 'role');
  
  if (hasRoleColumn) {
    console.log('✅ Role column exists in users table\n');
  } else {
    console.log('❌ Role column MISSING! Run: node config/migrate.js\n');
    db.close();
    return;
  }
  
  // List all users
  db.all('SELECT id, username, full_name, role, created_at FROM users', [], (err, users) => {
    if (err) {
      console.error('❌ Error reading users:', err);
      db.close();
      return;
    }
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database!\n');
    } else {
      console.log(`📊 Found ${users.length} user(s):\n`);
      console.log('ID  | Username        | Full Name              | Role      | Created');
      console.log('----+-----------------+------------------------+-----------+-------------------');
      
      users.forEach(user => {
        const id = String(user.id).padEnd(3);
        const username = String(user.username || 'N/A').padEnd(15);
        const fullName = String(user.full_name || 'N/A').padEnd(22);
        const role = String(user.role || '❌ NULL').padEnd(9);
        const created = new Date(user.created_at).toLocaleDateString();
        
        console.log(`${id} | ${username} | ${fullName} | ${role} | ${created}`);
      });
      
      console.log('\n');
      
      // Count by role
      const customers = users.filter(u => u.role === 'customer').length;
      const employees = users.filter(u => u.role === 'employee').length;
      const noRole = users.filter(u => !u.role).length;
      
      console.log('📈 Role Distribution:');
      console.log(`   Customers: ${customers}`);
      console.log(`   Employees: ${employees}`);
      console.log(`   No Role:   ${noRole}`);
      
      if (noRole > 0) {
        console.log('\n⚠️  WARNING: Some users have no role assigned!');
        console.log('   Fix: Run the following command:');
        console.log('   node fix-roles.js');
      }
      
      console.log('\n');
    }
    
    // Check payments
    db.all('SELECT COUNT(*) as count FROM payments', [], (err, result) => {
      if (err) {
        console.error('❌ Error reading payments:', err);
      } else {
        console.log(`💰 Total Payments: ${result[0].count}\n`);
      }
      
      db.close();
      console.log('✅ Diagnostic complete!\n');
    });
  });
});