# AI Farming Chatbot Setup Instructions

## 1. Install Required Package

Navigate to the server directory and install the Google Generative AI package:

```bash
cd server
npm install @google/generative-ai
```

## 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## 3. Add API Key to Environment Variables

Open `server/.env` file and add:

```
GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied.

## 4. Restart the Server

```bash
cd server
npm start
```

## 5. Test the Chatbot

1. Log in as a farmer
2. You'll see a floating green chatbot button in the bottom-right corner
3. Click it to open the chat window
4. Try asking questions like:
   - "What crops are best for organic farming in winter?"
   - "How can I improve my soil health naturally?"
   - "What are effective organic pest control methods?"

## Features

- **AI-Powered Responses**: Uses Google's Gemini AI for intelligent farming advice
- **Conversation History**: Maintains context across messages
- **Suggested Questions**: Quick-start questions for common farming topics
- **Farmer-Only Access**: Only visible to users with farmer role
- **Beautiful UI**: Modern chat interface with smooth animations
- **Real-time Responses**: Fast AI-generated responses

## Troubleshooting

### "API key not configured" error
- Make sure you added the GEMINI_API_KEY to your .env file
- Restart the server after adding the key

### Chatbot not visible
- Make sure you're logged in as a farmer (not buyer or admin)
- Check browser console for any errors

### Slow responses
- Gemini API is free but may have rate limits
- Consider upgrading to a paid plan for faster responses

## API Endpoints

- `POST /api/chatbot/chat` - Send message to chatbot
- `GET /api/chatbot/suggestions` - Get suggested questions

Both endpoints require authentication (farmer role).
