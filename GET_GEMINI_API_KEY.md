# How to Get Your Gemini API Key

## Quick Steps:

### 1. Visit Google AI Studio
🔗 **Link**: https://makersuite.google.com/app/apikey

### 2. Sign In
- Use your Google account to sign in
- If you don't have one, create a free Google account

### 3. Create API Key
- Click the **"Create API Key"** button
- Select **"Create API key in new project"** (or use existing project)
- Your API key will be generated instantly

### 4. Copy the API Key
- Copy the entire API key (it looks like: `AIzaSy...`)
- Keep it secure - don't share it publicly

### 5. Add to Your .env File
Open `server/.env` and replace the placeholder:

**Before:**
```
GEMINI_API_KEY=AIzaSyDemoKey_Replace_With_Your_Actual_Key_From_Google_AI_Studio
```

**After:**
```
GEMINI_API_KEY=AIzaSyC_your_actual_key_here_1234567890
```

### 6. Restart Your Server
```bash
cd server
npm start
```

---

## Important Notes:

✅ **Free Tier**: Gemini API has a generous free tier
- 60 requests per minute
- Perfect for development and testing

✅ **No Credit Card Required**: You can start using it immediately

✅ **Security**: 
- Never commit your API key to Git
- The `.env` file is already in `.gitignore`
- Keep your key private

---

## Testing the Chatbot:

1. **Start the server**: `npm start` in server directory
2. **Start the client**: `npm run dev` in client directory
3. **Log in as a farmer**
4. **Look for the green chatbot button** in the bottom-right corner
5. **Click it and start chatting!**

---

## Troubleshooting:

### "API key not valid" error
- Make sure you copied the entire key
- Check for extra spaces before/after the key
- Verify the key is active in Google AI Studio

### Chatbot button not showing
- Make sure you're logged in as a **farmer** (not buyer/admin)
- Check browser console for errors
- Verify the server is running

### Slow responses
- Free tier may have rate limits
- Try again after a few seconds
- Consider upgrading for production use

---

## Alternative: Use Demo Mode (Optional)

If you want to test the UI without an API key, you can temporarily modify the chatbot to return mock responses. But for real AI-powered advice, you'll need the actual API key.

---

## Need Help?

- **Google AI Studio Docs**: https://ai.google.dev/tutorials/setup
- **Gemini API Docs**: https://ai.google.dev/docs
- **Support**: Check the Google AI Studio help center

---

**Ready to get your API key? Visit: https://makersuite.google.com/app/apikey** 🚀
