const { body, query } = require('express-validator');

const questionValidation = [
    body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 10 }).withMessage('Title must be at least 10 characters long'),

    body('body')
    .notEmpty().withMessage('Body is required')
    .isLength({ min: 10 }).withMessage('Body must be at least 10 characters long'),
];

const searchValidation = [
    query('tag')
        .optional()
        .isString().withMessage('Tag must be a string')
        .trim()
        .isLength({ min: 1 }).withMessage('Tag cannot be empty'),
    
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
    questionValidation,
    searchValidation
}