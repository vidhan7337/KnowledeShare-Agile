const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://vidhanpatel777:NSKau9TuzYzfUa6R@cluster0.eg9ufve.mongodb.net/mini_stack_overflow');
}

module.exports = {
    connectDB
};