# 📧 Email Notification Setup Guide

This guide will help you set up email notifications for order events in your FarmDirect application.

## 🎯 What Emails Are Sent?

The system automatically sends emails for the following events:

1. **New Order Received** (to Farmer)
   - Sent when a buyer places an order
   - Contains order details and buyer information

2. **Order Confirmed** (to Buyer)
   - Sent when farmer confirms the order
   - Notifies buyer that order is being prepared

3. **Order Shipped** (to Buyer)
   - Sent when farmer marks order as shipped
   - Includes delivery address

4. **Order Delivered** (to Buyer)
   - Sent when order is successfully delivered
   - Thanks buyer and encourages repeat purchase

5. **Order Cancelled** (to Buyer)
   - Sent if order is cancelled
   - Provides cancellation information

## 🔧 Setup Instructions

### Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Enable **2-Step Verification** if not already enabled
4. After enabling 2-Step Verification, go back to Security
5. Scroll down to **App passwords** section
6. Click on **App passwords**
7. Select **Mail** as the app
8. Select **Other (Custom name)** as the device
9. Enter "FarmDirect" as the name
10. Click **Generate**
11. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 2: Update .env File

Open `server/.env` and update these values:

```env
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# Client URL (update if different)
CLIENT_URL=http://localhost:5173
```

**Example:**
```env
EMAIL_USER=farmdirect2024@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
CLIENT_URL=http://localhost:5173
```

### Step 3: Restart Server

After updating the `.env` file, restart your server:

```bash
cd server
npm start
```

## ✅ Testing Email Notifications

### Test 1: New Order Email (to Farmer)
1. Log in as a **buyer**
2. Add products to cart from a farmer
3. Place an order
4. **Farmer should receive an email** with order details

### Test 2: Order Status Emails (to Buyer)
1. Log in as a **farmer**
2. Go to Dashboard → Orders tab
3. Click on an order
4. Change status to **Confirmed**
5. **Buyer should receive confirmation email**
6. Change status to **Shipped**
7. **Buyer should receive shipping email**
8. Change status to **Delivered**
9. **Buyer should receive delivery email**

## 🔍 Troubleshooting

### Emails Not Sending?

1. **Check Console Logs**
   - Look for `✅ Email sent successfully` or `❌ Error sending email` in server terminal

2. **Verify Gmail Settings**
   - Make sure 2-Step Verification is enabled
   - Use App Password, not your regular Gmail password
   - Check if "Less secure app access" is NOT blocking (shouldn't be needed with App Password)

3. **Check .env File**
   - Make sure `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly
   - No extra spaces or quotes around values
   - App password should be 16 characters (spaces are optional)

4. **Test Email Configuration**
   - Create a test script to verify email setup:

```javascript
// server/testEmail.js
import dotenv from 'dotenv';
import { sendNewOrderEmail } from './utils/emailService.js';

dotenv.config();

const testEmail = async () => {
    console.log('Testing email configuration...');
    
    const result = await sendNewOrderEmail(
        'test-recipient@gmail.com', // Replace with your email
        'Test Farmer',
        'Test Buyer',
        {
            orderId: 'TEST123',
            totalPrice: 500,
            itemCount: 3,
            address: 'Test Address, Test City, Test State - 123456'
        }
    );
    
    console.log('Result:', result);
};

testEmail();
```

Run: `node testEmail.js`

### Common Errors

**Error: "Invalid login"**
- You're using regular password instead of App Password
- Generate a new App Password and use that

**Error: "Username and Password not accepted"**
- App Password might be incorrect
- Try generating a new App Password

**Error: "Email not configured"**
- `EMAIL_USER` or `EMAIL_PASSWORD` not set in `.env`
- Check if `.env` file exists and has correct values

## 🌐 Using Other Email Services

### Outlook/Hotmail
```env
# In emailService.js, change service to 'outlook'
service: 'outlook'

# In .env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo
```env
# In emailService.js, change service to 'yahoo'
service: 'yahoo'

# In .env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### Custom SMTP
```javascript
// In emailService.js
const transporter = nodemailer.createTransport({
    host: 'smtp.your-domain.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

## 📝 Notes

- Emails are sent asynchronously and won't block order operations
- If email fails, the order will still be created/updated successfully
- Email logs appear in the server console
- All emails use beautiful HTML templates with your brand colors
- Email links point to `CLIENT_URL` from `.env`

## 🎨 Customizing Email Templates

Email templates are in `server/utils/emailService.js`. You can customize:
- Colors and styling
- Email content and wording
- Logo and branding
- Button links

## 🚀 Production Deployment

For production:
1. Use a professional email service (SendGrid, AWS SES, Mailgun)
2. Update `CLIENT_URL` to your production domain
3. Consider rate limiting for email sending
4. Set up email delivery monitoring

---

**Need Help?** Check the server console logs for detailed error messages!
