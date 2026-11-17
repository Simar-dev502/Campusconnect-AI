
const SkillExchange = require('../models/SkillExchange');

// CREATE SKILL OFFER OR REQUEST
const createSkillExchange = async (req, res) => {
  try {
    const { skill, type, description, mode } = req.body;

    if (!skill || !skill.trim() || !description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Skill and description are required'
      });
    }

    if (!['offer', 'request'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be offer or request'
      });
    }

    const exchange = await SkillExchange.create({
      student: req.user._id,
      skill: skill.trim(),
      type,
      description: description.trim(),
      mode: mode || 'both'
    });

    const populatedExchange = await SkillExchange.findById(exchange._id)
      .populate('student', 'name college branch profilePhoto skills');

    res.status(201).json({
      success: true,
      message: type === 'offer'
        ? 'Skill offer published successfully'
        : 'Skill request published successfully',
      exchange: populatedExchange
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to create skill listing'
    });
  }
};

// GET ALL SKILL LISTINGS
const getSkillExchanges = async (req, res) => {
  try {
    const filter = { status: 'open' };

    if (req.query.type) {
      if (!['offer', 'request'].includes(req.query.type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid listing type'
        });
      }
      filter.type = req.query.type;
    }

    if (req.query.skill) {
      filter.skill = {
        $regex: req.query.skill,
        $options: 'i'
      };
    }

    if (req.query.mode) {
      filter.mode = req.query.mode;
    }

    const exchanges = await SkillExchange.find(filter)
      .populate('student', 'name college branch profilePhoto skills')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: exchanges.length,
      exchanges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch skill listings'
    });
  }
};

// GET MY SKILL LISTINGS
const getMySkillExchanges = async (req, res) => {
  try {
    const exchanges = await SkillExchange.find({
      student: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      exchanges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch your listings'
    });
  }
};

// UPDATE MY SKILL LISTING
const updateSkillExchange = async (req, res) => {
  try {
    const exchange = await SkillExchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Skill listing not found'
      });
    }

    if (exchange.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own listing'
      });
    }

    const allowedFields = ['skill', 'description', 'mode', 'status'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        exchange[field] = req.body[field];
      }
    }

    await exchange.save();

    res.status(200).json({
      success: true,
      message: 'Skill listing updated successfully',
      exchange
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Unable to update skill listing'
    });
  }
};

// DELETE MY SKILL LISTING
const deleteSkillExchange = async (req, res) => {
  try {
    const exchange = await SkillExchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Skill listing not found'
      });
    }

    if (
      exchange.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete this listing'
      });
    }

    await exchange.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Skill listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to delete skill listing'
    });
  }
};

module.exports = {
  createSkillExchange,
  getSkillExchanges,
  getMySkillExchanges,
  updateSkillExchange,
  deleteSkillExchange
};
