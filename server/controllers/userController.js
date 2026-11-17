
const User = require('../models/User');

// GET MY PROFILE
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch profile'
    });
  }
};

// UPDATE MY PROFILE
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'college',
      'course',
      'branch',
      'currentYear',
      'currentSemester',
      'skills',
      'interests',
      'profilePhoto',
      'bio'
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.skills !== undefined &&
        (!Array.isArray(updates.skills) || updates.skills.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one skill is required'
      });
    }

    if (updates.interests !== undefined &&
        (!Array.isArray(updates.interests) || updates.interests.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one interest is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Profile update failed',
      error: error.message
    });
  }
};

// SEARCH STUDENTS
const searchStudents = async (req, res) => {
  try {
    const { search, college, skill, branch } = req.query;

    const filter = {
      _id: { $ne: req.user._id },
      isActive: true,
      role: 'student'
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } }
      ];
    }

    if (college) {
      filter.college = { $regex: college, $options: 'i' };
    }

    if (branch) {
      filter.branch = { $regex: branch, $options: 'i' };
    }

    if (skill) {
      filter.skills = { $regex: skill, $options: 'i' };
    }

    const students = await User.find(filter)
      .select('-password -email')
      .limit(50)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Student search failed'
    });
  }
};

// GET STUDENT BY ID
const getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      isActive: true
    }).select('-password -email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid student ID'
    });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  searchStudents,
  getStudentById
};
