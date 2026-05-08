import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('  RAZORPAY SETUP HELPER');
console.log('========================================\n');

console.log('📋 Instructions:');
console.log('1. Go to https://dashboard.razorpay.com/');
console.log('2. Navigate to Settings → API Keys');
console.log('3. You will see TWO separate values:\n');
console.log('   Key ID: rzp_test_XXXXXXXXXXXXX');
console.log('   Key Secret: (click Show to reveal)\n');

console.log('⚠️  IMPORTANT:');
console.log('You provided: rzp_test_SmrzVAJCzG7QULL9LoYTzEZn5dnC5BtRNtiuSKt');
console.log('This appears to be ONE string, but you need TWO separate keys!\n');

console.log('📝 Current .env configuration:');
console.log('RAZORPAY_KEY_ID=rzp_test_SmrzVAJCzG7QUL');
console.log('RAZORPAY_KEY_SECRET=L9LoYTzEZn5dnC5BtRNtiuSKt\n');

console.log('❓ Is this correct? Let me help you verify:\n');

// Try to parse the original string
const originalString = 'rzp_test_SmrzVAJCzG7QULL9LoYTzEZn5dnC5BtRNtiuSKt';
console.log('Original string length:', originalString.length);
console.log('Typical Key ID length: ~28 characters (rzp_test_ + 14-16 chars)');
console.log('Typical Key Secret length: 24-32 characters\n');

// Suggest possible splits
console.log('🔍 Possible interpretations:\n');

console.log('Option 1 (Current):');
console.log('  Key ID: rzp_test_SmrzVAJCzG7QUL (27 chars)');
console.log('  Secret: L9LoYTzEZn5dnC5BtRNtiuSKt (26 chars)\n');

console.log('Option 2:');
console.log('  Key ID: rzp_test_SmrzVAJCzG7QULL (30 chars)');
console.log('  Secret: 9LoYTzEZn5dnC5BtRNtiuSKt (24 chars)\n');

console.log('Option 3:');
console.log('  Key ID: rzp_test_SmrzVAJCzG7QU (28 chars)');
console.log('  Secret: LL9LoYTzEZn5dnC5BtRNtiuSKt (27 chars)\n');

console.log('✅ RECOMMENDED ACTION:');
console.log('1. Login to your Razorpay Dashboard');
console.log('2. Copy the Key ID EXACTLY as shown');
console.log('3. Click "Show" and copy the Key Secret EXACTLY');
console.log('4. Update server/.env file with the correct values');
console.log('5. Restart the server\n');

console.log('📖 For detailed instructions, read: GET_RAZORPAY_KEYS.md\n');
