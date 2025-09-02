const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Polymorphic reference - can be question, answer, or comment
  targetType: { 
    type: String, 
    enum: ['Question', 'Answer', 'Comment'], 
    required: true 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  voteType: { 
    type: String, 
    enum: ['upvote', 'downvote'], 
    required: true 
  }
}, { 
  timestamps: true 
});

// Compound unique index to ensure one vote per user per item
voteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for efficient queries
voteSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Vote', voteSchema);
