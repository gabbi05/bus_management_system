// Quick script to reset admin password
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'bus_management'
    });

    await db.query('UPDATE users SET password = ? WHERE username = ?', [hash, 'admin']);
    console.log('✅ Admin password reset to: admin123');
    console.log('✅ You can now login with: admin / admin123');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
