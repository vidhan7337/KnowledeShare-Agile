const { body } = require('express-validator');

const answerValidation = [
    body('body')
        .notEmpty().withMessage('Answer body is required')
        .isLength({ min: 10 }).withMessage('Answer must be at least 10 characters long')
        .trim()
];

const voteValidation = [
    body('voteType')
        .notEmpty().withMessage('Vote type is required')
        .isIn(['upvote', 'downvote']).withMessage('Vote type must be either upvote or downvote')
];

module.exports = {
    answerValidation,
    voteValidation
};
