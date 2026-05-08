// Quick test script to verify Gemini API setup
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const testChatbot = async () => {
    console.log('🤖 Testing Gemini AI Chatbot Setup...\n');

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ ERROR: GEMINI_API_KEY not found in .env file');
        console.log('\n📝 Please add your API key to server/.env:');
        console.log('   GEMINI_API_KEY=your_actual_key_here\n');
        console.log('🔗 Get your key from: https://makersuite.google.com/app/apikey\n');
        process.exit(1);
    }

    // Check if it's the demo key
    if (process.env.GEMINI_API_KEY.includes('Demo') || process.env.GEMINI_API_KEY.includes('Replace')) {
        console.error('❌ ERROR: You are using the demo API key');
        console.log('\n📝 Please replace it with your actual API key from Google AI Studio');
        console.log('🔗 Get your key from: https://makersuite.google.com/app/apikey\n');
        process.exit(1);
    }

    console.log('✅ API key found in .env file');
    console.log('🔄 Testing connection to Gemini AI...\n');

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const testPrompt = 'Hello! Can you briefly introduce yourself as a farming assistant?';
        
        console.log('📤 Sending test message to AI...');
        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ SUCCESS! Gemini AI is working correctly!\n');
        console.log('📥 AI Response:');
        console.log('─'.repeat(60));
        console.log(text);
        console.log('─'.repeat(60));
        console.log('\n🎉 Your chatbot is ready to use!');
        console.log('👨‍🌾 Log in as a farmer to see the chatbot button\n');

    } catch (error) {
        console.error('\n❌ ERROR: Failed to connect to Gemini AI');
        console.error('Error details:', error.message);
        
        if (error.message.includes('API key')) {
            console.log('\n💡 Possible issues:');
            console.log('   1. Invalid API key');
            console.log('   2. API key not activated');
            console.log('   3. Network connection issue');
            console.log('\n🔗 Verify your key at: https://makersuite.google.com/app/apikey\n');
        }
        
        process.exit(1);
    }
};

testChatbot();
