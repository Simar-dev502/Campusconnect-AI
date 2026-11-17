
const User = require('../models/User');
const Post = require('../models/Post');
const Project = require('../models/Project');
const Report = require('../models/Report');

// Get users for account moderation
const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    const { search, status } = req.query;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const users = await User.find(filter)
      .select('name email college role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch users.',
      error: error.message
    });
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      totalProjects,
      pendingReports,
      totalReports
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Post.countDocuments(),
      Project.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalPosts,
        totalProjects,
        pendingReports,
        totalReports
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch dashboard statistics.',
      error: error.message
    });
  }
};

// Get all reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch reports.',
      error: error.message
    });
  }
};

// Review a report
const reviewReport = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'reviewed',
      'dismissed',
      'action_taken'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report status.'
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    report.status = status;
    report.reviewedBy = req.user._id;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report reviewed successfully.',
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not review report.',
      error: error.message
    });
  }
};

// Activate or deactivate a student account
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be true or false.'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be deactivated here.'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update user status.',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getDashboardStats,
  getAllReports,
  reviewReport,
  updateUserStatus
};
