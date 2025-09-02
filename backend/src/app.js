const express = require('express');
const app = express();
const { connectDB } = require('./config/database');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth-routes');
const questionRoutes = require('./routes/question-routes');
const answerRoutes = require('./routes/answer-routes');
const commentRoutes = require('./routes/comment-routes');
const userRoutes = require('./routes/user-routes');

app.use(cors({
    origin: "http://localhost:5174",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ 
        message: err.message || 'Internal server error' 
    });
});

connectDB()
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => {
        console.log(err);
    });