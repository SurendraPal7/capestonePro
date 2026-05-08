# 🚀 Deployment Guide - FarmDirect Application

## 🔴 CRITICAL ISSUE IDENTIFIED

Your frontend is deployed on Vercel (`https://capestone-pro.vercel.app`) but it's trying to connect to `http://localhost:5000`, which **WILL NOT WORK** in production.

### The Problem:
- ❌ Frontend (Vercel): `https://capestone-pro.vercel.app`
- ❌ Backend: `http://localhost:5000` (only accessible on your computer)
- ❌ Result: CORS errors and "ERR_FAILED" because localhost is not accessible from the internet

---

## ✅ SOLUTION: Deploy Your Backend

You need to deploy your backend to a hosting service. Here are the best options:

### Option 1: Render.com (Recommended - Free Tier Available)

#### Step 1: Prepare Backend for Deployment

1. **Create `server/package.json` start script** (already done):
   ```json
   "scripts": {
     "start": "node index.js",
     "dev": "nodemon index.js"
   }
   ```

2. **Ensure all environment variables are in `.env.example`** (already done)

#### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `farmdirect-backend` (or any name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
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

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://farmdirect-backend.onrender.com`)

---

### Option 2: Railway.app (Alternative)

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Configure root directory: `server`
5. Add all environment variables
6. Deploy and copy the URL

---

### Option 3: Vercel (Backend + Frontend on same platform)

1. Create `vercel.json` in server folder:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "index.js"
       }
     ]
   }
   ```

2. Deploy via Vercel CLI:
   ```bash
   cd server
   vercel
   ```

3. Add environment variables in Vercel dashboard

---

## 🔧 Configure Frontend to Use Deployed Backend

### Step 1: Update Vercel Environment Variables

1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings** → **Environment Variables**
2. Add this variable:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.onrender.com
   ```
   (Replace with your actual backend URL from Render/Railway/Vercel)

3. Click **"Save"**

### Step 2: Redeploy Frontend

After adding the environment variable, redeploy:

**Option A: Automatic (if connected to GitHub)**
- Just push any change to your repo
- Or go to Vercel → Deployments → Click "..." → "Redeploy"

**Option B: Manual**
```bash
cd client
vercel --prod
```

---

## 🧪 Testing After Deployment

### 1. Test Backend Directly

Open your browser and visit:
```
https://your-backend-url.onrender.com/api/auth/stats
```

You should see JSON response like:
```json
{
  "activeFarmers": { "count": 5, "display": "5+" },
  "happyBuyers": { "count": 10, "display": "10+" },
  "ordersDelivered": { "count": 0, "display": "0+" }
}
```

### 2. Test Frontend

Visit: `https://capestone-pro.vercel.app`

Open browser console (F12) and check:
- ✅ No CORS errors
- ✅ No "localhost" errors
- ✅ API calls should work

---

## 📝 Local Development Setup

For local development, use:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The frontend will automatically use `http://localhost:5000` for local development.

---

## 🔒 Security Notes

### 1. Update CORS Origins

After deploying backend, update `server/index.js`:

```javascript
const corsOptions = {
    origin: [
        'http://localhost:5173',           // Local development
        'https://capestone-pro.vercel.app', // Your Vercel frontend
        'https://your-backend-url.onrender.com' // Your backend (for testing)
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
```

### 2. Use Environment Variables

Never hardcode URLs. Always use:
- **Frontend**: `import.meta.env.VITE_API_URL`
- **Backend**: `process.env.CLIENT_URL`

### 3. Update Razorpay Keys

Your current Razorpay keys are **INVALID**. Get correct keys from:
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Settings → API Keys → Generate Test Keys
3. Update in backend environment variables

---

## 🎯 Quick Checklist

- [ ] Backend deployed to Render/Railway/Vercel
- [ ] Backend URL copied (e.g., `https://farmdirect-backend.onrender.com`)
- [ ] All environment variables added to backend hosting
- [ ] `VITE_API_URL` added to Vercel frontend environment variables
- [ ] Frontend redeployed on Vercel
- [ ] CORS origins updated in `server/index.js`
- [ ] Tested backend API directly in browser
- [ ] Tested frontend - no CORS errors
- [ ] Login/Register working
- [ ] Products loading correctly

---

## 🆘 Troubleshooting

### Issue: Still getting CORS errors

**Solution:**
1. Check backend logs on Render/Railway
2. Verify CORS origins include your Vercel URL
3. Make sure `CLIENT_URL` environment variable is set

### Issue: "Network Error" or "ERR_FAILED"

**Solution:**
1. Verify backend is running (visit backend URL in browser)
2. Check `VITE_API_URL` is set correctly in Vercel
3. Redeploy frontend after adding environment variable

### Issue: 404 errors on API calls

**Solution:**
1. Make sure backend routes are working (test directly)
2. Check if `VITE_API_URL` includes `/api` or not
3. Current setup: `VITE_API_URL` should be just the base URL (e.g., `https://backend.onrender.com`)
4. API calls add `/api/...` automatically

### Issue: Database connection failed

**Solution:**
1. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Verify `MONGO_URI` is correct in backend environment variables
3. Check backend logs for specific error

---

## 📊 Architecture After Deployment

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel)                      │
│  https://capestone-pro.vercel.app       │
│                                         │
│  Environment Variable:                  │
│  VITE_API_URL = https://backend.com     │
└─────────────┬───────────────────────────┘
              │
              │ HTTP Requests
              │
              ▼
┌─────────────────────────────────────────┐
│  Backend (Render/Railway)               │
│  https://farmdirect-backend.onrender.com│
│                                         │
│  CORS: Allow capestone-pro.vercel.app   │
└─────────────┬───────────────────────────┘
              │
              │ Database Queries
              │
              ▼
┌─────────────────────────────────────────┐
│  MongoDB Atlas                          │
│  Cloud Database                         │
└─────────────────────────────────────────┘
```

---

## 🎉 Next Steps After Deployment

1. **Test all features**:
   - Registration (Buyer & Farmer)
   - Login
   - Product listing
   - Cart and checkout
   - Order management
   - Admin panel

2. **Monitor performance**:
   - Check Render/Railway logs
   - Monitor API response times
   - Watch for errors

3. **Update Razorpay keys** for real payments

4. **Add custom domain** (optional):
   - Frontend: Vercel supports custom domains
   - Backend: Render/Railway support custom domains

---

**Need Help?** Check the logs:
- **Backend logs**: Render/Railway dashboard → Logs tab
- **Frontend logs**: Browser console (F12)
- **Database**: MongoDB Atlas → Metrics

---

**Last Updated:** May 9, 2026  
**Status:** ⚠️ Backend needs deployment to fix CORS errors
