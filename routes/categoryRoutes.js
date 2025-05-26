const express = require('express');
const { uploadCategoryImage } = require('../middleware/uploadMiddleware');
const {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategories
} = require('../controllers/categoryController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const router = express.Router();

// Public route (no auth required)
router.get('/', getCategories);

// Protected admin-only routes
router.post('/', protect, admin, uploadCategoryImage, createCategory);
router.put('/:categoryId', protect, admin, uploadCategoryImage, updateCategory);
router.delete('/:categoryId', protect, admin, deleteCategory);

module.exports = router;