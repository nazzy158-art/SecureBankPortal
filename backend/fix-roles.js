// Script to fix users that don't have roles assigned
// Save as: backend/fix-roles.js
// Run with: node fix-roles.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'bankportal.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('\n🔧 Fixing user roles...\n');

// Update all users without roles to be customers
db.run(`UPDATE users SET role = 'customer' WHERE role IS NULL OR role = ''`, function(err) {
  if (err) {
    console.error('❌ Error updating roles:', err);
    db.close();
    return;
  }
  
  if (this.changes > 0) {
    console.log(`✅ Updated ${this.changes} user(s) to have 'customer' role\n`);
    
    // Show updated users
    db.all('SELECT id, username, full_name, role FROM users', [], (err, users) => {
      if (err) {
        console.error('Error reading users:', err);
      } else {
        console.log('📊 Updated user list:\n');
        console.log('ID  | Username        | Full Name              | Role');
        console.log('----+-----------------+------------------------+-----------');
        
        users.forEach(user => {
          const id = String(user.id).padEnd(3);
          const username = String(user.username).padEnd(15);
          const fullName = String(user.full_name).padEnd(22);
          const role = String(user.role).padEnd(9);
          
          console.log(`${id} | ${username} | ${fullName} | ${role}`);
        });
        
        console.log('\n✅ All users now have roles assigned!');
        console.log('\n📝 Next steps:');
        console.log('   1. Restart your backend server');
        console.log('   2. Logout and login again in the frontend');
        console.log('   3. Try creating a payment\n');
      }
      
      db.close();
    });
  } else {
    console.log('ℹ️  No users needed updating. All users already have roles.\n');
    db.close();
  }
});
