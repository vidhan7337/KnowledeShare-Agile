const Answer = require('../models/answer');
const Question = require('../models/question');
const User = require('../models/user');
const Vote = require('../models/vote');
const HttpError = require('../utils/http-error');
const mongoose = require('mongoose');

const createAnswer = async (input, userId, questionId) => {
    try {
        const { body } = input;
        
        // Check if question exists
        const question = await Question.findById(questionId);
        if (!question) {
            throw new HttpError('Question not found', 404);
        }

        // Create answer
        const newAnswer = await Answer.create({
            body,
            questionId,
            userId
        });

        // Update question's answers count
        await Question.findByIdAndUpdate(questionId, {
            $inc: { answersCount: 1 }
        });

        // Update user's answers count
        await User.findByIdAndUpdate(userId, {
            $inc: { answersCount: 1 }
        });

        // Populate user details
        await newAnswer.populate('userId', 'name email reputation');
        
        return newAnswer;
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

const getAnswersByQuestion = async (questionId, page = 1, limit = 10) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const answers = await Answer.find({ questionId })
            .populate('userId', 'name email reputation')
            .populate('comments')
            .sort({ votes: -1, createdAt: -1 }) // Sort by votes first, then by date
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalAnswers = await Answer.countDocuments({ questionId });
        const totalPages = Math.ceil(totalAnswers / limitNum);

        return {
            answers,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalAnswers,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        };
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

const voteAnswer = async (answerId, userId, voteType) => {
    try {
        const answer = await Answer.findById(answerId);
        if (!answer) {
            throw new HttpError('Answer not found', 404);
        }

        // Check if user is voting on their own answer
        if (answer.userId.toString() === userId.toString()) {
            throw new HttpError('Cannot vote on your own answer', 400);
        }

        const sess = await mongoose.startSession();
        try {
            await sess.startTransaction();

            // Check if user already voted
            const existingVote = await Vote.findOne({
                userId,
                targetType: 'Answer',
                targetId: answerId
            });

            let reputationChange = 0;
            let voteChange = 0;

            if (existingVote) {
                if (existingVote.voteType === voteType) {
                    // Remove vote
                    await Vote.findByIdAndDelete(existingVote._id, {session: sess});
                    
                    if (voteType === 'upvote') {
                        voteChange = -1;
                        reputationChange = -10;
                    } else {
                        voteChange = 1;
                        reputationChange = 2;
                    }
                } else {
                    // Change vote type
                    existingVote.voteType = voteType;
                    await existingVote.save();
                    
                    if (voteType === 'upvote') {
                        voteChange = 2; // From -1 to +1
                        reputationChange = 12; // From +2 to +10
                    } else {
                        voteChange = -2; // From +1 to -1
                        reputationChange = -12; // From +10 to +2
                    }
                }
            } else {
                // New vote
                await Vote.create({
                    userId,
                    targetType: 'Answer',
                    targetId: answerId,
                    voteType
                });
                
                if (voteType === 'upvote') {
                    voteChange = 1;
                    reputationChange = 10;
                } else {
                    voteChange = -1;
                    reputationChange = -2;
                }
            }

            // Update answer votes
            await Answer.findByIdAndUpdate(answerId, {
                $inc: { votes: voteChange }
            }, { session: sess });

            // Update user reputation
            await User.findByIdAndUpdate(answer.userId, {
                $inc: { reputation: reputationChange }
            }, {session: sess });

            await sess.commitTransaction();
        }catch(err) {
            await sess.abortTransaction();
            throw new HttpError(err.message, err.code || 500);
        } finally {
            sess.endSession();
        }

        return { message: 'Vote recorded successfully' };
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

const acceptAnswer = async (answerId, userId) => {
    try {
        const answer = await Answer.findById(answerId);
        if (!answer) {
            throw new HttpError('Answer not found', 404);
        }

        const question = await Question.findById(answer.questionId);
        if (!question) {
            throw new HttpError('Question not found', 404);
        }

        // Check if user owns the question
        if (question.userId.toString() !== userId.toString()) {
            throw new HttpError('Only question owner can accept answers', 403);
        }

        // If answer was already accepted, unaccept it
        if (answer.isAccepted) {
            answer.isAccepted = false;
            await answer.save();
            return { message: 'Answer unaccepted' };
        }

        // Unaccept any previously accepted answer
        await Answer.updateMany(
            { questionId: answer.questionId, isAccepted: true },
            { isAccepted: false }
        );

        // Accept this answer
        answer.isAccepted = true;
        await answer.save();

        // Give reputation bonus to answer author
        await User.findByIdAndUpdate(answer.userId, {
            $inc: { reputation: 15 }
        });

        return { message: 'Answer accepted successfully' };
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

module.exports = {
    createAnswer,
    getAnswersByQuestion,
    voteAnswer,
    acceptAnswer
};
