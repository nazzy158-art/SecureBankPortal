// debug-simple.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'bankportal.sqlite');

console.log('🔍 Checking database...');
console.log('Database path:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found!');
  process.exit(1);
}

console.log('✅ Database file exists\n');

const db = new sqlite3.Database(dbPath);

// Check users and roles
db.all('SELECT id, username, role FROM users', [], (err, users) => {
  if (err) {
    console.error('❌ Error reading users:', err.message);
    db.close();
    return;
  }
  
  console.log(`📊 Found ${users.length} user(s):\n`);
  console.log('ID | Username       | Role');
  console.log('---+----------------+-----------');
  
  users.forEach(user => {
    const role = user.role || '❌ MISSING';
    console.log(`${user.id.toString().padEnd(2)} | ${user.username.padEnd(14)} | ${role}`);
  });
  
  // Count roles
  const withRoles = users.filter(u => u.role).length;
  const withoutRoles = users.filter(u => !u.role).length;
  
  console.log(`\n📈 Summary: ${withRoles} with roles, ${withoutRoles} without roles`);
  
  if (withoutRoles > 0) {
    console.log('\n🚨 PROBLEM: Users without roles detected!');
    console.log('   Running automatic fix...');
    
    // Auto-fix the roles
    db.run(`UPDATE users SET role = 'customer' WHERE role IS NULL OR role = ''`, function(fixErr) {
      if (fixErr) {
        console.error('❌ Fix failed:', fixErr.message);
      } else {
        console.log(`✅ Fixed ${this.changes} users`);
      }
      
      console.log('\n🎉 NEXT STEPS:');
      console.log('   1. RESTART backend server (Ctrl+C → npm run dev)');
      console.log('   2. CLEAR browser storage (F12 → Application → Clear)');
      console.log('   3. LOGOUT and LOGIN again in frontend');
      console.log('   4. Try creating payments!');
      
      db.close();
    });
  } else {
    console.log('\n✅ All users have roles!');
    console.log('   Issue is cached token - clear browser storage and login again.');
    db.close();
  }
});