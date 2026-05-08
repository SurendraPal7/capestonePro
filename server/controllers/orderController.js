import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { 
    sendNewOrderEmail, 
    sendOrderConfirmedEmail, 
    sendOrderShippedEmail, 
    sendOrderDeliveredEmail,
    sendOrderCancelledEmail 
} from '../utils/emailService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = asyncHandler(async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            farmerId,
            paymentInfo
        } = req.body;

        if (!farmerId || !mongoose.Types.ObjectId.isValid(farmerId)) {
            res.status(400);
            throw new Error('Invalid or missing Farmer ID');
        }

        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        } else {
            // Check stock availability
            for (const item of orderItems) {
                if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
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
                status: 'Pending',
                isPaid: paymentInfo ? true : false,
                paidAt: paymentInfo ? Date.now() : undefined,
                paymentResult: paymentInfo ? {
                    id: paymentInfo.razorpay_payment_id,
                    status: 'completed',
                    razorpay_order_id: paymentInfo.razorpay_order_id,
                    razorpay_signature: paymentInfo.razorpay_signature
                } : undefined
            });

            const createdOrder = await order.save();

            // Send email notification to farmer
            try {
                const farmer = await User.findById(farmerId);
                const buyer = await User.findById(req.user._id);
                
                if (farmer && buyer) {
                    await sendNewOrderEmail(
                        farmer.email,
                        farmer.name,
                        buyer.name,
                        {
                            orderId: createdOrder._id.toString().slice(-8).toUpperCase(),
                            totalPrice: totalPrice,
                            itemCount: orderItems.length,
                            address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}`
                        }
                    );
                    console.log('📧 New order email sent to farmer');
                }
            } catch (emailError) {
                console.error('Email notification failed:', emailError);
                // Don't fail the order creation if email fails
            }

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
export const getOrderById = asyncHandler(async (req, res) => {
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
export const updateOrderToPaid = asyncHandler(async (req, res) => {
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
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('buyer', 'name email')
        .populate('farmer', 'name email farmName');

    if (order) {
        if (order.farmer._id.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        const oldStatus = order.status;
        order.status = req.body.status || order.status;
        
        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        // Send email notification to buyer based on status change
        try {
            const orderDetails = {
                orderId: order._id.toString().slice(-8).toUpperCase(),
                totalPrice: order.totalPrice,
                address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`
            };

            if (req.body.status === 'Confirmed' && oldStatus !== 'Confirmed') {
                await sendOrderConfirmedEmail(
                    order.buyer.email,
                    order.buyer.name,
                    order.farmer.farmName || order.farmer.name,
                    orderDetails
                );
                console.log('📧 Order confirmed email sent to buyer');
            } else if (req.body.status === 'Shipped' && oldStatus !== 'Shipped') {
                await sendOrderShippedEmail(
                    order.buyer.email,
                    order.buyer.name,
                    order.farmer.farmName || order.farmer.name,
                    orderDetails
                );
                console.log('📧 Order shipped email sent to buyer');
            } else if (req.body.status === 'Delivered' && oldStatus !== 'Delivered') {
                await sendOrderDeliveredEmail(
                    order.buyer.email,
                    order.buyer.name,
                    order.farmer.farmName || order.farmer.name,
                    orderDetails
                );
                console.log('📧 Order delivered email sent to buyer');
            } else if (req.body.status === 'Cancelled' && oldStatus !== 'Cancelled') {
                await sendOrderCancelledEmail(
                    order.buyer.email,
                    order.buyer.name,
                    order.farmer.farmName || order.farmer.name,
                    orderDetails
                );
                console.log('📧 Order cancelled email sent to buyer');
            }
        } catch (emailError) {
            console.error('Email notification failed:', emailError);
            // Don't fail the status update if email fails
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders (Buyer)
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
        .sort({ createdAt: -1 })
        .populate('farmer', 'name email phone farmName location');
    res.json(orders);
});

// @desc    Get orders for farmer
// @route   GET /api/orders/farmerorders
// @access  Private/Farmer
export const getFarmerOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ farmer: req.user._id })
        .sort({ createdAt: -1 })
        .populate('buyer', 'name email phone location');
    res.json(orders);
});
