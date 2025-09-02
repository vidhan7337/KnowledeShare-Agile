const { body, param, query } = require('express-validator');

const signupValidation = [
    body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),

    body('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),

    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
];

const loginValidation = [
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),

    body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = {
    signupValidation,
    loginValidation
}