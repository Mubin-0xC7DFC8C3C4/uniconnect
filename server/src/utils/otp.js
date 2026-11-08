const crypto = require('crypto');
const bcrypt = require('bcrypt');

function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashCode(code) {
  return bcrypt.hash(code, 10);
}

function checkCode(code, hash) {
  return bcrypt.compare(String(code), hash);
}

module.exports = { generateCode, hashCode, checkCode };