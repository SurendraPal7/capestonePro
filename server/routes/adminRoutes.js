import express from 'express';
const router = express.Router();
import {
    getAdminStats,
    getAllFarmers,
    getPendingFarmers,
    getFarmerById,
    approveFarmer,
    rejectFarmer,
    getAllBuyers,
    getBuyerById,
    getAllOrders,
    getOrderById,
    getSystemAnalytics,
    updateUserStatus
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

// Apply admin protection to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard stats
router.get('/stats', getAdminStats);

// Farmer management
router.get('/farmers', getAllFarmers);
router.get('/farmers/pending', getPendingFarmers);
router.get('/farmers/:id', getFarmerById);
router.put('/farmers/:id/approve', approveFarmer);
router.put('/farmers/:id/reject', rejectFarmer);

// Buyer management
router.get('/buyers', getAllBuyers);
router.get('/buyers/:id', getBuyerById);

// Order tracking
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);

// Analytics
router.get('/analytics', getSystemAnalytics);

// User management
router.put('/users/:id/status', updateUserStatus);

export default router;