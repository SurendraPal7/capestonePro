# 🚨 QUICK FIX: CORS Error on Vercel

## The Problem
Your frontend on Vercel (`https://capestone-pro.vercel.app`) is trying to connect to `http://localhost:5000`, which doesn't exist on the internet.

## The Solution (3 Steps)

### Step 1: Deploy Backend to Render.com (FREE)

1. Go to **[render.com](https://render.com)** → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add these environment variables:
   ```
   NODE_ENV=production
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
7. Wait 5-10 minutes for deployment
8. **Copy your backend URL** (e.g., `https://farmdirect-backend.onrender.com`)

---

### Step 2: Update Vercel Environment Variable

1. Go to **[vercel.com](https://vercel.com)** → Your project
2. **Settings** → **Environment Variables**
3. Add new variable:
   ```
   Name: VITE_API_URL
   Value: https://farmdirect-backend.onrender.com
   ```
   (Use YOUR backend URL from Step 1)

4. Click **"Save"**

---

### Step 3: Redeploy Frontend

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment → **"Redeploy"**
3. Wait 2-3 minutes

---

## ✅ Test It Works

1. Visit: `https://capestone-pro.vercel.app`
2. Open browser console (F12)
3. Check: No CORS errors ✅
4. Try: Login/Register should work ✅

---

## 🔧 Alternative: Quick Test with Existing Backend

If you already have a backend deployed somewhere, just:

1. Go to Vercel → Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL=https://your-existing-backend-url.com
   ```
3. Redeploy

---

## 📞 Need Help?

Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
