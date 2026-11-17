
const HelpRequest = require('../models/HelpRequest');

// @desc    Create a new help request
// @route   POST /api/help
const createHelpRequest = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and category are required.'
      });
    }

    const helpRequest = await HelpRequest.create({
      author: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      tags: Array.isArray(tags) ? tags : []
    });

    const populatedRequest = await HelpRequest.findById(helpRequest._id)
      .populate('author', 'name college profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Your question has been posted successfully.',
      helpRequest: populatedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all help requests
// @route   GET /api/help
const getHelpRequests = async (req, res) => {
  try {
    const { category, status, search } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const requests = await HelpRequest.find(filter)
      .populate('author', 'name college profilePhoto')
      .populate('answers.author', 'name college profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      helpRequests: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get one help request
// @route   GET /api/help/:id
const getHelpRequestById = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id)
      .populate('author', 'name college profilePhoto')
      .populate('answers.author', 'name college profilePhoto')
      .populate('acceptedAnswer');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found.'
      });
    }

    res.status(200).json({
      success: true,
      helpRequest: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add an answer
// @route   POST /api/help/:id/answers
const addAnswer = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Answer content is required.'
      });
    }

    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found.'
      });
    }

    if (request.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This question is already resolved.'
      });
    }

    if (request.author.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot answer your own question.'
      });
    }

    request.answers.push({
      author: req.user._id,
      content: content.trim()
    });

    await request.save();

    await request.populate('author', 'name college profilePhoto');
    await request.populate('answers.author', 'name college profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Answer added successfully.',
      helpRequest: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept an answer and resolve question
// @route   PATCH /api/help/:id/answers/:answerId/accept
const acceptAnswer = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found.'
      });
    }

    if (request.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can accept an answer.'
      });
    }

    const answerExists = request.answers.some(
      answer => answer._id.toString() === req.params.answerId
    );

    if (!answerExists) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found.'
      });
    }

    request.acceptedAnswer = req.params.answerId;
    request.status = 'resolved';

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Answer accepted. Question marked as resolved.',
      helpRequest: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  addAnswer,
  acceptAnswer
};
