
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    category: {
      type: String,
      enum: ['General', 'Technical', 'Academic', 'Projects', 'Events', 'Resources'],
      default: 'General'
    },
    image: {
      type: String,
      default: ''
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    commentsCount: {
      type: Number,
      default: 0
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
