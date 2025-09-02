const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, text: true },
  body: { type: String, required: true, text: true },
  tags: [{ type: String, index: true }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  votes: { type: Number, default: 0 },
  answersCount: { type: Number, default: 0 },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  views: { type: Number, default: 0 }
}, { timestamps: true });

// create text index for full-text search
questionSchema.index({ title: "text", body: "text" });
// Index for efficient queries
questionSchema.index({ userId: 1 });
questionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Question", questionSchema);
