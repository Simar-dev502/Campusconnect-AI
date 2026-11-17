
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const receiveProfilePhoto = require('../middleware/profilePhotoUpload');
const { uploadProfilePhoto } = require('../controllers/profilePhotoController');

const {
  getMyProfile,
  updateProfile,
  searchStudents,
  getStudentById
} = require('../controllers/userController');

router.use(protect);

router.get('/me', getMyProfile);
router.put('/me', updateProfile);
router.post('/me/photo', receiveProfilePhoto, uploadProfilePhoto);
router.get('/search', searchStudents);
router.get('/:id', getStudentById);

module.exports = router;
