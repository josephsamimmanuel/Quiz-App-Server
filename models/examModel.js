const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: Array,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    explanation: {
        type: String,
        required: false
    }
}, { timestamps: true });

const examSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    passingMarks: {
        type: Number,
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    }],
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
const Exam = mongoose.model('Exam', examSchema);

module.exports = { Question, Exam };
