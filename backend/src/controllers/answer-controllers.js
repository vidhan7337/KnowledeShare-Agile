const answerServices = require('../services/answer-services');
const HttpError = require('../utils/http-error');
const { validationResult } = require('express-validator');

const createAnswer = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new HttpError(errors.array()[0].msg, 400);
        }

        const { questionId } = req.params;
        const answer = await answerServices.createAnswer(req.body, req.user._id, questionId);

        res.status(201).json(answer);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const getAnswersByQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { page, limit } = req.query;
        
        const result = await answerServices.getAnswersByQuestion(questionId, page, limit);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const voteAnswer = async (req, res, next) => {
    try {
        const { answerId } = req.params;
        const { voteType } = req.body;
        
        if (!['upvote', 'downvote'].includes(voteType)) {
            throw new HttpError('Invalid vote type', 400);
        }
        
        const result = await answerServices.voteAnswer(answerId, req.user._id, voteType);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const acceptAnswer = async (req, res, next) => {
    try {
        const { answerId } = req.params;
        
        const result = await answerServices.acceptAnswer(answerId, req.user._id);
        
        res.status(200).json(result);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

module.exports = {
    createAnswer,
    getAnswersByQuestion,
    voteAnswer,
    acceptAnswer
};
