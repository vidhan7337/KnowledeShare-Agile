const User = require('../models/user');
const Question = require('../models/question');
const Answer = require('../models/answer');
const Comment = require('../models/comment');
const HttpError = require('../utils/http-error');

const getUserProfile = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('-password')
            .lean();

        if (!user) {
            throw new HttpError('User not found', 404);
        }

        // Get user's questions
        const questions = await Question.find({ userId })
            .select('title votes answersCount createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Get user's answers
        const answers = await Answer.find({ userId })
            .populate('questionId', 'title')
            .select('body votes isAccepted createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Get user's comments
        const comments = await Comment.find({ userId })
            .select('body votes createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return {
            ...user,
            recentQuestions: questions,
            recentAnswers: answers,
            recentComments: comments
        };
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

const getTopUsers = async (limit = 10) => {
    try {
        const topUsers = await User.find({})
            .select('name email reputation questionsCount answersCount commentsCount badges')
            .sort({ reputation: -1 })
            .limit(limit)
            .lean();

        return topUsers;
    } catch (err) {
        throw new HttpError(err.message, 500);
    }
};

const updateUserBadges = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new HttpError('User not found', 404);
        }

        const badges = [];
        
        // Bronze badges
        if (user.questionsCount >= 1) badges.push('bronze');
        if (user.answersCount >= 1) badges.push('bronze');
        if (user.commentsCount >= 1) badges.push('bronze');
        
        // Silver badges
        if (user.questionsCount >= 10) badges.push('silver');
        if (user.answersCount >= 10) badges.push('silver');
        if (user.reputation >= 100) badges.push('silver');
        
        // Gold badges
        if (user.questionsCount >= 50) badges.push('gold');
        if (user.answersCount >= 50) badges.push('gold');
        if (user.reputation >= 500) badges.push('gold');
        
        // Platinum badges
        if (user.reputation >= 1000) badges.push('platinum');
        if (user.questionsCount >= 100) badges.push('platinum');
        if (user.answersCount >= 100) badges.push('platinum');

        // Remove duplicates and update user
        const uniqueBadges = [...new Set(badges)];
        user.badges = uniqueBadges;
        await user.save();

        return user;
    } catch (err) {
        throw new HttpError(err.message, 500);
    }
};

const getUserStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new HttpError('User not found', 404);
        }

        // Get total votes received on questions
        const questionVotes = await Question.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, totalVotes: { $sum: '$votes' } } }
        ]);

        // Get total votes received on answers
        const answerVotes = await Answer.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, totalVotes: { $sum: '$votes' } } }
        ]);

        // Get total views on questions
        const questionViews = await Question.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);

        const stats = {
            reputation: user.reputation,
            questionsCount: user.questionsCount,
            answersCount: user.answersCount,
            commentsCount: user.commentsCount,
            totalQuestionVotes: questionVotes[0]?.totalVotes || 0,
            totalAnswerVotes: answerVotes[0]?.totalVotes || 0,
            totalQuestionViews: questionViews[0]?.totalViews || 0,
            badges: user.badges
        };

        return stats;
    } catch (err) {
        throw new HttpError(err.message, 500);
    }
};

module.exports = {
    getUserProfile,
    getTopUsers,
    updateUserBadges,
    getUserStats
};
