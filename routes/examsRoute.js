const express = require('express');
const examsRouter = express.Router();
const { Exam, Question } = require('../models/examModel');
const auth = require('../middleware/auth');
const { GET_ALL_EXAMS, ADD_EXAM, EDIT_EXAM, DELETE_EXAM, GET_ALL_QUESTIONS, ADD_QUESTION, EDIT_QUESTION, DELETE_QUESTION } = require('../utils/constants');

// get all exams

examsRouter.get('/get-all-exams', auth, async (req, res) => {
    try {
        const exams = await Exam.find().populate('questions');
        if (exams.length === 0) {
            return res.status(200).json({
                message: GET_ALL_EXAMS.EXAMS_NOT_FOUND,
                success: true,
                exams: []
            });
        }
        res.status(200).json({
            message: GET_ALL_EXAMS.EXAMS_FETCHED_SUCCESSFULLY,
            success: true,
            exams: exams
        });
    } catch (error) {
        res.status(500).json({
            message: GET_ALL_EXAMS.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

// add exam

examsRouter.post('/add-exam', auth, async (req, res) => {
    try {
        const { name, category, duration, passingMarks, totalMarks } = req.body;
        
        // check if exam already exists - FIRST check this
        const existingExam = await Exam.findOne({ name });
        if (existingExam) {
            return res.status(400).json({
                message: ADD_EXAM.EXAM_ALREADY_EXISTS,
                success: false,
            });
        }

        // If no existing exam, then create new one
        const exam = await Exam.create({ name, category, duration, passingMarks, totalMarks });
        
        res.status(201).json({
            message: ADD_EXAM.EXAM_ADDED_SUCCESSFULLY,
            success: true,
            data: exam
        });
    } catch (error) {
        res.status(500).json({
            message: ADD_EXAM.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

// Edit exam

examsRouter.patch('/edit-exam/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, duration, passingMarks, totalMarks } = req.body;
        console.log('req.body', name, category, duration, passingMarks, totalMarks);
        // check if exam exists
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(400).json({
                message: EDIT_EXAM.EXAM_NOT_FOUND,
                success: false,
            });
        }
        // update exam
        const updatedExam = await Exam.findByIdAndUpdate(id, { name, category, duration, passingMarks, totalMarks }, { new: true });
        res.status(200).json({
            message: EDIT_EXAM.EXAM_UPDATED_SUCCESSFULLY,
            success: true,
            data: updatedExam
        });
    } catch (error) {
        res.status(500).json({
            message: EDIT_EXAM.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
}); 

// delete exam

examsRouter.delete('/delete-exam/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        // check if exam exists
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(400).json({
                message: DELETE_EXAM.EXAM_NOT_FOUND,
                success: false,
            });
        }
        // delete exam
        await Exam.findByIdAndDelete(id);
        res.status(200).json({
            message: DELETE_EXAM.EXAM_DELETED_SUCCESSFULLY,
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: DELETE_EXAM.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

// get all questions

examsRouter.get('/get-all-questions', auth, async (req, res) => {
    try {
        const questions = await Question.find()
        if (questions.length === 0) {
            return res.status(200).json({
                message: GET_ALL_QUESTIONS.QUESTIONS_NOT_FOUND,
                success: true,
                questions: []
            });
        }
        res.status(200).json({
            message: GET_ALL_QUESTIONS.QUESTIONS_FETCHED_SUCCESSFULLY,
            success: true,
            questions: questions
        });
    } catch (error) {
        res.status(500).json({
            message: GET_ALL_QUESTIONS.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

// add question

examsRouter.post('/add-question', auth, async (req, res) => {
    try {
        const { examId, question, options, answer, explanation } = req.body;
        
        // check if exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(400).json({
                message: ADD_QUESTION.QUESTION_ALREADY_EXISTS,
                success: false,
            });
        }

        // create new question
        const newQuestion = new Question({
            examId,
            question,
            options: Array.isArray(options) ? options : [options],
            answer,
            explanation
        });

        await newQuestion.save();

        // Add question reference to exam
        exam.questions.push(newQuestion._id);
        await exam.save();

        res.status(201).json({
            message: ADD_QUESTION.QUESTION_ADDED_SUCCESSFULLY,
            success: true,
            data: newQuestion
        });
    } catch (error) {
        res.status(500).json({
            message: ADD_QUESTION.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

// edit question

examsRouter.patch('/edit-question/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { question, options, answer, explanation, questionId, examId } = req.body;
        // check if question exists
        const existingQuestion = await Question.findById(id);
        if (!existingQuestion) {
            return res.status(400).json({
                message: EDIT_QUESTION.QUESTION_NOT_FOUND,
                success: false,
            });
        }
        // update question
        const updatedQuestion = await Question.findByIdAndUpdate(id, { question, options, answer, explanation, questionId, examId }, { new: true });
        res.status(200).json({
            message: EDIT_QUESTION.QUESTION_UPDATED_SUCCESSFULLY,
            success: true,
            data: updatedQuestion
        });
    } catch (error) {
        res.status(500).json({
            message: EDIT_QUESTION.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

// delete question

examsRouter.delete('/delete-question/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        // check if question exists
        const question = await Question.findById(id);
        if (!question) {
            return res.status(400).json({
                message: DELETE_QUESTION.QUESTION_NOT_FOUND,
                success: false, 
            });
        }
        // delete question
        await Question.findByIdAndDelete(id);
        res.status(200).json({
            message: DELETE_QUESTION.QUESTION_DELETED_SUCCESSFULLY,
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: DELETE_QUESTION.INTERNAL_SERVER_ERROR,
            success: false, 
            error: error.message
        });
    }
});

module.exports = examsRouter;