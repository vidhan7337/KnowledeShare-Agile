const express = require('express');
const router = express.Router();
const answerControllers = require('../controllers/answer-controllers');
const { userAuth } = require('../middlewares/userAuth');
const { answerValidation, voteValidation } = require('../middlewares/answer-validators');

// Create answer for a question
router.post('/questions/:questionId/answers', userAuth, answerValidation, answerControllers.createAnswer);

// Get answers for a question
router.get('/questions/:questionId/answers', answerControllers.getAnswersByQuestion);

// Vote on an answer
router.post('/:answerId/vote', userAuth, voteValidation, answerControllers.voteAnswer);

// Accept/unaccept an answer
router.post('/:answerId/accept', userAuth, answerControllers.acceptAnswer);

module.exports = router;
