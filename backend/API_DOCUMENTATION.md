# Knowledge Sharing Platform API Documentation

A comprehensive API for a Stack Overflow-like knowledge sharing platform with user authentication, questions, answers, comments, voting, and reputation tracking.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```
POST /auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## ❓ Question Endpoints

### Search Questions by Tag
```
GET /questions/search?tag=javascript&page=1&limit=10
```
**Query Parameters:**
- `tag` (optional): Tag to search for
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### Full-Text Search Questions
```
GET /questions/search/text?q=authentication&page=1&limit=10
```
**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### Get Recent Questions (Dashboard)
```
GET /questions/recent?page=1&limit=10
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### Get Trending Tags
```
GET /questions/trending?limit=10
```
**Query Parameters:**
- `limit` (optional): Number of tags (default: 10)

### Get Question by ID
```
GET /questions/:questionId
```

### Vote on Question
```
POST /questions/:questionId/vote
```
**Body:**
```json
{
  "voteType": "upvote" // or "downvote"
}
```

### Create Question
```
POST /questions
```
**Body:**
```json
{
  "title": "How to implement authentication?",
  "body": "I need help with implementing user authentication in my app...",
  "tags": ["authentication", "nodejs", "javascript"]
}
```

---

## 💡 Answer Endpoints

### Create Answer
```
POST /answers/questions/:questionId/answers
```
**Body:**
```json
{
  "body": "Here's how you can implement authentication..."
}
```

### Get Answers for Question
```
GET /answers/questions/:questionId/answers
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### Vote on Answer
```
POST /answers/:answerId/vote
```
**Body:**
```json
{
  "voteType": "upvote" // or "downvote"
}
```

### Accept/Unaccept Answer
```
POST /answers/:answerId/accept
```

---

## 💬 Comment Endpoints

### Create Comment on Question
```
POST /comments/Question/:questionId
```
**Body:**
```json
{
  "body": "Great question! Have you tried..."
}
```

### Create Comment on Answer
```
POST /comments/Answer/:answerId
```
**Body:**
```json
{
  "body": "This solution works well, but..."
}
```

### Get Comments for Question/Answer
```
GET /comments/Question/:questionId?page=1&limit=20
GET /comments/Answer/:answerId?page=1&limit=20
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

### Vote on Comment
```
POST /comments/:commentId/vote
```
**Body:**
```json
{
  "voteType": "upvote" // or "downvote"
}
```

### Delete Comment
```
DELETE /comments/:commentId
```

---

## 👤 User Endpoints

### Get User Profile
```
GET /users/profile/:userId?
```
**Parameters:**
- `userId` (optional): If not provided, returns current user's profile

### Get Top Users by Reputation
```
GET /users/top?limit=10
```
**Query Parameters:**
- `limit` (optional): Number of users (default: 10)

### Get User Statistics
```
GET /users/stats/:userId?
```
**Parameters:**
- `userId` (optional): If not provided, returns current user's stats

### Update User Badges
```
POST /users/badges/:userId?
```
**Parameters:**
- `userId` (optional): If not provided, updates current user's badges

---

## 🏆 Reputation System

### Question Voting
- **Upvote**: +5 reputation
- **Downvote**: -1 reputation

### Answer Voting
- **Upvote**: +10 reputation
- **Downvote**: -2 reputation

### Answer Acceptance
- **Accept**: +15 reputation

### Comment Voting
- **Upvote/Downvote**: No reputation change (just for content quality)

---

## 🏅 Badge System

### Bronze Badges
- First question
- First answer
- First comment

### Silver Badges
- 10 questions
- 10 answers
- 100 reputation

### Gold Badges
- 50 questions
- 50 answers
- 500 reputation

### Platinum Badges
- 1000 reputation
- 100 questions
- 100 answers

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Pagination Response
```json
{
  "questions": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalQuestions": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "message": "Error description",
  "status": 400
}
```

---

## 🔍 Search Features

### Tag-based Search
- Uses MongoDB's `$in` operator for efficient tag matching
- Supports pagination and sorting by date

### Full-text Search
- MongoDB text search on question title and body
- Results sorted by relevance score and date
- Optimized with database indexes

### Trending Tags
- Calculated based on question count, votes, and views
- Uses MongoDB aggregation pipeline for performance

---

## 🚀 Performance Optimizations

- **Database Indexes**: Optimized for common query patterns
- **Pagination**: Efficient handling of large datasets
- **Population**: Smart population of related data
- **Lean Queries**: Memory-efficient data retrieval
- **Aggregation**: Fast statistical calculations

---

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **Authorization**: Role-based access control
- **Rate Limiting**: Protection against abuse
- **Data Sanitization**: XSS and injection protection

---

## 📝 Usage Examples

### Frontend Integration

```javascript
// Search questions by tag
const searchQuestions = async (tag, page = 1) => {
  const response = await fetch(`/api/questions/search?tag=${tag}&page=${page}`);
  return response.json();
};

// Vote on a question
const voteQuestion = async (questionId, voteType) => {
  const response = await fetch(`/api/questions/${questionId}/vote`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ voteType })
  });
  return response.json();
};

// Create an answer
const createAnswer = async (questionId, body) => {
  const response = await fetch(`/api/answers/questions/${questionId}/answers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body })
  });
  return response.json();
};

// Create a comment on a question
const createComment = async (questionId, body) => {
  const response = await fetch(`/api/comments/Question/${questionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body })
  });
  return response.json();
};
```

---

## 🔧 Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Database**
   - Update MongoDB connection string in `src/config/database.js`

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Test API**
   - Use Postman or similar tool to test endpoints
   - Start with authentication endpoints to get JWT token

---

## 📈 Monitoring & Analytics

- **Request Logging**: All API requests are logged
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Metrics**: Response time monitoring
- **Database Queries**: Query performance optimization
- **User Activity**: Track user engagement and reputation

This API provides a complete foundation for building a knowledge sharing platform with all the essential features of Stack Overflow, including user management, content creation, voting, reputation tracking, and advanced search capabilities.
