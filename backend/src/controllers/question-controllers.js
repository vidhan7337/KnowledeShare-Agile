const questionServices = require('../services/question-services');
const HttpError = require('../utils/http-error');
const {validationResult} = require('express-validator');

const createQuestion = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new HttpError(errors.array()[0].msg, 400);
        }

        const question = await questionServices.createQuestion(req.body, req.user._id);

        res.status(201).json(question);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const searchQuestionsByTag = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new HttpError(errors.array()[0].msg, 400);
        }

        const { tag, page, limit } = req.query;
        
        const result = await questionServices.searchQuestionsByTag(tag, page, limit);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const searchQuestionsByText = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new HttpError(errors.array()[0].msg, 400);
        }

        const { q, page, limit } = req.query;
        
        if (!q) {
            throw new HttpError('Search query is required', 400);
        }
        
        const result = await questionServices.searchQuestionsByText(q, page, limit);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const getQuestionById = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        
        const question = await questionServices.getQuestionById(questionId);
        
        res.status(200).json(question);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const voteQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { voteType } = req.body;
        
        if (!['upvote', 'downvote'].includes(voteType)) {
            throw new HttpError('Invalid vote type', 400);
        }
        
        const result = await questionServices.voteQuestion(questionId, req.user._id, voteType);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const getTrendingTags = async (req, res, next) => {
    try {
        const { limit } = parseInt(req.query.limit) || 10;
        
        const trendingTags = await questionServices.getTrendingTags(limit);
        
        res.status(200).json(trendingTags);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const getRecentQuestions = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        
        const result = await questionServices.getRecentQuestions(page, limit);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

module.exports = {
    createQuestion,
    searchQuestionsByTag,
    searchQuestionsByText,
    getQuestionById,
    voteQuestion,
    getTrendingTags,
    getRecentQuestions
}