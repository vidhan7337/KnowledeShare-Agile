const userServices = require('../services/user-services');
const HttpError = require('../utils/http-error');

const getUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const targetUserId = userId || req.user?._id;
        
        if (!targetUserId) {
            throw new HttpError('User ID is required', 400);
        }
        
        const profile = await userServices.getUserProfile(targetUserId);
        
        res.status(200).json(profile);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const getTopUsers = async (req, res, next) => {
    try {
        const { limit } = req.query;
        
        const topUsers = await userServices.getTopUsers(limit);
        
        res.status(200).json(topUsers);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const getUserStats = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const targetUserId = userId || req.user._id;
        
        const stats = await userServices.getUserStats(targetUserId);
        
        res.status(200).json(stats);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

const updateUserBadges = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const targetUserId = userId || req.user._id;
        
        const user = await userServices.updateUserBadges(targetUserId);
        
        res.status(200).json(user);
    } catch (err) {
        next(new HttpError(err.message, err.code || 500));
    }
};

module.exports = {
    getUserProfile,
    getTopUsers,
    getUserStats,
    updateUserBadges
};
