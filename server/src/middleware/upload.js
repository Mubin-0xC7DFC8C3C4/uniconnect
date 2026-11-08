const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const HttpError = require('../utils/httperror');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'id-cards');
fs.mkdirSync(uploadDir, { recursive: true });

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    // random file name, so users cannot overwrite each other's files
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXTENSIONS[file.mimetype]),
  }),
  fileFilter: (req, file, cb) => {
    if (!EXTENSIONS[file.mimetype]) {
      return cb(new HttpError(400, 'The ID card must be a JPG or PNG image'));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

// The browser can lie about the file type, so also check the first bytes of the file
function hasImageSignature(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(4);
  fs.readSync(fd, buf, 0, 4, 0);
  fs.closeSync(fd);
  const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  return isJpg || isPng;
}

// Deletes an uploaded file (used when the request fails after the upload finished)
function removeFile(file) {
  if (file && file.path) fs.unlink(file.path, () => {});
}

// Deletes a file that is already saved in the database by its file name
function removeStoredFile(fileName) {
  if (fileName) fs.unlink(path.join(uploadDir, path.basename(fileName)), () => {});
}

module.exports = { upload, hasImageSignature, removeFile, removeStoredFile };