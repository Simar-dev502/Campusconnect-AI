
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  findTeamMatches
} = require('../controllers/aiController');

// All AI routes require login
router.use(protect);

// Smart Team Matcher
router.post('/team-match', findTeamMatches);

module.exports = router;

