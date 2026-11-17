
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    college: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: String,
      required: true,
      trim: true
    },

    branch: {
      type: String,
      required: true,
      trim: true
    },

    currentYear: {
      type: String,
      required: true
    },

    currentSemester: {
      type: String,
      required: true
    },

    skills: {
      type: [String],
      required: true,
      validate: {
        validator: value => value.length > 0,
        message: 'Add at least one skill'
      }
    },

    interests: {
      type: [String],
      required: true,
      validate: {
        validator: value => value.length > 0,
        message: 'Add at least one interest'
      }
    },

    profilePhoto: {
      type: String,
      default: ''
    },

    bio: {
      type: String,
      default: '',
      maxlength: 500
    },

    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
