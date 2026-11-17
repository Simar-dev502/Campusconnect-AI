
const mongoose = require('mongoose');

const skillExchangeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skill: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['offer', 'request'],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1500
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'both'
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillExchange', skillExchangeSchema);
