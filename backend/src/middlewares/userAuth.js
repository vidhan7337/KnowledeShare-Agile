const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(token, 'vidhan');

        const user = await User.findById(decodedToken.id);
        if (!user) {
            throw new HttpError('User not authenticated', 401);
        }

        req.user = user;
        next();

    } catch(err) {
        next(new HttpError(err.message, err.status || 500));
    }
}

module.exports = {
    userAuth
}