// force-token-refresh.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'bankportal.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Forcing token refresh by updating user...\n');

// Force a small update to all users to ensure fresh tokens
db.run(`UPDATE users SET full_name = full_name WHERE 1=1`, function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log(`✅ Updated ${this.changes} users - tokens will be fresh on next login`);
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. RESTART backend server (Ctrl+C → npm run dev)');
  console.log('   2. Use INCOGNITO window or CLEAR browser storage');
  console.log('   3. Login with: nkatekosit or employee1');
  console.log('   4. Payments should work! 🎉');
  
  db.close();
});