const express = require('express');

const { register, getUsers, getUserById, updateUser, logoutUser, verifyOTP, resendOTP } = require('../controllers/authController');
const { loginUser } = require('../controllers/authController');
const { deleteUser } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { uploadUserImage } = require('../middleware/uploadMiddleware')

const router = express.Router();

router.post('/register', uploadUserImage, register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.delete('/:userId', protect, admin, deleteUser);
router.get('/', protect, admin, getUsers);
router.get('/:userId', getUserById);
router.put('/:userId', protect, admin, uploadUserImage, updateUser);


module.exports = router;