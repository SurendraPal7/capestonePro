import express from 'express';
import { chatWithBot, getSuggestions } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Chat with AI assistant
router.post('/chat', chatWithBot);

// Get suggested questions
router.get('/suggestions', getSuggestions);

export default router;
