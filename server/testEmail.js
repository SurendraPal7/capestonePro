// Quick test script to verify email configuration
import dotenv from 'dotenv';
import { sendNewOrderEmail } from './utils/emailService.js';

dotenv.config();

const testEmail = async () => {
    console.log('📧 Testing Email Configuration...\n');

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('❌ ERROR: Email not configured in .env file');
        console.log('\n📝 Please add these to server/.env:');
        console.log('   EMAIL_USER=your-email@gmail.com');
        console.log('   EMAIL_PASSWORD=your-app-password\n');
        console.log('🔗 Get Gmail App Password: https://myaccount.google.com/apppasswords\n');
        process.exit(1);
    }

    if (process.env.EMAIL_USER === 'your-email@gmail.com') {
        console.error('❌ ERROR: Please replace placeholder email with your actual email');
        process.exit(1);
    }

    console.log('✅ Email credentials found in .env');
    console.log(`📮 Sending test email to: ${process.env.EMAIL_USER}\n`);

    try {
        const result = await sendNewOrderEmail(
            process.env.EMAIL_USER, // Send to yourself for testing
            'Test Farmer',
            'Test Buyer',
            {
                orderId: 'TEST' + Date.now().toString().slice(-6),
                totalPrice: 1250,
                itemCount: 5,
                address: '123 Farm Road, Green Valley, Maharashtra - 411001'
            }
        );

        if (result.success) {
            console.log('✅ SUCCESS! Test email sent successfully!');
            console.log(`📬 Message ID: ${result.messageId}`);
            console.log('\n📥 Check your inbox (and spam folder) for the test email');
            console.log('🎉 Email system is working correctly!\n');
        } else {
            console.error('❌ Failed to send email');
            console.error('Error:', result.error || result.message);
            console.log('\n💡 Common issues:');
            console.log('   1. Using regular password instead of App Password');
            console.log('   2. 2-Step Verification not enabled on Gmail');
            console.log('   3. Incorrect email or password in .env\n');
        }
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Generate Gmail App Password: https://myaccount.google.com/apppasswords');
        console.log('   2. Make sure 2-Step Verification is enabled');
        console.log('   3. Check EMAIL_USER and EMAIL_PASSWORD in .env\n');
    }
};

testEmail();
