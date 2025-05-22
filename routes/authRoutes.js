const express = require('express');

const { register, getUsers, getUserById, updateUser } = require('../controllers/authController');
const { loginUser } = require('../controllers/authController');
const { deleteUser } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { uploadUserImage } = require('../middleware/uploadMiddleware')

const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);
router.delete('/:userId', protect, admin, deleteUser);
router.get('/', protect, admin, getUsers);
router.get('/:userId', protect, admin, getUserById);
router.put('/:userId', protect, admin, uploadUserImage, updateUser);


module.exports = router;