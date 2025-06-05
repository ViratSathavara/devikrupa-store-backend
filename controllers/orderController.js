const Order = require('../models/Order');

exports.createOrder = async(req, res) => {
    const { products, totalPrice } = req.body;
    console.log(products, totalPrice)
    const order = await Order.create({
        user: req.userId,
        products,
        totalPrice
    });
    res.status(201).json(order);
};

exports.getMyOrders = async(req, res) => {
    const orders = await Order.find({ user: req.userId }).populate('products.product');
    res.json(orders);
};

exports.getAllOrders = async(req, res) => {
    const orders = await Order.find().populate('user').populate('products.product');
    res.json(orders);
};

exports.updateOrderStatus = async(req, res) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
};