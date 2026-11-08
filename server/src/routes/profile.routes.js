const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/student/me', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.full_name, s.id_no, s.phone, d.name AS department, b.batch_no, sec.name AS section 
       FROM students s 
       JOIN departments d ON d.dept_id = s.dept_id 
       JOIN batches b ON b.batch_id = s.batch_id 
       JOIN sections sec ON sec.section_id = s.section_id 
       WHERE s.user_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
    res.json({ ...rows[0], email: req.user.email });
  } catch (err) {
    next(err);
  }
});

router.get('/teacher/me', requireAuth, requireRole('teacher'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.full_name, t.id_no, t.phone, t.position, d.name AS department 
       FROM teachers t 
       JOIN departments d ON d.dept_id = t.dept_id 
       WHERE t.user_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
    res.json({ ...rows[0], email: req.user.email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;