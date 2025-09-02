const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/auth-controllers');
const { signupValidation, loginValidation } = require('../middlewares/auth-validators');

router.post('/signup', [ signupValidation ], authControllers.signup);

router.post('/login', [ loginValidation ], authControllers.login);

module.exports = router;