const multer = require('multer');

function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'The image must be 2 MB or smaller' : 'File upload failed';
    return res.status(400).json({ message });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err); 
  res.status(500).json({ message: 'Something went wrong on the server' });
}

module.exports = { notFound, errorHandler };