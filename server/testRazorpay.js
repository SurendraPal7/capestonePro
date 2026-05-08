import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing Razorpay Integration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Not set');
console.log('');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ Razorpay credentials not found in .env file');
    process.exit(1);
}

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('✅ Razorpay instance created successfully\n');

// Test order creation
async function testOrderCreation() {
    try {
        console.log('📝 Creating test order...');
        
        const options = {
            amount: 50000, // 500 INR in paise
            currency: 'INR',
            receipt: `test_receipt_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        
        console.log('✅ Test order created successfully!');
        console.log('Order Details:');
        console.log('  - Order ID:', order.id);
        console.log('  - Amount:', order.amount / 100, 'INR');
        console.log('  - Currency:', order.currency);
        console.log('  - Receipt:', order.receipt);
        console.log('  - Status:', order.status);
        console.log('\n✅ Razorpay integration is working correctly!');
        console.log('\n📌 Next Steps:');
        console.log('  1. Start the server: npm run dev');
        console.log('  2. Add items to cart in the frontend');
        console.log('  3. Click "Proceed to Payment"');
        console.log('  4. Use test card: 4111 1111 1111 1111');
        console.log('  5. Complete the payment flow');
        
    } catch (error) {
        console.error('❌ Error creating test order:');
        console.error('Error:', error.message);
        if (error.error) {
            console.error('Details:', error.error);
        }
        process.exit(1);
    }
}

testOrderCreation();
