import Razorpay from 'razorpay';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

// RAZORPAY MODE - Set to true only if you don't have correct keys yet
const TEMP_COD_MODE = true; // Change to false once you have correct Razorpay keys

console.log('\n💳 PAYMENT CONTROLLER STATUS:');
if (TEMP_COD_MODE) {
    console.log('🔄 Running in TEMPORARY COD MODE');
    console.log('📋 Orders will be placed as Cash on Delivery');
    console.log('✅ To enable Razorpay: Add correct keys to .env and set TEMP_COD_MODE = false\n');
} else {
    console.log('✅ Razorpay payment mode ENABLED');
    console.log('💳 Payment methods: Card, UPI, Netbanking, Wallets');
    console.log('🔍 Razorpay Configuration Check:');
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 15)}...` : '❌ NOT SET');
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ SET (hidden)' : '❌ NOT SET');
}

// Initialize Razorpay instance
let razorpay;
if (!TEMP_COD_MODE) {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay keys not found in environment variables');
        }
        
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay instance initialized successfully');
        console.log('🚀 Ready to accept payments!\n');
    } catch (error) {
        console.error('❌ Failed to initialize Razorpay:', error.message);
        console.error('⚠️  Please add correct Razorpay keys to .env file');
        console.error('📖 Or set TEMP_COD_MODE = true to use Cash on Delivery\n');
    }
}

// @desc    Create Razorpay order (or COD order in temporary mode)
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
        res.status(400);
        throw new Error('Amount is required');
    }

    // TEMPORARY COD MODE
    if (TEMP_COD_MODE) {
        console.log('📦 Creating COD order (amount:', amount, 'INR)');
        const mockOrder = {
            id: `order_cod_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            status: 'created'
        };
        
        return res.status(200).json({
            success: true,
            order: mockOrder,
            key_id: 'cod_mode',
            isCOD: true,
            message: 'Order will be placed as Cash on Delivery'
        });
    }

    // RAZORPAY MODE
    if (!razorpay) {
        res.status(500);
        throw new Error('Razorpay is not configured. Please check server logs.');
    }

    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1 // Auto capture payment
        };

        console.log('📝 Creating Razorpay order:', options);
        const order = await razorpay.orders.create(options);
        console.log('✅ Razorpay order created:', order.id);
        
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
        console.error('❌ Razorpay order creation error:', error);
        res.status(500);
        throw new Error('Failed to create Razorpay order: ' + error.message);
    }
});

// @desc    Verify Razorpay payment signature (or mock for COD)
// @route   POST /api/payment/verify
// @access  Private
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // TEMPORARY COD MODE
    if (TEMP_COD_MODE) {
        console.log('✅ COD order verification (mock)');
        return res.status(200).json({
            success: true,
            message: 'Order placed as Cash on Delivery',
            paymentId: razorpay_payment_id || `pay_cod_${Date.now()}`,
            orderId: razorpay_order_id || `order_cod_${Date.now()}`,
            isCOD: true
        });
    }

    // RAZORPAY MODE
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400);
        throw new Error('Missing payment verification parameters');
    }

    try {
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            console.log('✅ Payment verified successfully:', razorpay_payment_id);
            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id
            });
        } else {
            console.error('❌ Invalid payment signature');
            res.status(400);
            throw new Error('Invalid payment signature');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500);
        throw new Error('Payment verification failed');
    }
});

// @desc    Get Razorpay key (or COD indicator)
// @route   GET /api/payment/key
// @access  Public
export const getRazorpayKey = asyncHandler(async (req, res) => {
    res.status(200).json({
        key: TEMP_COD_MODE ? 'cod_mode' : process.env.RAZORPAY_KEY_ID,
        isCOD: TEMP_COD_MODE
    });
});
