const authServices = require('../services/auth-services');
const HttpError = require('../utils/http-error');
const {validationResult} = require('express-validator');

const signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new HttpError(errors.array()[0].msg, 400);
        }

        const [user, token] = await authServices.signup(req.body);

        res.status(201)
        .cookie('token', token, { expires: new Date(Date.now() + 60 * 60 * 1000) })
        .json(user);
    } catch(err) {
        next(new HttpError(err.message, err.status || 500));
    }
}

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new HttpError(errors.array()[0].msg, 400);
        }

        const [user, token] = await authServices.login(req.body);

        res.status(200)
        .cookie('token', token, { expires: new Date(Date.now() + 60 * 60 * 1000) })
        .json(user);
    } catch(err) {
        next(new HttpError(err.message, err.status || 500));
    }
}

module.exports = {
    signup,
    login
}