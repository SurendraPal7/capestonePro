const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            farmerId
        } = req.body;

        if (!farmerId || !require('mongoose').Types.ObjectId.isValid(farmerId)) {
            res.status(400);
            throw new Error('Invalid or missing Farmer ID');
        }

        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        } else {
            // Check stock availability
            for (const item of orderItems) {
                if (!item.product || !require('mongoose').Types.ObjectId.isValid(item.product)) {
                    res.status(400);
                    throw new Error(`Invalid product ID in order`);
                }
                const product = await Product.findById(item.product);
                if (!product) {
                    res.status(404);
                    throw new Error(`Product not found`);
                }
                if (product.quantity < item.qty) {
                    res.status(400);
                    throw new Error(`Insufficient stock for ${product.name}`);
                }
            }

            // Deduct stock
            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                product.quantity -= item.qty;
                await product.save();
            }

            const order = new Order({
                orderItems,
                buyer: req.user._id,
                farmer: farmerId,
                shippingAddress,
                paymentMethod,
                totalPrice,
                status: 'Pending'
            });

            const createdOrder = await order.save();

            res.status(201).json(createdOrder);
        }
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack,
        });
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('buyer', 'name email phone')
        .populate('farmer', 'name email phone farmName');

    if (order) {
        // Only allow buyer or farmer involved to see order
        if (req.user._id.toString() === order.buyer._id.toString() ||
            req.user._id.toString() === order.farmer._id.toString()) {
            res.json(order);
        } else {
            res.status(401);
            throw new Error('Not authorized to view this order');
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status (Farmer)
// @route   PUT /api/orders/:id/status
// @access  Private/Farmer
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.farmer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        order.status = req.body.status || order.status;
        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders (Buyer)
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
        .sort({ createdAt: -1 })
        .populate('farmer', 'name email phone farmName location');
    res.json(orders);
});

// @desc    Get orders for farmer
// @route   GET /api/orders/farmerorders
// @access  Private/Farmer
const getFarmerOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ farmer: req.user._id })
        .sort({ createdAt: -1 })
        .populate('buyer', 'name email phone location');
    res.json(orders);
});

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getMyOrders,
    getFarmerOrders,
};
