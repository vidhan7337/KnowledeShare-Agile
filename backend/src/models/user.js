const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    reputation: { type: Number, default: 0 },
    questionsCount: { type: Number, default: 0 },
    answersCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    badges: [{
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum']
    }]
}, { timestamps: true });

// Index for efficient queries
userSchema.index({ reputation: -1 });

module.exports = mongoose.model("User", userSchema);
