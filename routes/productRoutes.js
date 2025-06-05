const express = require('express');
const router = express.Router();
const { createProduct, getProductsByCategoryName } = require('../controllers/productController');
const { getProducts } = require('../controllers/productController');
const { getProductById } = require('../controllers/productController');
const { updateProduct } = require('../controllers/productController');
const { deleteProduct } = require('../controllers/productController');
const { uploadProductImages } = require('../middleware/uploadMiddleware');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public Routes
router.get('/', getProducts);
router.get('/category/:categoryName', getProductsByCategoryName);
router.get('/:productId', getProductById);
router.post(
    '/',
    protect,
    admin,
    (req, res, next) => {
        req.uploadType = 'product';
        next();
    },
    uploadProductImages,
    createProduct
);

router.put(
    '/:productId',
    protect,
    admin,
    (req, res, next) => {
        req.uploadType = 'product';
        next();
    },
    uploadProductImages,
    updateProduct
);

router.delete('/:productId', protect, admin, deleteProduct);

module.exports = router;