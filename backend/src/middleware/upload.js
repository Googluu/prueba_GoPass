const multer = require('multer');

// Store file in memory so we can forward bytes to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes.'));
    }
    cb(null, true);
  },
});

module.exports = upload;
