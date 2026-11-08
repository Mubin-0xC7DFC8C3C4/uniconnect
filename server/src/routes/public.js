const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/public/departments
router.get('/departments', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    next(err); 
  }
});

// GET /api/public/batches
router.get('/batches', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM batches ORDER BY number DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;