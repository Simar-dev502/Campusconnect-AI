
const express = require('express');
const router = express.Router();

const {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  addAnswer,
  acceptAnswer
} = require('../controllers/helpController');

const protect = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getHelpRequests)
  .post(createHelpRequest);

router.get('/:id', getHelpRequestById);

router.post('/:id/answers', addAnswer);

router.patch('/:id/answers/:answerId/accept', acceptAnswer);

module.exports = router;
