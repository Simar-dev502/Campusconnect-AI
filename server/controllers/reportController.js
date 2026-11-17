const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Project = require('../models/Project');
const SkillExchange = require('../models/SkillExchange');
const HelpRequest = require('../models/HelpRequest');

const targets = {
  user: User,
  post: Post,
  comment: Comment,
  project: Project,
  skill: SkillExchange,
  help: HelpRequest
};

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targets[targetType] || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid report target is required.'
      });
    }

    if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason of up to 1000 characters.'
      });
    }

    if (targetType === 'user' && targetId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report your own account.'
      });
    }

    const target = await targets[targetType].exists({ _id: targetId });
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Reported content was not found.'
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason: reason.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted for review.',
      report
    });
  } catch (error) {
    console.error('Report submission failed:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to submit report.'
    });
  }
};

module.exports = { createReport };
