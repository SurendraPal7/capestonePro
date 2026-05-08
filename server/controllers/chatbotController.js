import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for the farming assistant
const SYSTEM_PROMPT = `You are an expert agricultural advisor specializing in organic farming practices. Your role is to help farmers with:

1. Organic farming strategies and best practices
2. Crop selection based on season, climate, and soil conditions
3. Natural pest control methods
4. Soil health and composting techniques
5. Crop rotation and companion planting
6. Organic certification requirements
7. Market trends for organic produce
8. Sustainable farming techniques

Provide practical, actionable advice that farmers can implement. Be concise but thorough. Always prioritize organic and sustainable methods. If asked about chemical pesticides or synthetic fertilizers, suggest organic alternatives.

Keep responses focused on farming and agriculture. If asked about unrelated topics, politely redirect to farming-related questions.`;

// Helper function to get the model
const getModel = () => {
    try {
        // Try gemini-1.5-flash first (newer, faster)
        return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (error) {
        // Fallback to gemini-pro
        return genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
};

// @desc    Chat with AI farming assistant
// @route   POST /api/chatbot/chat
// @access  Private (Farmers only)
export const chatWithBot = async (req, res) => {
    console.log('📥 Chatbot request received');
    console.log('User:', req.user?.email, 'Role:', req.user?.role);
    console.log('Request body:', req.body);
    
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim() === '') {
            console.log('❌ Empty message');
            return res.status(400).json({ message: 'Message is required' });
        }

        // Check if user is a farmer
        if (req.user.role !== 'farmer') {
            console.log('❌ User is not a farmer');
            return res.status(403).json({ message: 'This feature is only available for farmers' });
        }

        console.log('✅ User is farmer, processing message...');

        // Check if API key is valid
        if (!process.env.GEMINI_API_KEY || 
            process.env.GEMINI_API_KEY.includes('Demo') || 
            process.env.GEMINI_API_KEY.includes('Replace')) {
            
            // Return mock response if no valid API key
            console.log('⚠️ Using mock response - No valid Gemini API key configured');
            
            const mockResponses = {
                'winter': 'For winter organic farming, I recommend crops like spinach, kale, carrots, and winter wheat. These crops are cold-hardy and thrive in cooler temperatures. Make sure to use mulch to protect the soil and maintain moisture levels.',
                'soil': 'To improve soil health naturally, focus on: 1) Adding organic compost regularly, 2) Practicing crop rotation, 3) Using cover crops like clover or rye, 4) Avoiding chemical fertilizers, and 5) Maintaining proper pH levels through natural amendments.',
                'pest': 'Effective organic pest control methods include: 1) Companion planting (marigolds deter many pests), 2) Neem oil spray, 3) Introducing beneficial insects like ladybugs, 4) Using diatomaceous earth, and 5) Regular crop inspection and manual removal.',
                'compost': 'To start composting: 1) Choose a location with good drainage, 2) Layer green materials (kitchen scraps, grass) with brown materials (leaves, straw), 3) Keep it moist but not wet, 4) Turn it weekly, 5) In 2-3 months, you\'ll have rich compost for your farm.',
                'rotation': 'Crop rotation is the practice of growing different crops in the same area across seasons. It\'s important because it: 1) Prevents soil depletion, 2) Reduces pest and disease buildup, 3) Improves soil structure, and 4) Increases crop yields naturally.',
                'default': 'As an organic farming expert, I can help you with crop selection, soil health, pest control, composting, and sustainable farming practices. What specific aspect of organic farming would you like to know more about?'
            };

            // Find matching response
            const lowerMessage = message.toLowerCase();
            let response = mockResponses.default;
            
            for (const [key, value] of Object.entries(mockResponses)) {
                if (lowerMessage.includes(key)) {
                    response = value;
                    break;
                }
            }

            return res.json({
                success: true,
                message: `🤖 [DEMO MODE] ${response}\n\n⚠️ Note: This is a demo response. To get real AI-powered advice, please add a valid Gemini API key to your .env file. Get your free key at: https://makersuite.google.com/app/apikey`,
                timestamp: new Date().toISOString()
            });
        }

        // Initialize the model with real API key
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        // Build conversation context
        let conversationContext = SYSTEM_PROMPT + '\n\n';
        
        // Add conversation history (last 5 messages for context)
        const recentHistory = conversationHistory.slice(-5);
        recentHistory.forEach(msg => {
            conversationContext += `${msg.role === 'user' ? 'Farmer' : 'Assistant'}: ${msg.content}\n`;
        });
        
        conversationContext += `Farmer: ${message}\nAssistant:`;

        // Generate response
        console.log('🤖 Calling Gemini API...');
        const result = await model.generateContent(conversationContext);
        console.log('✅ Gemini API responded');
        
        const response = result.response;
        const botReply = response.text();
        
        console.log('📤 Sending response to client');

        res.json({
            success: true,
            message: botReply,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Chatbot error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle specific API errors
        if (error.message?.includes('API key')) {
            return res.status(500).json({ 
                message: 'AI service configuration error. Please add a valid Gemini API key to your .env file. Get your free key at: https://makersuite.google.com/app/apikey',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            message: 'Failed to get response from AI assistant. Please try again.',
            error: error.message
        });
    }
};

// @desc    Get suggested questions for farmers
// @route   GET /api/chatbot/suggestions
// @access  Private (Farmers only)
export const getSuggestions = async (req, res) => {
    try {
        const suggestions = [
            "What crops are best for organic farming in winter?",
            "How can I improve my soil health naturally?",
            "What are effective organic pest control methods?",
            "How do I start composting on my farm?",
            "What is crop rotation and why is it important?",
            "How can I get organic certification for my farm?",
            "What are the best companion plants for tomatoes?",
            "How do I deal with weeds without chemicals?"
        ];

        res.json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('Error getting suggestions:', error);
        res.status(500).json({ message: 'Failed to get suggestions' });
    }
};
