import express from 'express';
const router = express.Router();
import { registerUser, loginUser, getMe, getFarmers, updateUserProfile, updateFarmerLocation, getCategoryStats, getPlatformStats } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.put('/location', protect, updateFarmerLocation);
router.get('/farmers', getFarmers);
router.get('/categories/stats', getCategoryStats);
router.get('/stats', getPlatformStats); // Public stats endpoint

export default router;
