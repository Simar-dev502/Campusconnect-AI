
const express = require('express');
const router = express.Router();

const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead
} = require('../controllers/messageController');

const protect = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);
router.patch('/:conversationId/read', markConversationAsRead);

module.exports = router;
