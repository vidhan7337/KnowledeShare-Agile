const express = require('express');
const router = express.Router();
const questionControllers = require('../controllers/question-controllers');
const { userAuth } = require('../middlewares/userAuth');
const { questionValidation, searchValidation } = require('../middlewares/question-validators');

// Create new question
router.post("/", userAuth, [ questionValidation ], questionControllers.createQuestion);

// Search questions by tag with pagination
router.get("/search", userAuth, [ searchValidation ], questionControllers.searchQuestionsByTag); // ?tag=&page=&limit=

// Full-text search questions
router.get("/search/text", searchValidation, questionControllers.searchQuestionsByText); // ?q=&page=&limit=

// Get recent questions (dashboard feed)
router.get("/recent", questionControllers.getRecentQuestions); // ?page=&limit=

// Get trending tags
router.get("/trending", questionControllers.getTrendingTags); // ?limit=

// Vote on a question
router.post("/:questionId/vote", userAuth, questionControllers.voteQuestion);

// Get question by ID with full details (must be last to avoid catching other routes)
router.get("/:questionId", questionControllers.getQuestionById);

module.exports = router;