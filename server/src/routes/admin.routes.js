const express = require('express');
const pool = require('../config/db');
const HttpError = require('../utils/httperror');
const { writeAudit } = require('../utils/audit');
const { POSITIONS, isEmail, isValidDate, isPositiveInt } = require('../utils/validators');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('super_admin'));

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

router.post('/verified-records', async (req, res, next) => {
  try {
    const b = req.body || {};
    const type = text(b.type);
    const errors = [];

    if (!['student', 'teacher'].includes(type)) errors.push('type must be student or teacher');
    if (text(b.idNo).length < 3 || text(b.idNo).length > 30) errors.push('ID number is required');
    if (text(b.fullName).length < 3 || text(b.fullName).length > 100) errors.push('Full name is required');
    if (!isEmail(text(b.email))) errors.push('A valid email is required');
    if (!isValidDate(text(b.dob))) errors.push('Date of birth must look like 2003-04-12');
    if (!isPositiveInt(b.deptId)) errors.push('Choose a department');

    if (type === 'student' && (!isPositiveInt(b.batchId) || !isPositiveInt(b.sectionId))) {
      errors.push('Choose a batch and a section');
    }

    if (type === 'teacher' && !POSITIONS.includes(text(b.position))) {
      errors.push('Choose an academic rank');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Please fix the problems', errors });
    }

    if (type === 'student') {
      const [ok] = await pool.execute(
        `SELECT 1 FROM sections s 
         JOIN batches b ON b.batch_id = s.batch_id 
         WHERE s.section_id = ? AND b.batch_id = ? AND b.dept_id = ?`,
        [Number(b.sectionId), Number(b.batchId), Number(b.deptId)]
      );
      if (ok.length === 0) {
        throw new HttpError(400, 'That batch or section does not belong to the chosen department');
      }
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO verified_records 
         (type, id_no, full_name, email, dob, dept_id, batch_id, section_id, position) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          type,
          text(b.idNo),
          text(b.fullName),
          text(b.email).toLowerCase(),
          text(b.dob),
          Number(b.deptId),
          type === 'student' ? Number(b.batchId) : null,
          type === 'student' ? Number(b.sectionId) : null,
          type === 'teacher' ? text(b.position) : null
        ]
      );

      await writeAudit(req.user.id, 'RECORD_ADDED', `${type}:${text(b.idNo)}`, null);
      res.status(201).json({ message: 'Record saved', recordId: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new HttpError(409, 'A record with this ID number already exists');
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.get('/verified-records', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.record_id, r.type, r.id_no, r.full_name, r.email, r.dob, 
              d.code AS dept, b.batch_no, s.name AS section, r.position, r.is_used 
       FROM verified_records r 
       JOIN departments d ON d.dept_id = r.dept_id 
       LEFT JOIN batches b ON b.batch_id = r.batch_id 
       LEFT JOIN sections s ON s.section_id = r.section_id 
       ORDER BY r.record_id DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT log_id, actor_id, action, record, reason, created_at FROM audit_logs ORDER BY log_id DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;