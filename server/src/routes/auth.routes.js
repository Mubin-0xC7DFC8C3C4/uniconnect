const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const HttpError = require('../utils/httperror');
const { writeAudit } = require('../utils/audit');
const { sendMail } = require('../utils/mailer');
const { generateCode, hashCode, checkCode } = require('../utils/otp');
const {
  POSITIONS,
  isEmail,
  isPhone,
  isValidDate,
  isPositiveInt,
  isStrongPassword,
  normalizeText,
} = require('../utils/validators');
const { upload, hasImageSignature, removeFile, removeStoredFile } = require('../middleware/upload');

const BCRYPT_ROUNDS = 10; // bcrypt rounds for password hashing
const MAX_CODE_ATTEMPTS = 5; 
const router = express.Router();
const CODE_MINUTES = 10; // verification codes and OTPs expire after 10 minutes
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later' },
  })
);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateSignup(body, file) {
  const errors = [];
  const type = text(body.type);

  if (!['student', 'teacher'].includes(type)) errors.push('Choose student or teacher');
  if (text(body.fullName).length < 3 || text(body.fullName).length > 100) errors.push('Enter your full name');
  if (text(body.idNo).length < 3 || text(body.idNo).length > 30) errors.push('Enter your ID number');
  if (!isEmail(text(body.email))) errors.push('Enter a valid email address');
  if (!isPhone(text(body.phone))) errors.push('Enter a valid Bangladeshi mobile number');
  if (!isValidDate(text(body.dob))) errors.push('Enter your date of birth');
  if (!isPositiveInt(body.deptId)) errors.push('Choose your department');

  if (type === 'student') {
    if (!isPositiveInt(body.batchId)) errors.push('Choose your batch');
    if (!isPositiveInt(body.sectionId)) errors.push('Choose your section');
  }

  if (type === 'teacher' && !POSITIONS.includes(text(body.position))) {
    errors.push('Choose your academic rank');
  }

  if (!file) errors.push('Upload your ID card image');
  else if (!hasImageSignature(file.path)) errors.push('The ID card must be a real JPG or PNG image');

  return errors;
}

function findProblems(body, record) {
  const problems = [];
  if (record.is_used) problems.push('record already used');
  if (normalizeText(body.fullName) !== normalizeText(record.full_name)) problems.push('name differs');
  if (text(body.email).toLowerCase() !== record.email.toLowerCase()) problems.push('email differs');
  if (text(body.dob) !== record.dob) problems.push('date of birth differs');
  if (Number(body.deptId) !== record.dept_id) problems.push('department differs');

  if (record.type === 'student') {
    if (Number(body.batchId) !== record.batch_id) problems.push('batch differs');
    if (Number(body.sectionId) !== record.section_id) problems.push('section differs');
  } else if (normalizeText(body.position) !== normalizeText(record.position)) {
    problems.push('rank differs');
  }

  return problems;
}

router.post('/signup/start', upload.single('idCard'), async (req, res, next) => {
  try {
    const body = req.body || {};
    const errors = validateSignup(body, req.file);

    if (errors.length > 0) {
      removeFile(req.file);
      return res.status(400).json({ message: 'Please fix the highlighted problems', errors });
    }

    const type = text(body.type);
    const email = text(body.email).toLowerCase();
    const idNo = text(body.idNo);

    const [existingUsers] = await pool.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      removeFile(req.file);
      throw new HttpError(409, 'An account with this email already exists');
    }

    const [records] = await pool.execute('SELECT * FROM verified_records WHERE type = ? AND id_no = ?', [type, idNo]);
    const problems = records.length === 0 ? ['no record with this ID number'] : findProblems(body, records[0]);

    if (problems.length > 0) {
      await writeAudit(null, 'SIGNUP_DECLINED', `${type}:${idNo}`, problems.join('; '));
      removeFile(req.file);
      return res.status(400).json({
        message: 'We could not match your details with the university records. Please check them and try again',
      });
    }

    const code = generateCode();
    const codeHash = await hashCode(code);

    const [oldRequests] = await pool.execute('SELECT id_card_path FROM signup_requests WHERE email = ?', [email]);
    await pool.execute('DELETE FROM signup_requests WHERE email = ?', [email]);
    oldRequests.forEach((r) => removeStoredFile(r.id_card_path));

    await pool.execute(
      `INSERT INTO signup_requests (email, record_id, type, phone, id_card_path, code_hash, code_expires_at) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ${CODE_MINUTES} MINUTE))`,
      [email, records[0].record_id, type, text(body.phone), req.file.filename, codeHash]
    );

    await sendMail(
      email,
      'Your UniConnect verification code',
      `Your verification code is ${code}. It expires in ${CODE_MINUTES} minutes. If this was not you, ignore this email.`
    );

    res.json({ message: 'We sent a verification code to your email' });
  } catch (err) {
    next(err);
  }
});

router.post('/signup/complete', upload.none(), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const email = text(req.body && req.body.email).toLowerCase();
    const code = text(req.body && req.body.code);
    const { password, confirmPassword } = req.body || {};

    if (!isEmail(email) || !/^\d{6}$/.test(code)) {
      throw new HttpError(400, 'Enter the 6-digit code from your email');
    }

    if (!isStrongPassword(password)) {
      throw new HttpError(400, 'Password must be 8-72 characters with an upper-case letter, a lower-case letter and a digit');
    }

    if (password !== confirmPassword) {
      throw new HttpError(400, 'The two passwords do not match');
    }

    const [requests] = await conn.execute(
      'SELECT * FROM signup_requests WHERE email = ? AND code_expires_at > NOW()',
      [email]
    );

    if (requests.length === 0) {
      throw new HttpError(400, 'The code is wrong or has expired. Please sign up again');
    }

    const request = requests[0];

    if (request.attempts >= MAX_CODE_ATTEMPTS) {
      throw new HttpError(400, 'Too many wrong attempts. Please sign up again');
    }

    if (!(await checkCode(code, request.code_hash))) {
      await conn.execute('UPDATE signup_requests SET attempts = attempts + 1 WHERE request_id = ?', [request.request_id]);
      throw new HttpError(400, 'The code is wrong or has expired. Please sign up again');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await conn.beginTransaction();
    try {
      const [records] = await conn.execute(
        'SELECT * FROM verified_records WHERE record_id = ? FOR UPDATE',
        [request.record_id]
      );

      if (records.length === 0 || records[0].is_used) {
        throw new HttpError(409, 'This university record already has an account');
      }

      const record = records[0];

      const [userResult] = await conn.execute(
        "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, 'active')",
        [email, passwordHash, record.type]
      );

      if (record.type === 'student') {
        await conn.execute(
          `INSERT INTO students (user_id, record_id, id_no, full_name, phone, dob, dept_id, batch_id, section_id, id_card_path) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userResult.insertId,
            record.record_id,
            record.id_no,
            record.full_name,
            request.phone,
            record.dob,
            record.dept_id,
            record.batch_id,
            record.section_id,
            request.id_card_path
          ]
        );
      } else {
        await conn.execute(
          `INSERT INTO teachers (user_id, record_id, id_no, full_name, phone, dob, dept_id, position, id_card_path) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userResult.insertId,
            record.record_id,
            record.id_no,
            record.full_name,
            request.phone,
            record.dob,
            record.dept_id,
            record.position,
            request.id_card_path
          ]
        );
      }

      await conn.execute('UPDATE verified_records SET is_used = TRUE WHERE record_id = ?', [record.record_id]);
      await conn.execute('DELETE FROM signup_requests WHERE request_id = ?', [request.request_id]);
      
      await writeAudit(userResult.insertId, 'SIGNUP_COMPLETED', `${record.type}:${record.id_no}`, null, conn);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      if (err.code === 'ER_DUP_ENTRY') {
        throw new HttpError(409, 'An account with this email already exists');
      }
      throw err;
    }

    res.status(201).json({ message: 'Your account is ready. You can log in now' });
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
});

// Login (locks the account for 15 minutes after 5 wrong passwords)
router.post('/login', async (req, res, next) => {
  try {
    const email = text(req.body && req.body.email).toLowerCase();
    const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';

    if (!isEmail(email) || password === '') {
      throw new HttpError(400, 'Enter your email and password');
    }

    const [rows] = await pool.execute(
      `SELECT user_id, email, password_hash, role, status, failed_attempts, 
              (locked_until IS NOT NULL AND locked_until > NOW()) AS is_locked 
       FROM users WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      throw new HttpError(401, 'Incorrect email or password');
    }

    const user = rows[0];

    if (user.is_locked) {
      throw new HttpError(429, `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes`);
    }

    if (user.status !== 'active') {
      throw new HttpError(403, 'This account is not active');
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      const failed = user.failed_attempts + 1;
      if (failed >= MAX_FAILED_LOGINS) {
        await pool.execute(
          `UPDATE users SET failed_attempts = 0, locked_until = DATE_ADD(NOW(), INTERVAL ${LOCK_MINUTES} MINUTE) WHERE user_id = ?`,
          [user.user_id]
        );
        await writeAudit(user.user_id, 'ACCOUNT_LOCKED', email, `${MAX_FAILED_LOGINS} wrong passwords`);
      } else {
        await pool.execute('UPDATE users SET failed_attempts = ? WHERE user_id = ?', [failed, user.user_id]);
      }
      throw new HttpError(401, 'Incorrect email or password');
    }

    await pool.execute('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE user_id = ?', [user.user_id]);

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    res.json({
      token,
      user: { id: user.user_id, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

// Forgot password
router.post('/forgot-password', upload.none(), async (req, res, next) => {
  try {
    const email = text(req.body && req.body.email).toLowerCase();
    if (!isEmail(email)) throw new HttpError(400, 'Enter a valid email address');
    
    const [users] = await pool.execute("SELECT user_id FROM users WHERE email = ? AND status = 'active'", [email]);

    if (users.length > 0) {
      const otp = generateCode();
      const otpHash = await hashCode(otp);
      
      await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [users[0].user_id]);
      await pool.execute(
        `INSERT INTO password_resets (user_id, otp_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${CODE_MINUTES} MINUTE))`,
        [users[0].user_id, otpHash]
      );
      
      console.log(`[FORGOT PASSWORD OTP] Code for ${email}: ${otp}`);
      
      await sendMail(
        email,
        'Your UniConnect password reset code',
        `Your OTP is ${otp}. It works once and expires in ${CODE_MINUTES} minutes.`
      );
    }

    res.json({ message: 'If this email is registered, an OTP has been sent' });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', upload.none(), async (req, res, next) => {
  try {
    const email = text(req.body && req.body.email).toLowerCase();
    const otp = text(req.body && req.body.otp);
    const { newPassword, confirmPassword } = req.body || {};

    if (!isEmail(email) || !/^\d{6}$/.test(otp)) {
      throw new HttpError(400, 'Enter the 6-digit OTP from your email');
    }

    if (!isStrongPassword(newPassword)) {
      throw new HttpError(400, 'Password must be 8-72 characters with an upper-case letter, a lower-case letter and a digit');
    }

    if (newPassword !== confirmPassword) {
      throw new HttpError(400, 'The two passwords do not match');
    }

    const [rows] = await pool.execute(
      `SELECT u.user_id, r.otp_hash, r.attempts 
       FROM password_resets r 
       JOIN users u ON u.user_id = r.user_id 
       WHERE u.email = ? AND r.expires_at > NOW()`,
      [email]
    );

    const invalid = new HttpError(400, 'The OTP is wrong or has expired');

    if (rows.length === 0 || rows[0].attempts >= MAX_CODE_ATTEMPTS) {
      throw invalid;
    }

    if (!(await checkCode(otp, rows[0].otp_hash))) {
      await pool.execute('UPDATE password_resets SET attempts = attempts + 1 WHERE user_id = ?', [rows[0].user_id]);
      throw invalid;
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await pool.execute(
      'UPDATE users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE user_id = ?',
      [passwordHash, rows[0].user_id]
    );

    await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [rows[0].user_id]); 

    await writeAudit(rows[0].user_id, 'PASSWORD_RESET', email, null);

    res.json({ message: 'Your password has been changed. You can log in now' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;