
const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    description: {
      type: String,
      required: true,
      maxlength: 3000
    },
    category: {
      type: String,
      enum: ['Programming', 'Computer Science', 'Mathematics', 'Projects', 'Career', 'Other'],
      default: 'Other'
    },
    tags: [{
      type: String,
      trim: true
    }],
    answers: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
