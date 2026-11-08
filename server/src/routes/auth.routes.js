const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const HttpError = require('../utils/httperror');
const { writeAudit } = require('../utils/audit');
const { sendMail } = require('../utils/mailer');
const { generateCode, hashCode } = require('../utils/otp');
const {
  POSITIONS,
  isEmail,
  isPhone,
  isValidDate,
  isPositiveInt,
  normalizeText,
} = require('../utils/validators');
const { upload, hasImageSignature, removeFile, removeStoredFile } = require('../middleware/upload');

const router = express.Router();
const CODE_MINUTES = 10; // verification codes and OTPs expire after 10 minutes

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

module.exports = router;