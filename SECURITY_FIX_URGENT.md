# 🚨 URGENT: Security Fix - Exposed .env File

## ⚠️ CRITICAL ISSUE

You accidentally pushed `server/.env` file to GitHub with sensitive credentials:
- ✅ MongoDB credentials
- ✅ JWT secret
- ✅ Gemini API key
- ✅ Email password
- ✅ Razorpay keys

**These are now PUBLIC and must be changed immediately!**

---

## 🔥 STEP 1: Remove .env from Git History (IMMEDIATE)

### Option A: Remove from Git (Recommended)

Run these commands in your terminal:

```bash
# Navigate to your project root
cd /path/to/your/project

# Remove .env from Git tracking
git rm --cached server/.env

# Commit the removal
git commit -m "Remove .env file from repository"

# Push to GitHub
git push origin main
```

### Option B: Remove from Git History Completely (More Secure)

If the file was already pushed in previous commits:

```bash
# Remove file from all Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch server/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to GitHub (WARNING: This rewrites history)
git push origin --force --all
```

**⚠️ WARNING**: Option B rewrites Git history. Only use if you're the only one working on this repo.

---

## 🔐 STEP 2: Change ALL Credentials (CRITICAL)

### 1. MongoDB Password
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Database Access → Edit user `harry979268_db_user`
3. Click "Edit Password" → Generate new password
4. Update `MONGO_URI` in your `.env` file
5. **DO NOT PUSH** the new `.env` file

### 2. JWT Secret
Generate a new random secret:

```bash
# Run this command to generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and update `JWT_SECRET` in `.env`

### 3. Email App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Delete the old app password
3. Generate a new one
4. Update `EMAIL_PASSWORD` in `.env`

### 4. Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Delete the exposed key
3. Create a new API key
4. Update `GEMINI_API_KEY` in `.env`

### 5. Razorpay Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → API Keys
3. Regenerate keys
4. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`

---

## ✅ STEP 3: Verify .env is Ignored

Check that `.env` is in `.gitignore`:

```bash
# Check if .env is in .gitignore
cat .gitignore | grep .env
cat server/.gitignore | grep .env
```

Should see:
```
.env
.env.*
```

---

## 🔒 STEP 4: Verify .env is Not Tracked

```bash
# Check Git status
git status

# .env should NOT appear in the list
# If it does, run: git rm --cached server/.env
```

---

## 📝 STEP 5: Update .env with New Credentials

Edit `server/.env` with your NEW credentials:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://harry979268_db_user:NEW_PASSWORD_HERE@cluster0.f1zctf8.mongodb.net/agridirect?appName=Cluster0
JWT_SECRET=NEW_RANDOM_SECRET_HERE
GEMINI_API_KEY=NEW_API_KEY_HERE
EMAIL_USER=onestopfarmer@gmail.com
EMAIL_PASSWORD=NEW_APP_PASSWORD_HERE
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=NEW_KEY_ID_HERE
RAZORPAY_KEY_SECRET=NEW_KEY_SECRET_HERE
```

**IMPORTANT**: Never commit this file!

---

## 🧪 STEP 6: Test Everything Still Works

```bash
# Start backend
cd server
npm run dev

# In another terminal, start frontend
cd client
npm run dev
```

Test:
- [ ] Login works
- [ ] Database connection works
- [ ] Email sending works
- [ ] Chatbot works
- [ ] Payment gateway works

---

## 🛡️ STEP 7: Prevent Future Accidents

### Add Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Check if .env files are being committed
if git diff --cached --name-only | grep -E '\.env$'; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "This file contains sensitive credentials."
    echo "Please remove it from the commit."
    exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Use Environment Variable Checker

Install `dotenv-safe`:
```bash
cd server
npm install dotenv-safe
```

Update `server/index.js`:
```javascript
// Instead of: import dotenv from 'dotenv';
import dotenvSafe from 'dotenv-safe';

// Load with validation
dotenvSafe.config({
    example: '.env.example',
    allowEmptyValues: false
});
```

---

## 📋 Security Checklist

- [ ] Removed `server/.env` from Git tracking
- [ ] Changed MongoDB password
- [ ] Generated new JWT secret
- [ ] Regenerated email app password
- [ ] Created new Gemini API key
- [ ] Regenerated Razorpay keys
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested application with new credentials
- [ ] Added pre-commit hook
- [ ] Documented new credentials securely (NOT in Git)

---

## 🚀 For Deployment

When deploying to Render/Railway/Vercel:

1. **DO NOT** use the exposed credentials
2. **USE** the new credentials you just generated
3. Add them as environment variables in the hosting platform
4. Never commit `.env` files

---

## 📞 If Credentials Were Exposed for Long Time

If the credentials were public for more than a few hours:

1. **Monitor MongoDB Atlas** for unusual activity
2. **Check Razorpay Dashboard** for unauthorized transactions
3. **Review email logs** for suspicious activity
4. **Consider rotating ALL credentials** again in 24 hours
5. **Enable 2FA** on all services

---

## 🎓 Best Practices Going Forward

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use `.env.example` for documentation (without real values)
- Use environment variables in hosting platforms
- Rotate credentials regularly
- Use different credentials for dev/staging/production

### ❌ DON'T:
- Commit `.env` files
- Share credentials in chat/email
- Use the same credentials across projects
- Hardcode secrets in code
- Push to public repositories without checking

---

## 🆘 Quick Commands Reference

```bash
# Remove .env from Git
git rm --cached server/.env
git commit -m "Remove .env from repository"
git push

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check what's being tracked by Git
git ls-files | grep .env

# Check Git status
git status
```

---

## ✅ Verification

After completing all steps:

1. Visit your GitHub repository
2. Navigate to `server/` folder
3. `.env` file should **NOT** be visible
4. Only `.env.example` should be there

If you still see `.env`:
- You need to remove it from Git history (Option B above)
- Or delete the repository and create a new one

---

**IMPORTANT**: Complete these steps IMMEDIATELY to secure your application!

**Time Required**: 15-20 minutes  
**Priority**: 🔴 CRITICAL  
**Status**: ⚠️ ACTION REQUIRED NOW
