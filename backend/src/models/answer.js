const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  body: { 
    type: String, 
    required: true, 
    minlength: 10 
  },
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  votes: { 
    type: Number, 
    default: 0 
  },
  isAccepted: { 
    type: Boolean, 
    default: false 
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, { 
  timestamps: true 
});

// Index for efficient queries
answerSchema.index({ questionId: 1, createdAt: -1 });
answerSchema.index({ userId: 1 });

module.exports = mongoose.model('Answer', answerSchema);
