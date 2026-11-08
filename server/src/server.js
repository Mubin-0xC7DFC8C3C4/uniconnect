require('dotenv').config(); 
const app = require('./app');
const pool = require('./config/db');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is missing or too short. Set a long random value in .env');
  process.exit(1);
}

const port = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await pool.query('SELECT 1'); 
    app.listen(port, () => console.log(`UniConnect API running on http://localhost:${port}`));
  } catch (err) {
    console.error('Cannot connect to the database:', err.message);
    process.exit(1);
  }
}

start();