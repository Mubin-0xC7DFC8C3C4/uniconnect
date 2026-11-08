const express = require('express');
const pool = require('../config/db');
const { POSITIONS, isPositiveInt } = require('../utils/validators');
const router = express.Router();

router.get('/departments', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT dept_id, code, name FROM departments ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/batches', async (req, res, next) => {
  try {
    if (!isPositiveInt(req.query.deptId)) return res.status(400).json({ message: 'deptId is required' });
    const [rows] = await pool.execute(
      'SELECT batch_id, batch_no FROM batches WHERE dept_id = ? ORDER BY batch_no DESC',
      [Number(req.query.deptId)]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/sections', async (req, res, next) => {
  try {
    if (!isPositiveInt(req.query.batchId)) return res.status(400).json({ message: 'batchId is required' });
    const [rows] = await pool.execute(
      'SELECT section_id, name FROM sections WHERE batch_id = ? ORDER BY name',
      [Number(req.query.batchId)]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/positions', (req, res) => {
  res.json(POSITIONS);
});

module.exports = router;