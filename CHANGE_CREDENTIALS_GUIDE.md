# 🔐 Quick Guide: Change All Credentials

## ⚡ Fast Track (15 minutes)

Follow these steps in order to secure your application.

---

## 1️⃣ MongoDB Password (5 min)

### Steps:
1. Open [MongoDB Atlas](https://cloud.mongodb.com)
2. Login to your account
3. Click **"Database Access"** in left sidebar
4. Find user: `harry979268_db_user`
5. Click **"Edit"** button
6. Click **"Edit Password"**
7. Click **"Autogenerate Secure Password"** OR enter your own
8. Click **"Copy"** to copy the password
9. Click **"Update User"**

### Update .env:
Open `server/.env` and update this line:
```env
MONGO_URI=mongodb+srv://harry979268_db_user:PASTE_NEW_PASSWORD_HERE@cluster0.f1zctf8.mongodb.net/agridirect?appName=Cluster0
```

Replace `PASTE_NEW_PASSWORD_HERE` with your new password.

---

## 2️⃣ JWT Secret (1 min)

### Generate New Secret:
Open terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

You'll get something like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Update .env:
Open `server/.env` and update:
```env
JWT_SECRET=paste_the_generated_secret_here
```

---

## 3️⃣ Email App Password (3 min)

### Delete Old Password:
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Login with: `onestopfarmer@gmail.com`
3. Find the app password you created before
4. Click **"Delete"** or **"Remove"**

### Create New Password:
1. Click **"Select app"** → Choose **"Mail"**
2. Click **"Select device"** → Choose **"Other"**
3. Type: `FarmDirect Backend`
4. Click **"Generate"**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Update .env:
Open `server/.env` and update:
```env
EMAIL_PASSWORD=paste_new_password_here
```

**Note**: Remove spaces from the password!

---

## 4️⃣ Gemini API Key (2 min)

### Delete Old Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login with your Google account
3. Find key: `AIzaSyBeHLLD5p8ZlHREvvSyYXXWGb_RmmAg18Q`
4. Click **"Delete"** or trash icon

### Create New Key:
1. Click **"Create API Key"**
2. Select your project or create new one
3. Click **"Create API key in existing project"**
4. Copy the new key (starts with `AIzaSy...`)

### Update .env:
Open `server/.env` and update:
```env
GEMINI_API_KEY=paste_new_key_here
```

---

## 5️⃣ Razorpay Keys (3 min)

### Regenerate Keys:
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Login to your account
3. Click **"Settings"** (gear icon)
4. Click **"API Keys"**
5. Find your current keys
6. Click **"Regenerate Test Key"** (or "Regenerate Live Key" if using live)
7. Confirm regeneration
8. Copy both:
   - **Key ID** (starts with `rzp_test_...`)
   - **Key Secret** (click "Show" to reveal)

### Update .env:
Open `server/.env` and update:
```env
RAZORPAY_KEY_ID=paste_new_key_id_here
RAZORPAY_KEY_SECRET=paste_new_secret_here
```

---

## ✅ Verify Your .env File

Your `server/.env` should now look like this:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://harry979268_db_user:NEW_PASSWORD@cluster0.f1zctf8.mongodb.net/agridirect?appName=Cluster0
JWT_SECRET=new_random_64_character_hex_string
GEMINI_API_KEY=AIzaSy_new_key_here
EMAIL_USER=onestopfarmer@gmail.com
EMAIL_PASSWORD=new_16_char_password
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_new_key_id
RAZORPAY_KEY_SECRET=new_secret_here
```

---

## 🧪 Test Everything

### Start Backend:
```bash
cd server
npm run dev
```

You should see:
```
✅ Server running on port 5000
✅ MongoDB Connected
```

If you see errors:
- **MongoDB error**: Check MONGO_URI password
- **Other errors**: Check all credentials are correct

### Test Features:

1. **Test Database** (MongoDB + JWT):
   - Try to login or register
   - Should work without errors

2. **Test Chatbot** (Gemini API):
   - Open chatbot
   - Send a message
   - Should get AI response

3. **Test Email** (Email credentials):
   - Place a test order
   - Check if email is sent

4. **Test Payment** (Razorpay):
   - Try to checkout
   - Payment UI should open

---

## 🚫 Common Mistakes

### MongoDB:
- ❌ Forgot to copy the password
- ❌ Password has special characters that need encoding
- ✅ Use the exact password from MongoDB Atlas

### JWT Secret:
- ❌ Used a short or simple string
- ✅ Use the generated 64-character hex string

### Email:
- ❌ Used regular Gmail password instead of App Password
- ❌ Kept spaces in the password
- ✅ Use App Password without spaces

### Gemini:
- ❌ Forgot to delete old key
- ✅ Delete old key and create new one

### Razorpay:
- ❌ Mixed up Key ID and Secret
- ✅ Key ID starts with `rzp_test_`

---

## 📋 Completion Checklist

- [ ] MongoDB password changed and tested
- [ ] JWT secret generated and updated
- [ ] Email app password regenerated
- [ ] Gemini API key recreated
- [ ] Razorpay keys regenerated
- [ ] Backend starts without errors
- [ ] Login/Register works
- [ ] Chatbot works
- [ ] Email sending works
- [ ] Payment UI opens

---

## 🎉 After Completion

Once all credentials are changed and tested:

1. ✅ Your application is secure
2. ✅ Old credentials are useless
3. ✅ Safe to deploy
4. ✅ Continue with deployment (see DEPLOYMENT_GUIDE.md)

---

## 🆘 Troubleshooting

### "MongoDB connection failed"
- Check password has no typos
- Check password is URL-encoded if it has special characters
- Verify user exists in MongoDB Atlas

### "JWT error"
- Make sure JWT_SECRET is a long random string
- No spaces or special characters

### "Email not sending"
- Verify you're using App Password, not regular password
- Check EMAIL_USER is correct
- Remove spaces from EMAIL_PASSWORD

### "Gemini API error"
- Verify API key is correct
- Check if API is enabled in Google Cloud Console
- Make sure you deleted the old key

### "Razorpay authentication failed"
- Verify both Key ID and Secret are correct
- Make sure you're using Test keys for testing
- Check if keys are from the correct account

---

**Time to Complete**: 15 minutes  
**Difficulty**: Easy  
**Priority**: 🔴 CRITICAL - Do this before deploying!
