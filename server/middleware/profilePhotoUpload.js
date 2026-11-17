const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, or WebP images are allowed.'));
    }
    return callback(null, true);
  }
});

const receiveProfilePhoto = (req, res, next) => {
  upload.single('photo')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return next();
  });
};

module.exports = receiveProfilePhoto;
