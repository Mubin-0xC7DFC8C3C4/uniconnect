const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/; // Bangladesh phone number format
const POSITIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Assistant Lecturer',
];

function isEmail(value) {
  return typeof value === 'string' && value.length <= 120 && EMAIL_RE.test(value.trim());
}

function isPhone(value) {
  return typeof value === 'string' && PHONE_RE.test(value.trim());
}

// Password must be 8-72 characters long, contain at least one lowercase letter, one uppercase letter, and one digit. Special characters are optional.

function isStrongPassword(value) {
  return (
    typeof value === 'string' &&
    value.length >= 8 &&
    value.length <= 72 && 
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value)
  );
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function isPositiveInt(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

// compare names: ignores extra spaces and upper/lower case
function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, '').toLowerCase();
}

module.exports = {
  POSITIONS,
  isEmail,
  isPhone,
  isStrongPassword,
  isValidDate,
  isPositiveInt,
  normalizeText,
};