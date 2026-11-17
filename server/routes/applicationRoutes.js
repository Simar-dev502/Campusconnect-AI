
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  applyForProject,
  getMyApplications,
  getProjectApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');

router.use(protect);

router.get('/my-applications', getMyApplications);

router.post('/project/:projectId', applyForProject);

router.get('/project/:projectId', getProjectApplications);

router.patch('/:id/status', updateApplicationStatus);

module.exports = router;
