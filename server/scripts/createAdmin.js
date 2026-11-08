require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');
const { isEmail, isStrongPassword } = require('../src/utils/validators');

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!isEmail(email) || !isStrongPassword(password)) {
    console.error('Set a valid ADMIN_EMAIL and a strong ADMIN_PASSWORD in .env first');
    process.exit(1);
  }

  const [existing] = await pool.execute('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log('An account with this email already exists. Nothing to do.');
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await pool.execute(
    "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'super_admin', 'active')",
    [email, hash]
  );

  console.log(`Super Admin created: ${email}`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());