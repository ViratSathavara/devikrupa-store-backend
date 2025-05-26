const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistToken = require('../models/blacklistToken');

const protect = async(req, res, next) => {
    try {
        let token;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        const isBlacklisted = await BlacklistToken.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                status: '401',
                message: 'Unauthorized',
            });
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