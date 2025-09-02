const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/user-controllers');
const { userAuth } = require('../middlewares/userAuth');

// Get user profile (public)
router.get('/profile', userControllers.getUserProfile);
router.get('/profile/:userId', userControllers.getUserProfile);

// Get top users by reputation
router.get('/top', userControllers.getTopUsers);

// Get user statistics
router.get('/stats', userAuth, userControllers.getUserStats);
router.get('/stats/:userId', userAuth, userControllers.getUserStats);

// Update user badges
router.post('/badges', userAuth, userControllers.updateUserBadges);
router.post('/badges/:userId', userAuth, userControllers.updateUserBadges);

module.exports = router;
