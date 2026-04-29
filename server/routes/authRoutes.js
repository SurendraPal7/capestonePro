import express from 'express';
const router = express.Router();
import { registerUser, loginUser, getMe, getFarmers, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.get('/farmers', getFarmers);

export default router;
