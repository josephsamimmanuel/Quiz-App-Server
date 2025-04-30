const express = require('express');
const reportsRouter = express.Router();
const Report = require('../models/reportModel');
const { Exam } = require('../models/examModel');
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const { ADD_REPORT, GET_ALL_REPORTS, GET_REPORT_BY_USER_ID, GET_ALL_REPORTS_WITH_SEARCH } = require('../utils/constants');

// Add Report
reportsRouter.post('/addReport', auth, async (req, res) => {
    try {
        const { userId, examId, marksObtained, totalMarks, verdict } = req.body;
        const report = new Report({ userId, examId, marksObtained, totalMarks, verdict });
        await report.save();
        res.status(201).json({
            message: ADD_REPORT.REPORT_ADDED_SUCCESSFULLY,
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            message: ADD_REPORT.INTERNAL_SERVER_ERROR,
            success: false, 
            error: error.message
        });
    }
});

// Get All Reports
reportsRouter.get('/getAllReports', auth, async (req, res) => {
    try {
        const reports = await Report.find().populate('examId');
        if (reports.length === 0) {
            return res.status(200).json({
                message: GET_ALL_REPORTS.REPORTS_NOT_FOUND,
                success: true,
                reports: []
            });
        }
        res.status(200).json({
            message: GET_ALL_REPORTS.REPORTS_FETCHED_SUCCESSFULLY,
            success: true,
            reports
        });
    } catch (error) {
        res.status(500).json({
            message: GET_ALL_REPORTS.INTERNAL_SERVER_ERROR,
            success: false, 
            error: error.message
        });
    }
});

// Get Report by User ID
reportsRouter.get('/getReportByUserId', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const reports = await Report.find({ userId: userId.userId }).populate('examId');
        if (reports.length === 0) {
            return res.status(200).json({
                message: GET_REPORT_BY_USER_ID.REPORTS_NOT_FOUND,
                success: true,
                reports: []
            });
        }
        res.status(200).json({
            message: GET_REPORT_BY_USER_ID.REPORTS_FETCHED_SUCCESSFULLY,
            success: true,
            reports
        });
    } catch (error) {
        res.status(500).json({
            message: GET_REPORT_BY_USER_ID.INTERNAL_SERVER_ERROR,
            success: false, 
            error: error.message
        });
    }
});

// Get All Reports with Search
reportsRouter.post('/getAllReportsWithSearch', auth, async (req, res) => {
    try {
        const { exam, user } = req.body;
        
        // Build the query object
        let query = {};
        
        if (exam) {
            // Find exams that match the name
            const matchingExams = await Exam.find({ 
                name: { $regex: exam, $options: 'i' } 
            });
            if (matchingExams.length > 0) {
                query.examId = { $in: matchingExams.map(exam => exam._id) };
            }
        }
        
        if (user) {
            // Find users that match the name
            const matchingUsers = await User.find({ 
                name: { $regex: user, $options: 'i' } 
            });
            if (matchingUsers.length > 0) {
                query.userId = { $in: matchingUsers.map(user => user._id) };
            }
        }

        // If no matches found for either search term, return empty array
        if ((exam && !query.examId) || (user && !query.userId)) {
            return res.status(200).json({
                message: GET_ALL_REPORTS_WITH_SEARCH.REPORTS_NOT_FOUND,
                success: true,
                reports: []
            });
        }

        const reports = await Report.find(query)
            .populate('examId')
            .populate('userId');

        res.status(200).json({
            message: GET_ALL_REPORTS_WITH_SEARCH.REPORTS_FETCHED_SUCCESSFULLY,
            success: true,
            reports
        });
    } catch (error) {
        res.status(500).json({
            message: GET_ALL_REPORTS_WITH_SEARCH.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

module.exports = reportsRouter;
