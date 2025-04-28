const express = require('express');
const reportsRouter = express.Router();
const Report = require('../models/reportModel');
const { Exam } = require('../models/examModel');
const User = require('../models/userModel');
const auth = require('../middleware/auth');

// Add Report
reportsRouter.post('/addReport', auth, async (req, res) => {
    try {
        const { userId, examId, marksObtained, totalMarks, verdict } = req.body;
        const report = new Report({ userId, examId, marksObtained, totalMarks, verdict });
        await report.save();
        res.status(201).json({
            message: 'Report added successfully',
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            success: false, 
            error: error.message
        });
    }
});

// Get All Reports
reportsRouter.get('/getAllReports', auth, async (req, res) => {
    try {
        const reports = await Report.find().populate('examId');
        res.status(200).json({
            message: 'Reports fetched successfully',
            success: true,
            reports
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
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
        res.status(200).json({
            message: 'Reports fetched successfully',
            success: true,
            reports
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
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
                message: 'No reports found',
                success: true,
                reports: []
            });
        }

        const reports = await Report.find(query)
            .populate('examId')
            .populate('userId');

        res.status(200).json({
            message: 'Reports fetched successfully',
            success: true,
            reports
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: error.message
        });
    }
});

module.exports = reportsRouter;
