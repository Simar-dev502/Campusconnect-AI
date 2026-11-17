
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const {
  getAllUsers,
  getDashboardStats,
  getAllReports,
  reviewReport,
  updateUserStatus
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Account moderation
router.get('/users', getAllUsers);

// Report management
router.get('/reports', getAllReports);
router.patch('/reports/:id', reviewReport);

// User moderation
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
