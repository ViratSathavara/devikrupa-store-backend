const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async(req, res, next) => {
    try {
        let token;

        // 1. From cookie
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // 2. From Authorization header
        else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Token failed' });
    }
};

module.exports = protect;