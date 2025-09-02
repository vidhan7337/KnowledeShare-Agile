const express = require('express');
const router = express.Router();
const commentControllers = require('../controllers/comment-controllers');
const { userAuth } = require('../middlewares/userAuth');
const { commentValidation, voteValidation } = require('../middlewares/comment-validators');

// Create comment on question or answer
router.post('/:parentType/:parentId', userAuth, commentValidation, commentControllers.createComment);

// Get comments for a question or answer
router.get('/:parentType/:parentId', commentControllers.getCommentsByParent);

// Vote on a comment
router.post('/:commentId/vote', userAuth, voteValidation, commentControllers.voteComment);

// Delete a comment
router.delete('/:commentId', userAuth, commentControllers.deleteComment);

module.exports = router;
