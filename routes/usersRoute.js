const express = require('express');
const usersRouter = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

usersRouter.post('/register', async (req, res) => {
    try {
        // 1. Check if the user already exists
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists',
                success: false
            });
        }
        // 2. Hash the password
        const hashedPassword = await bcrypt.hash(password, 6);
        // 3. Create a new user
        const newUser = new User({ name, email, password: hashedPassword });
        // 4. Save the user to the database
        await newUser.save();
        res.status(201).json({
            message: 'User created successfully',
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: error.message
        });
    }
});

usersRouter.post('/login', async (req, res) => {
    try {
        // 1. Check if the user exists
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }
        // 2. Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid password',
                success: false
            });
        }
        // 3. Generate a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // 4. Send the token to the client
        res.status(200).json({
            message: 'Login successful',
            success: true,
            data: {
                user,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: error.message
        });
    }
});

module.exports = usersRouter;
