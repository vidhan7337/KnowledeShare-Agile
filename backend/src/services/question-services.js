const Question = require('../models/question');
const Answer = require('../models/answer');
const Comment = require('../models/comment');
const User = require('../models/user');
const Vote = require('../models/vote');
const HttpError = require('../utils/http-error');
const mongoose = require('mongoose');

const createQuestion = async (input, userId) => {
    try {
        const { title, body, tags } = input;
        const newQuestion = await Question.create({ 
            title, 
            body, 
            tags: tags || [], 
            userId: userId 
        });

        // Update user's questions count
        await User.findByIdAndUpdate(userId, {
            $inc: { questionsCount: 1 }
        });

        await newQuestion.save();
        
        return newQuestion;
    }catch(err) {
        throw new HttpError(err.message, 500);
    }
}

const searchQuestionsByTag = async (tag, page = 1, limit = 10) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        
        const query = tag ? { tags: { $in: [tag] } } : {};
        
        const questions = await Question.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();
        
        const totalQuestions = await Question.countDocuments(query);
        const totalPages = Math.ceil(totalQuestions / limitNum);
        
        return {
            questions,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalQuestions,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        };
    } catch (err) {
        throw new HttpError(err.message, 500);
    }
}

const searchQuestionsByText = async (searchQuery, page = 1, limit = 10) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        
        // Use MongoDB text search
        // Fuzzy search using regex if searchQuery is provided, else return all
        const query = searchQuery
            ? {
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { body: { $regex: searchQuery, $options: 'i' } },
                { tags: { $regex: searchQuery, $options: 'i' } }
            ]
            }
            : {};
        
        const questions = await Question.find(query)
            .populate('userId', 'name email reputation')
            .sort({  createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();
        
        const totalQuestions = await Question.countDocuments(query);
        const totalPages = Math.ceil(totalQuestions / limitNum);
        
        return {
            questions,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalQuestions,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        };
    } catch (err) {
        throw new HttpError(err.message, 500);
    }
}

const getQuestionById = async (questionId) => {
    try {
        const question = await Question.findById(questionId)
            .populate('userId', 'name email reputation')
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'name email reputation'
                }
            });

        if (!question) {
            throw new HttpError('Question not found', 404);
        }

        // Increment view count
        await Question.findByIdAndUpdate(questionId, {
            $inc: { views: 1 }
        });

        return question;
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
}

const voteQuestion = async (questionId, userId, voteType) => {
    try {
        const question = await Question.findById(questionId);
        if (!question) {
            throw new HttpError('Question not found', 404);
        }

        // Check if user is voting on their own question
        if (question.userId.toString() === userId.toString()) {
            throw new HttpError('Cannot vote on your own question', 400);
        }
        
        const sess = await mongoose.startSession();

        try {

            await sess.startTransaction();

            // Check if user already voted
            const existingVote = await Vote.findOne({
                userId,
                targetType: 'Question',
                targetId: questionId
            });

            let reputationChange = 0;
            let voteChange = 0;

            if (existingVote) {
                if (existingVote.voteType === voteType) {
                    // Remove vote
                    await Vote.findByIdAndDelete(existingVote._id);

                    if (voteType === 'upvote') {
                        voteChange = -1;
                        reputationChange = -5;
                    } else {
                        voteChange = 1;
                        reputationChange = 1;
                    }
                } else {
                    // Change vote type
                    existingVote.voteType = voteType;
                    await existingVote.save();

                    if (voteType === 'upvote') {
                        voteChange = 2; // From -1 to +1
                        reputationChange = 6; // From +1 to +5
                    } else {
                        voteChange = -2; // From +1 to -1
                        reputationChange = -6; // From +5 to +1
                    }
                }
            } else {
                // New vote
                await Vote.create({
                    userId,
                    targetType: 'Question',
                    targetId: questionId,
                    voteType
                });

                if (voteType === 'upvote') {
                    voteChange = 1;
                    reputationChange = 5;
                } else {
                    voteChange = -1;
                    reputationChange = -1;
                }
            }

            // Update question votes
            await Question.findByIdAndUpdate(questionId, {
                $inc: { votes: voteChange }
            }, { session: sess });

            // Update user reputation
            await User.findByIdAndUpdate(question.userId, {
                $inc: { reputation: reputationChange }
            }, { session: sess });

            await sess.commitTransaction();
        } catch (err) {
            await sess.abortTransaction();
            throw new HttpError(err.message, err.code || 500);
        } finally {
            sess.endSession();
        }
        

        return { message: 'Vote recorded successfully' };
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
}

const getTrendingTags = async (limit = 10) => {
    try {
        const pipeline = [
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 },
                    totalVotes: { $sum: '$votes' },
                    totalViews: { $sum: '$views' }
                }
            },
            {
                $addFields: {
                    score: { $add: ['$count', '$totalVotes', { $divide: ['$totalViews', 100] }] }
                }
            },
            { $sort: { score: -1 } },
            { $limit: limit }
        ];

        const trendingTags = await Question.aggregate(pipeline);
        return trendingTags;
    } catch (err) {
        throw new HttpError(err.message, 500);
    }
}

const getRecentQuestions = async (page = 1, limit = 10) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const questions = await Question.find({})
            .populate('userId', 'name email reputation')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalQuestions = await Question.countDocuments({});
        const totalPages = Math.ceil(totalQuestions / limitNum);

        return {
            questions,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalQuestions,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        };
    } catch (err) {
        throw new HttpError(err.message, 500);
    }
}

module.exports = {
    createQuestion,
    searchQuestionsByTag,
    searchQuestionsByText,
    getQuestionById,
    voteQuestion,
    getTrendingTags,
    getRecentQuestions
}