// BACKUP - Original payment controller with Razorpay
// This file is kept as backup. The main file has been modified for temporary COD support.

import Razorpay from 'razorpay';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

// Log environment variables for debugging
console.log('🔍 Razorpay Configuration Check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 15)}...` : '❌ NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ SET (hidden)' : '❌ NOT SET');

// Check if keys are set
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ ERROR: Razorpay keys not found in environment variables!');
    console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
}

// Initialize Razorpay instance
let razorpay;
try {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay instance initialized successfully\n');
} catch (error) {
    console.error('❌ Failed to initialize Razorpay:', error.message);
    console.error('Please check your Razorpay credentials in .env file\n');
}

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    if (!razorpay) {
        res.status(500);
        throw new Error('Razorpay is not configured. Please check server logs.');
    }

    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
        res.status(400);
        throw new Error('Amount is required');
    }

    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1 // Auto capture payment
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            },
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500);
        throw new Error('Failed to create Razorpay order: ' + error.message);
    }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400);
        throw new Error('Missing payment verification parameters');
    }

    try {
        // Create signature for verification
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id
            });
        } else {
            res.status(400);
            throw new Error('Invalid payment signature');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500);
        throw new Error('Payment verification failed');
    }
});

// @desc    Get Razorpay key
// @route   GET /api/payment/key
// @access  Public
export const getRazorpayKey = asyncHandler(async (req, res) => {
    res.status(200).json({
        key: process.env.RAZORPAY_KEY_ID
    });
});
