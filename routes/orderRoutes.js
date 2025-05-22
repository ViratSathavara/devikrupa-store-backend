const express = require('express');
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController');

const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.put('/:id', protect, admin, updateOrderStatus);

module.exports = router;