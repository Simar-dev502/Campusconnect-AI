
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// REGISTER STUDENT
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      college,
      course,
      branch,
      currentYear,
      currentSemester,
      skills,
      interests,
      profilePhoto
    } = req.body;

    if (
      !name || !email || !password || !college ||
      !course || !branch || !currentYear ||
      !currentSemester
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one skill'
      });
    }

    if (!Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one interest'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      college,
      course,
      branch,
      currentYear,
      currentSemester,
      skills,
      interests,
      profilePhoto: profilePhoto || ''
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        course: user.course,
        branch: user.branch,
        currentYear: user.currentYear,
        currentSemester: user.currentSemester,
        skills: user.skills,
        interests: user.interests,
        profilePhoto: user.profilePhoto,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// LOGIN STUDENT
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        course: user.course,
        branch: user.branch,
        currentYear: user.currentYear,
        currentSemester: user.currentSemester,
        skills: user.skills,
        interests: user.interests,
        profilePhoto: user.profilePhoto,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// GET LOGGED-IN STUDENT
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch profile'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
