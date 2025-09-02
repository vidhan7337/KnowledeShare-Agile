const Comment = require('../models/comment');
const Question = require('../models/question');
const Answer = require('../models/answer');
const User = require('../models/user');
const Vote = require('../models/vote');
const HttpError = require('../utils/http-error');

const createComment = async (input, userId, parentType, parentId) => {
    try {
        const { body } = input;
        
        // Check if parent exists
        let parent;
        if (parentType === 'Question') {
            parent = await Question.findById(parentId);
        } else if (parentType === 'Answer') {
            parent = await Answer.findById(parentId);
        } else {
            throw new HttpError('Invalid parent type', 400);
        }

        if (!parent) {
            throw new HttpError('Parent not found', 404);
        }

        // Create comment
        const newComment = await Comment.create({
            body,
            userId,
            parentType,
            parentId
        });

        // Update parent's comments array
        if (parentType === 'Question') {
            await Question.findByIdAndUpdate(parentId, {
                $push: { comments: newComment._id }
            });
        } else {
            await Answer.findByIdAndUpdate(parentId, {
                $push: { comments: newComment._id }
            });
        }

        // Update user's comments count
        await User.findByIdAndUpdate(userId, {
            $inc: { commentsCount: 1 }
        });

        // Populate user details
        await newComment.populate('userId', 'name email reputation');
        
        return newComment;
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

const getCommentsByParent = async (parentType, parentId, page = 1, limit = 20) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const comments = await Comment.find({ parentType, parentId })
            .populate('userId', 'name email reputation')
            .sort({ createdAt: 1 }) // Sort by oldest first for comments
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalComments = await Comment.countDocuments({ parentType, parentId });
        const totalPages = Math.ceil(totalComments / limitNum);

        return {
            comments,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalComments,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        };
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

const voteComment = async (commentId, userId, voteType) => {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new HttpError('Comment not found', 404);
        }

        // Check if user is voting on their own comment
        if (comment.userId.toString() === userId.toString()) {
            throw new HttpError('Cannot vote on your own comment', 400);
        }

        // Check if user already voted
        const existingVote = await Vote.findOne({
            userId,
            targetType: 'Comment',
            targetId: commentId
        });

        let voteChange = 0;

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // Remove vote
                await Vote.findByIdAndDelete(existingVote._id);
                
                if (voteType === 'upvote') {
                    voteChange = -1;
                } else {
                    voteChange = 1;
                }
            } else {
                // Change vote type
                existingVote.voteType = voteType;
                await existingVote.save();
                
                if (voteType === 'upvote') {
                    voteChange = 2; // From -1 to +1
                } else {
                    voteChange = -2; // From +1 to -1
                }
            }
        } else {
            // New vote
            await Vote.create({
                userId,
                targetType: 'Comment',
                targetId: commentId,
                voteType
            });
            
            if (voteType === 'upvote') {
                voteChange = 1;
            } else {
                voteChange = -1;
            }
        }

        // Update comment votes
        await Comment.findByIdAndUpdate(commentId, {
            $inc: { votes: voteChange }
        });

        return { message: 'Vote recorded successfully' };
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

const deleteComment = async (commentId, userId) => {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new HttpError('Comment not found', 404);
        }

        // Check if user owns the comment
        if (comment.userId.toString() !== userId.toString()) {
            throw new HttpError('Only comment owner can delete comment', 403);
        }

        // Remove comment from parent's comments array
        if (comment.parentType === 'Question') {
            await Question.findByIdAndUpdate(comment.parentId, {
                $pull: { comments: commentId }
            });
        } else {
            await Answer.findByIdAndUpdate(comment.parentId, {
                $pull: { comments: commentId }
            });
        }

        // Delete all votes on this comment
        await Vote.deleteMany({
            targetType: 'Comment',
            targetId: commentId
        });

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        // Update user's comments count
        await User.findByIdAndUpdate(userId, {
            $inc: { commentsCount: -1 }
        });

        return { message: 'Comment deleted successfully' };
    } catch (err) {
        throw new HttpError(err.message, err.code || 500);
    }
};

module.exports = {
    createComment,
    getCommentsByParent,
    voteComment,
    deleteComment
};
