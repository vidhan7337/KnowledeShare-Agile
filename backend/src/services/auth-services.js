const User = require('../models/user');
const HttpError = require('../utils/http-error');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const signup = async (input) => {
    try {
        const {name, email, password} = input;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            throw new HttpError('User already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name, 
            email, 
            password: hashedPassword
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, 'vidhan', {expiresIn: '1h'});
        
        return [newUser, token];
    }catch(err) {
        throw new HttpError(err.message, 500);
    }
}

const login = async (input) => {
    try {
        const {email, password} = input;
        const user = await User.findOne({email: email.toLowerCase()});
        if (!user) {
            throw new HttpError('User not found', 404);
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) {
            throw new HttpError('Invalid password', 400);
        }

        const token = jwt.sign({ id: user._id }, 'vidhan', {expiresIn: '1h'});
        return [user, token];
    }catch(err) {
        throw new HttpError(err.message, 500);
    }
}

module.exports = {
    signup,
    login
}