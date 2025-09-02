const { body } = require('express-validator');

const commentValidation = [
    body('body')
        .notEmpty().withMessage('Comment body is required')
        .isLength({ min: 5 }).withMessage('Comment must be at least 5 characters long')
        .trim()
];

const voteValidation = [
    body('voteType')
        .notEmpty().withMessage('Vote type is required')
        .isIn(['upvote', 'downvote']).withMessage('Vote type must be either upvote or downvote')
];

module.exports = {
    commentValidation,
    voteValidation
};
