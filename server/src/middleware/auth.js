const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Please log in first' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Your session has expired. Please log in again' });
    }

    const [rows] = await pool.execute(
      'SELECT user_id, email, role, status FROM users WHERE user_id = ?',
      [payload.userId]
    );

    if (rows.length === 0 || rows[0].status !== 'active') {
      return res.status(401).json({ message: 'Please log in again' });
    }

    req.user = { id: rows[0].user_id, email: rows[0].email, role: rows[0].role };
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };