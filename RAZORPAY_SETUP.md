# Razorpay Payment Integration Setup

## Overview
This application now includes Razorpay payment gateway integration for secure online payments during order placement.

## Features Implemented
✅ Razorpay order creation on backend
✅ Secure payment verification using signature
✅ Razorpay checkout UI integration on frontend
✅ Payment status tracking in orders
✅ Automatic order creation after successful payment
✅ Email notifications to farmers after payment

## Setup Instructions

### 1. Razorpay Account Setup
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Complete KYC verification (for live mode)
3. Navigate to Settings → API Keys
4. Copy your **Key ID** and **Key Secret**

### 2. Environment Configuration
Add the following to your `server/.env` file:
```env
RAZORPAY_KEY_ID=rzp_test_SmrzVAJCzG7QUL
RAZORPAY_KEY_SECRET=L9LoYTzEZn5dnC5BtRNtiuSKt
```

**Note:** These are TEST mode credentials. For production, use LIVE mode keys.

### 3. Dependencies Installed
- **Backend:** `razorpay` npm package
- **Frontend:** Razorpay Checkout script loaded dynamically

## How It Works

### Payment Flow
1. **User adds items to cart** → Proceeds to checkout
2. **Frontend creates Razorpay order** → Calls `/api/payment/create-order`
3. **Backend creates order** → Returns order ID and amount
4. **Razorpay UI opens** → User enters payment details
5. **Payment processed** → Razorpay returns payment ID and signature
6. **Backend verifies payment** → Validates signature using secret key
7. **Order created** → Saved to database with payment info
8. **Email sent** → Farmer receives order notification

### API Endpoints

#### 1. Create Razorpay Order
```
POST /api/payment/create-order
Authorization: Bearer <token>

Request Body:
{
  "amount": 1000,
  "currency": "INR",
  "receipt": "order_12345"
}

Response:
{
  "success": true,
  "order": {
    "id": "order_xyz123",
    "amount": 100000,
    "currency": "INR",
    "receipt": "order_12345"
  },
  "key_id": "rzp_test_..."
}
```

#### 2. Verify Payment
```
POST /api/payment/verify
Authorization: Bearer <token>

Request Body:
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "paymentId": "pay_abc456",
  "orderId": "order_xyz123"
}
```

#### 3. Get Razorpay Key
```
GET /api/payment/key

Response:
{
  "key": "rzp_test_..."
}
```

## Frontend Integration

### Cart.jsx Changes
- Added Razorpay script loader
- Integrated Razorpay checkout UI
- Payment handler with verification
- Order creation after successful payment
- Loading state during payment processing

### Key Features
- **Dynamic script loading:** Razorpay SDK loaded on-demand
- **Payment prefill:** User details auto-filled
- **Custom theme:** Green color matching app theme
- **Error handling:** Graceful failure with user feedback
- **Payment cancellation:** Handled with proper state reset

## Testing

### Test Cards (Razorpay Test Mode)
- **Success:** 4111 1111 1111 1111
- **Failure:** 4111 1111 1111 1112
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **OTP:** 1234 (for 3D Secure)

### Test Flow
1. Add products to cart
2. Click "Proceed to Payment"
3. Razorpay modal opens
4. Enter test card details
5. Complete payment
6. Order created and cart cleared
7. Redirected to orders page

## Security Features
✅ Payment signature verification using HMAC SHA256
✅ Server-side validation of all payment parameters
✅ Secure key storage in environment variables
✅ Protected API endpoints with JWT authentication
✅ Amount validation on backend

## Order Model Updates
Orders now include:
- `isPaid`: Boolean flag for payment status
- `paidAt`: Timestamp of payment
- `paymentResult`: Object containing:
  - `id`: Razorpay payment ID
  - `status`: Payment status
  - `razorpay_order_id`: Order ID from Razorpay
  - `razorpay_signature`: Payment signature

## Troubleshooting

### Common Issues

1. **Razorpay script not loading**
   - Check internet connection
   - Verify script URL is correct
   - Check browser console for errors

2. **Payment verification failed**
   - Ensure RAZORPAY_KEY_SECRET is correct
   - Check signature generation logic
   - Verify all payment parameters are passed

3. **Order not created after payment**
   - Check backend logs for errors
   - Verify user authentication token
   - Ensure stock availability

4. **Payment modal not opening**
   - Check if Razorpay script loaded
   - Verify key_id is correct
   - Check browser console for errors

## Production Checklist
- [ ] Switch to LIVE mode keys in Razorpay dashboard
- [ ] Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in production .env
- [ ] Complete KYC verification on Razorpay
- [ ] Test with real payment methods
- [ ] Set up webhooks for payment notifications
- [ ] Configure payment failure handling
- [ ] Add refund functionality
- [ ] Implement payment receipt generation

## Support
For Razorpay integration issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
- [API Reference](https://razorpay.com/docs/api/)

## Notes
- Currently using TEST mode credentials
- All payments are in INR (Indian Rupees)
- Payment capture is automatic (payment_capture: 1)
- Orders are grouped by farmer for separate payments
- Email notifications sent after successful payment
