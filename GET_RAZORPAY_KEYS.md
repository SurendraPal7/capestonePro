# How to Get Your Razorpay Keys

## The Issue

You provided: `rzp_test_SmrzVAJCzG7QULL9LoYTzEZn5dnC5BtRNtiuSKt`

This appears to be a single string, but Razorpay requires **TWO separate keys**:
1. **Key ID** (public key)
2. **Key Secret** (private key)

## Step-by-Step Guide

### 1. Login to Razorpay Dashboard
Go to: https://dashboard.razorpay.com/

### 2. Navigate to API Keys
- Click on **Settings** (gear icon) in the left sidebar
- Click on **API Keys** under "Configuration"

### 3. You Should See TWO Separate Values

**Example of what you should see:**

```
Test Mode Keys:

Key ID: rzp_test_1A2B3C4D5E6F7G
        ↑ This is your RAZORPAY_KEY_ID

Key Secret: [Show] (click to reveal)
           ↑ Click "Show" to see the secret

After clicking Show:
Key Secret: abcdefghijklmnopqrstuvwxyz123456
           ↑ This is your RAZORPAY_KEY_SECRET
```

### 4. Copy BOTH Keys Separately

You need to copy:
- **Key ID** - Usually starts with `rzp_test_` (for test mode)
- **Key Secret** - A longer alphanumeric string (click "Show" to reveal it)

### 5. Update Your .env File

Open `server/.env` and update these lines:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Real Example:**
```env
RAZORPAY_KEY_ID=rzp_test_1A2B3C4D5E6F7G
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Common Mistakes

❌ **Wrong:** Using one combined string
```env
RAZORPAY_KEY_ID=rzp_test_SmrzVAJCzG7QULL9LoYTzEZn5dnC5BtRNtiuSKt
```

✅ **Correct:** Using two separate keys
```env
RAZORPAY_KEY_ID=rzp_test_SmrzVAJCzG7QUL
RAZORPAY_KEY_SECRET=L9LoYTzEZn5dnC5BtRNtiuSKt
```

## If You Don't Have a Razorpay Account

1. Sign up at: https://razorpay.com/
2. Complete the registration
3. Go to Test Mode (toggle in top-right)
4. Follow steps above to get your keys

## After Updating Keys

1. **Save the .env file**
2. **Restart your server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then start again:
   npm run dev
   ```
3. **Check server logs** - You should see:
   ```
   ✅ Razorpay instance initialized successfully
   ```

## Test the Configuration

Run this command to verify:
```bash
cd server
node testRazorpay.js
```

If successful, you'll see:
```
✅ Razorpay instance created successfully
✅ Test order created successfully!
```

## Need Help?

If you're still having issues:
1. Take a screenshot of your Razorpay API Keys page (hide the secret!)
2. Check that you copied BOTH keys separately
3. Make sure there are no extra spaces in the .env file
4. Restart the server after updating .env

## Security Note

⚠️ **NEVER share your Key Secret publicly!**
- Keep it in .env file only
- Don't commit .env to git
- Don't share in screenshots or messages
