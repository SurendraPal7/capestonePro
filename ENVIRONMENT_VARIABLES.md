# 🔐 Environment Variables Reference

## Backend Environment Variables (Render/Railway/Vercel)

Copy these **EXACTLY** when deploying your backend:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://harry979268_db_user:O3IilgLsvc2xIDST@cluster0.f1zctf8.mongodb.net/agridirect?appName=Cluster0
JWT_SECRET=thisisasecretkey
GEMINI_API_KEY=AIzaSyBeHLLD5p8ZlHREvvSyYXXWGb_RmmAg18Q
EMAIL_USER=onestopfarmer@gmail.com
EMAIL_PASSWORD=yuti rnlo hwkm awpn
CLIENT_URL=https://capestone-pro.vercel.app
RAZORPAY_KEY_ID=rzp_test_SmrzVAJCzG7QUL
RAZORPAY_KEY_SECRET=L9LoYTzEZn5dnC5BtRNtiuSKt
```

### How to Add on Render.com:
1. During setup, click **"Advanced"**
2. Click **"Add Environment Variable"**
3. Add each variable one by one:
   - **Key**: `NODE_ENV`
   - **Value**: `production`
4. Repeat for all variables above

### How to Add on Railway.app:
1. After creating project, go to **"Variables"** tab
2. Click **"New Variable"**
3. Add each variable
4. Click **"Deploy"**

### How to Add on Vercel:
1. Go to project **Settings** → **Environment Variables**
2. Add each variable
3. Select **"Production"** environment
4. Click **"Save"**

---

## Frontend Environment Variables (Vercel)

Add this **ONE** variable to your Vercel frontend project:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

**IMPORTANT**: Replace `your-backend-url.onrender.com` with your actual backend URL from Step 1!

### How to Add on Vercel:
1. Go to your frontend project on Vercel
2. **Settings** → **Environment Variables**
3. Click **"Add"**
4. **Name**: `VITE_API_URL`
5. **Value**: Your backend URL (e.g., `https://farmdirect-backend.onrender.com`)
6. Select **"Production"**, **"Preview"**, and **"Development"**
7. Click **"Save"**
8. Go to **Deployments** → Click "..." → **"Redeploy"**

---

## Local Development Environment Variables

### Backend (server/.env)
Already configured in `server/.env`:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/farmer-marketplace
JWT_SECRET=thisisasecretkey
GEMINI_API_KEY=AIzaSyBeHLLD5p8ZlHREvvSyYXXWGb_RmmAg18Q
EMAIL_USER=onestopfarmer@gmail.com
EMAIL_PASSWORD=yuti rnlo hwkm awpn
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_SmrzVAJCzG7QUL
RAZORPAY_KEY_SECRET=L9LoYTzEZn5dnC5BtRNtiuSKt
```

### Frontend (client/.env)
Already created:
```
VITE_API_URL=http://localhost:5000
```

---

## Variable Explanations

### NODE_ENV
- **Development**: `development`
- **Production**: `production`
- Controls error messages, logging, and optimizations

### PORT
- Port number for backend server
- Default: `5000`
- Render/Railway may override this automatically

### MONGO_URI
- MongoDB connection string
- **Production**: Use MongoDB Atlas (cloud)
- **Development**: Can use local MongoDB

### JWT_SECRET
- Secret key for JWT token generation
- **IMPORTANT**: Change this to a random string in production
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### GEMINI_API_KEY
- Google Gemini AI API key for chatbot
- Get from: https://makersuite.google.com/app/apikey

### EMAIL_USER & EMAIL_PASSWORD
- Gmail account for sending emails
- **EMAIL_PASSWORD**: Use App Password, not regular password
- Generate: https://myaccount.google.com/apppasswords

### CLIENT_URL
- Frontend URL for email links
- **Production**: `https://capestone-pro.vercel.app`
- **Development**: `http://localhost:5173`

### RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
- Payment gateway credentials
- **CURRENT KEYS ARE INVALID** - Get real keys from:
  - https://dashboard.razorpay.com
  - Settings → API Keys → Generate Test Keys

### VITE_API_URL (Frontend only)
- Backend API URL
- **Production**: Your deployed backend URL
- **Development**: `http://localhost:5000`
- **MUST start with `VITE_`** for Vite to expose it

---

## Security Best Practices

### ✅ DO:
- Use environment variables for all secrets
- Use different values for development and production
- Rotate secrets regularly
- Use strong, random JWT secrets
- Use App Passwords for Gmail

### ❌ DON'T:
- Commit `.env` files to Git (already in `.gitignore`)
- Share secrets publicly
- Use the same secrets across projects
- Hardcode secrets in code

---

## Troubleshooting

### "Environment variable not found"
- Make sure variable name is spelled correctly
- For frontend variables, must start with `VITE_`
- Redeploy after adding variables

### "Invalid MongoDB connection"
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify username and password are correct
- Check if IP whitelist is configured

### "Email not sending"
- Use Gmail App Password, not regular password
- Enable "Less secure app access" if needed
- Check EMAIL_USER and EMAIL_PASSWORD are correct

### "Razorpay authentication failed"
- Current keys are invalid
- Get new keys from Razorpay dashboard
- Make sure you're using Test keys for testing

---

## Quick Copy-Paste

### For Render.com Backend:
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://harry979268_db_user:O3IilgLsvc2xIDST@cluster0.f1zctf8.mongodb.net/agridirect?appName=Cluster0
JWT_SECRET=thisisasecretkey
GEMINI_API_KEY=AIzaSyBeHLLD5p8ZlHREvvSyYXXWGb_RmmAg18Q
EMAIL_USER=onestopfarmer@gmail.com
EMAIL_PASSWORD=yuti rnlo hwkm awpn
CLIENT_URL=https://capestone-pro.vercel.app
RAZORPAY_KEY_ID=rzp_test_SmrzVAJCzG7QUL
RAZORPAY_KEY_SECRET=L9LoYTzEZn5dnC5BtRNtiuSKt
```

### For Vercel Frontend:
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```
(Replace with your actual backend URL!)

---

**Last Updated**: May 9, 2026  
**Note**: Update Razorpay keys with valid ones from dashboard.razorpay.com
