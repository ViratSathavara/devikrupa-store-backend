const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const BlacklistToken = require('../models/blacklistToken');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { generateAndSendOTP } = require('../services/otpService');

const tempRegistrations = new Map();

exports.register = async(req, res) => {
    try {
        const { firstname, lastname, email, phone, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        const registrationData = {
            firstname,
            lastname,
            email,
            phone,
            password,
            image: req.file ? `/uploads/${req.file.filename}` : null,
        };

        // Send OTP - must await
        const otpResult = await sendOTP(email);
        if (!otpResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP',
            });
        }

        // Store temporary data with expiration (e.g., 5 minutes = 300000 ms)
        tempRegistrations.set(email, {
            data: registrationData,
            expiresAt: Date.now() + 300000,
        });

        res.status(200).json({
            success: true,
            status: 200,
            message: 'OTP sent to email',
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
};

exports.verifyOTP = async(req, res) => {
    try {
        const { email, otp } = req.body;
        console.log(email, otp);

        const verification = await verifyOTP(email, otp);
        console.log(verification);

        if (!verification.success) {
            return res.status(400).json({
                success: false,
                message: verification.message || 'Invalid OTP',
            });
        }

        const tempData = tempRegistrations.get(email);
        if (!tempData || Date.now() > tempData.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Registration session expired',
            });
        }

        console.log(tempData, tempData.data);

        // Extract the required fields correctly
        const { firstname, lastname, email: userEmail, phone, password } = tempData.data;

        const newUser = new User({
            firstname,
            lastname,
            email: userEmail,
            phone,
            password,
            userId: 1, // Do not change this as per your request
            image: req.file ? `/uploads/${req.file.filename}` : null,
        });

        await newUser.save();
        const token = await newUser.generateAuthToken();

        tempRegistrations.delete(email);

        res.status(201).json({
            status: 201,
            success: true,
            message: 'User registered successfully',
            data: {
                user: newUser,
                userId: 1,
                token,
            },
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification',
        });
    }
};


exports.resendOTP = async(req, res) => {
    try {
        const { email } = req.body;
        console.log(email)

        const tempData = tempRegistrations.get(email);
        console.log(tempData)
        if (!tempData) {
            return res.status(400).json({
                success: false,
                message: 'No registration in progress',
            });
        }

        // Resend OTP - must await
        const otpResult = await sendOTP(email);
        if (!otpResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to resend OTP',
            });
        }

        // Update expiration (keep data unchanged)
        tempRegistrations.set(email, {
            data: tempData.data,
            expiresAt: Date.now() + 300000, // reset 5 minutes expiry on resend
        });

        res.status(200).json({
            success: true,
            status: 200,
            message: 'OTP resent successfully',
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP resend',
        });
    }
};


exports.loginUser = async(req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    console.log(req.body)

    const { email, password } = req.body.userData;
    console.log(email, password)


    const user = await User.findOne({ email }).select('+password');


    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.role === 'admin') {
        const isMatch = user.matchId(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } else {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    }

    const token = await user.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({
        success: true,
        status: 200,
        message: 'User logged in successfully',
        data: {
            user,
            token
        },
    });
};

exports.deleteUser = async(req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const deleteduser = await User.findOneAndDelete({ userId });

        if (!deleteduser) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: 200,
            message: 'User deleted successfully',
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }

};

exports.getUsers = async(req, res) => {
    const users = await User.find();
    console.log(users)
    res.status(200).json({
        status: '200',
        data: {
            users,
        },
    });;
};

exports.getUserById = async(req, res) => {
    const { userId } = req.params;
    console.log(userId)

    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
        return res.status(400).json({ message: 'Invalid userId. Must be a number.' });
    }

    try {
        const user = await User.findOne({ userId: numericUserId });
        console.log(user)
        if (user) {
            res.status(200).json({
                status: 200,
                data: {
                    user,
                },
            });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUser = async(req, res) => {
    try {
        const { userId } = req.params;
        const { firstname, lastname, phone, email, image } = req.body;


        const updateData = {
            firstname,
            lastname,
            phone,
            email,
            image
        };

        console.log(updateData)

        if (updateData.email) {
            const existingUser = await User.findOne({
                email: updateData.email,
                userId // exclude current user
            });


            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use by another user.' });
            }
        }

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const updatedCategory = await User.findOneAndUpdate({ userId },
            updateData, { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Category not found or not updated',
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: 'Category updated successfully',
            category: updatedCategory,
        });

    } catch (error) {
        console.error('Update Category Error:', error.message);
        res.status(500).json({ message: 'Server Error', error });
    }
};

module.exports.logoutUser = async(req, res, next) => {
    const token = req.headers.authorization.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        await BlacklistToken.create({ token });

        // Clear cookie if using cookies
        // res.clearCookie('token');

        res.status(200).json({
            success: true,
            message: 'User logged out successfully',
        });
    } catch (error) {
        next(error);
    }
}