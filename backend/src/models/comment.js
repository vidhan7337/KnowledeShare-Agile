const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  body: { 
    type: String, 
    required: true, 
    minlength: 5 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Polymorphic reference - can be either question or answer
  parentType: { 
    type: String, 
    enum: ['Question', 'Answer'], 
    required: true 
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  votes: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
commentSchema.index({ parentType: 1, parentId: 1 });
commentSchema.index({ userId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
