// Script to list all available Gemini models for your API key
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const listModels = async () => {
    console.log('🔍 Listing available Gemini models for your API key...\n');

    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ ERROR: GEMINI_API_KEY not found in .env file');
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try to list models using the API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Available models:\n');
        console.log('─'.repeat(80));
        
        if (data.models && data.models.length > 0) {
            data.models.forEach(model => {
                console.log(`📦 Model: ${model.name}`);
                console.log(`   Display Name: ${model.displayName || 'N/A'}`);
                console.log(`   Description: ${model.description || 'N/A'}`);
                console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('─'.repeat(80));
            });
            
            // Find models that support generateContent
            const contentModels = data.models.filter(m => 
                m.supportedGenerationMethods?.includes('generateContent')
            );
            
            if (contentModels.length > 0) {
                console.log('\n✨ Recommended models for chatbot (support generateContent):');
                contentModels.forEach(m => {
                    // Extract just the model name without the "models/" prefix
                    const modelName = m.name.replace('models/', '');
                    console.log(`   • ${modelName}`);
                });
            }
        } else {
            console.log('⚠️ No models found or API key may not have access');
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        
        if (error.message.includes('403') || error.message.includes('401')) {
            console.log('\n💡 Your API key may not be valid or activated.');
            console.log('🔗 Please verify at: https://aistudio.google.com/apikey');
        }
    }
};

listModels();
