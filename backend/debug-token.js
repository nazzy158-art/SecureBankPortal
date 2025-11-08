// debug-fixed.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Try different possible database locations
const possiblePaths = [
  path.join(__dirname, 'database', 'bankportal.sqlite'),
  path.join(__dirname, '..', 'database', 'bankportal.sqlite'), 
  path.join(__dirname, 'bankportal.sqlite'),
  path.join(__dirname, 'database.sqlite')
];

console.log('🔍 Looking for database file...\n');

let dbFound = false;
let dbPath = null;

for (const dbPath of possiblePaths) {
  if (fs.existsSync(dbPath)) {
    console.log(`✅ Found database: ${dbPath}`);
    dbFound = true;
    break;
  } else {
    console.log(`❌ Not found: ${dbPath}`);
  }
}

if (!dbFound) {
  console.log('\n🚨 No database file found!');
  console.log('💡 Try running: dir *.sqlite /s');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

console.log('\n📊 Checking users and roles...\n');

db.all('SELECT id, username, role FROM users', [], (err, users) => {
  if (err) {
    console.error('❌ Error reading users:', err.message);
    db.close();
    return;
  }
  
  if (users.length === 0) {
    console.log('⚠️  No users found in database!');
  } else {
    console.log(`✅ Found ${users.length} user(s):`);
    console.log('ID | Username       | Role');
    console.log('---+----------------+-----------');
    
    users.forEach(user => {
      console.log(`${user.id.toString().padEnd(2)} | ${user.username.padEnd(14)} | ${user.role || '❌ MISSING'}`);
    });
    
    // Check role distribution
    const withRoles = users.filter(u => u.role).length;
    const withoutRoles = users.filter(u => !u.role).length;
    
    console.log(`\n📈 Summary: ${withRoles} with roles, ${withoutRoles} without roles`);
    
    if (withoutRoles > 0) {
      console.log('\n🚨 PROBLEM: Users without roles!');
      console.log('   Run: node fix-roles-correct-path.js');
    } else {
      console.log('\n✅ All users have roles in database!');
      console.log('   Issue is likely cached token in browser.');
      console.log('   Solution: Clear browser storage and login again.');
    }
  }
  
  db.close();
});