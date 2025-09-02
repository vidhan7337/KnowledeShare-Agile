const commentServices = require('../services/comment-services');
const HttpError = require('../utils/http-error');
const { validationResult } = require('express-validator');

const createComment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new HttpError(errors.array()[0].msg, 400);
        }

        const { parentType, parentId } = req.params;
        
        if (!['Question', 'Answer'].includes(parentType)) {
            throw new HttpError('Invalid parent type', 400);
        }
        
        const comment = await commentServices.createComment(req.body, req.user._id, parentType, parentId);

        res.status(201).json(comment);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const getCommentsByParent = async (req, res, next) => {
    try {
        const { parentType, parentId } = req.params;
        const { page, limit } = req.query;
        
        if (!['Question', 'Answer'].includes(parentType)) {
            throw new HttpError('Invalid parent type', 400);
        }
        
        const result = await commentServices.getCommentsByParent(parentType, parentId, page, limit);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const voteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { voteType } = req.body;
        
        if (!['upvote', 'downvote'].includes(voteType)) {
            throw new HttpError('Invalid vote type', 400);
        }
        
        const result = await commentServices.voteComment(commentId, req.user._id, voteType);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        
        const result = await commentServices.deleteComment(commentId, req.user._id);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

module.exports = {
    createComment,
    getCommentsByParent,
    voteComment,
    deleteComment
};
