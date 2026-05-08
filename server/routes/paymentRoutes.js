import express from 'express';
import { 
    createRazorpayOrder, 
    verifyRazorpayPayment,
    getRazorpayKey 
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get Razorpay key
router.get('/key', getRazorpayKey);

// Protected routes
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);

export default router;
