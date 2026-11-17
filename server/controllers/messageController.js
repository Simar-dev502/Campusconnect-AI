
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Create or find a conversation
const createConversation = async (req, res) => {
  try {
    const { participantIds, type = 'direct', name, project } = req.body;

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant is required.'
      });
    }

    if (!['direct', 'group'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation type.'
      });
    }

    const participants = [...new Set([
      ...participantIds.map(String),
      req.user._id.toString()
    ])];

    if (type === 'direct' && participants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'A direct conversation requires exactly two participants.'
      });
    }

    if (type === 'group' && (!name || !name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required.'
      });
    }

    if (type === 'direct') {
      const existing = await Conversation.findOne({
        type: 'direct',
        participants: { $all: participants, $size: 2 }
      }).populate('participants', 'name profilePhoto college');

      if (existing) {
        return res.status(200).json({
          success: true,
          conversation: existing
        });
      }
    }

    const conversation = await Conversation.create({
      participants,
      type,
      ...(type === 'group' ? { name: name.trim() } : {}),
      ...(project ? { project } : {})
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name profilePhoto college');

    res.status(201).json({
      success: true,
      conversation: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name profilePhoto college')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get messages of a conversation
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const messages = await Message.find({
      conversation: conversation._id
    })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id]
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    await message.populate('sender', 'name profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark conversation messages as read
const markConversationAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      {
        $addToSet: { readBy: req.user._id }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead
};
