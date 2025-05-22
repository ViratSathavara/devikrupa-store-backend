const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.register = async(req, res) => {
    const { firstname, lastname, email, phone, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ firstname, lastname, email, phone, password, role });

    const newUser = new User({
        ...req.body,
        userId: 1,
        image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newUser.save();

    const token = await user.generateAuthToken();

    res.status(201).json({
        success: true,
        status: '200',
        message: 'User created successfully',
        data: {
            newUser,
            token,
        },
    });
};


exports.loginUser = async(req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;


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
        status: '200',
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

    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
        return res.status(400).json({ message: 'Invalid userId. Must be a number.' });
    }

    try {
        const user = await User.findOne({ userId: numericUserId });
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