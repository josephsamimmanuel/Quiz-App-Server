const express = require('express');
const usersRouter = express.Router();
const { User, Profile } = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { REGISTER, LOGIN, USER, LOGOUT, PROFILE, EDIT_PROFILE } = require('../utils/constants');

usersRouter.post('/register', async (req, res) => {
    try {
        // 1. Check if the user already exists
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: REGISTER.USER_ALREADY_EXISTS,
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
            message: REGISTER.USER_CREATED_SUCCESSFULLY,
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: REGISTER.INTERNAL_SERVER_ERROR,
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
                message: LOGIN.USER_NOT_FOUND,
                success: false
            });
        }
        // 2. Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: LOGIN.INVALID_CREDENTIALS,
                success: false
            });
        }
        // 3. Generate a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // 4. Send the token to the client
        res.status(200).json({
            message: LOGIN.LOGIN_SUCCESSFULLY,
            success: true,
            data: {
                token,
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            message: LOGIN.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

module.exports = usersRouter;

// get user details

usersRouter.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                message: USER.USER_NOT_FOUND,
                success: false
            });
        }
        res.status(200).json({
            message: USER.USER_DETAILS_FETCHED_SUCCESSFULLY,
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            message: USER.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});


usersRouter.get('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({
            message: LOGOUT.LOGOUT_SUCCESSFULLY,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: LOGOUT.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

usersRouter.get('/user/profile', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.userId });
        if (!profile) {
            // If no profile exists, return user information
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    message: PROFILE.PROFILE_NOT_FOUND,
                    success: false
                });
            }
            return res.status(200).json({
                message: PROFILE.USER_INFORMATION_FETCHED_SUCCESSFULLY,
                success: true,
                data: {
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    isProfileCreated: false
                }
            });
        }
        res.status(200).json({
            message: PROFILE.PROFILE_FETCHED_SUCCESSFULLY,
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            message: PROFILE.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

usersRouter.patch('/user/edit-profile', auth, async (req, res) => {
    try {
        const profile = await User.findOneAndUpdate({ _id: req.userId }, req.body, { new: true });
        res.status(200).json({
            message: EDIT_PROFILE.PROFILE_UPDATED_SUCCESSFULLY,
            success: true,
            data: profile
        }); 
    } catch (error) {
        res.status(500).json({
            message: EDIT_PROFILE.INTERNAL_SERVER_ERROR,
            success: false,
            error: error.message
        });
    }
});

module.exports = usersRouter;
