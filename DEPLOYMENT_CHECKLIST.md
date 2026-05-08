# ✅ Deployment Checklist

Use this checklist to deploy your FarmDirect application and fix the CORS error.

---

## 🚀 Backend Deployment (Render.com)

### Step 1: Create Account
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up or login with GitHub

### Step 2: Create Web Service
- [ ] Click **"New +"** button
- [ ] Select **"Web Service"**
- [ ] Connect your GitHub repository

### Step 3: Configure Service
- [ ] **Name**: `farmdirect-backend`
- [ ] **Root Directory**: `server`
- [ ] **Build Command**: `npm install`
- [ ] **Start Command**: `npm start`
- [ ] **Instance Type**: `Free`

### Step 4: Add Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `MONGO_URI` = (your MongoDB connection string)
- [ ] `JWT_SECRET` = `thisisasecretkey`
- [ ] `GEMINI_API_KEY` = (your key)
- [ ] `EMAIL_USER` = `onestopfarmer@gmail.com`
- [ ] `EMAIL_PASSWORD` = (your app password)
- [ ] `CLIENT_URL` = `https://capestone-pro.vercel.app`
- [ ] `RAZORPAY_KEY_ID` = (your key)
- [ ] `RAZORPAY_KEY_SECRET` = (your secret)

### Step 5: Deploy
- [ ] Click **"Create Web Service"**
- [ ] Wait 5-10 minutes
- [ ] **Copy your backend URL**

---

## 🌐 Frontend Configuration (Vercel)

### Step 1: Add Environment Variable
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Settings → Environment Variables
- [ ] Add: `VITE_API_URL` = Your backend URL

### Step 2: Redeploy
- [ ] Deployments → "..." → "Redeploy"
- [ ] Wait 2-3 minutes

---

## 🧪 Testing

- [ ] Backend URL works in browser
- [ ] Frontend loads without CORS errors
- [ ] Login/Register works
- [ ] Products load correctly
- [ ] All features functional

---

**See ENVIRONMENT_VARIABLES.md for complete variable list**
