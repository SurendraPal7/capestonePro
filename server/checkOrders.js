import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import User from './models/User.js';

dotenv.config();

const checkOrders = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check all orders
        const orders = await Order.find().populate('buyer', 'name email').populate('farmer', 'name farmName');
        console.log(`\n📦 Total Orders: ${orders.length}`);

        if (orders.length === 0) {
            console.log('⚠️ No orders found in the database');
            
            // Let's create a sample order for testing
            const sampleOrder = new Order({
                buyer: '695fb4729108a0682c4ac3de', // Use an existing user ID
                farmer: '695fafef9108a0682c4ac2ad', // Use an existing farmer ID
                orderItems: [
                    {
                        name: 'Fresh Tomatoes',
                        qty: 5,
                        price: 50,
                        product: '695fafef9108a0682c4ac2ad' // Use any existing product ID
                    }
                ],
                shippingAddress: {
                    address: '123 Test Street',
                    city: 'Test City',
                    postalCode: '12345',
                    country: 'India'
                },
                paymentMethod: 'Cash',
                totalPrice: 250,
                status: 'Delivered'
            });

            await sampleOrder.save();
            console.log('✅ Created sample order for testing');
        } else {
            console.log('\n📋 Order Details:');
            orders.forEach((order, index) => {
                console.log(`${index + 1}. Order ID: ${order._id}`);
                console.log(`   - Buyer: ${order.buyer?.name || 'Unknown'}`);
                console.log(`   - Farmer: ${order.farmer?.farmName || order.farmer?.name || 'Unknown'}`);
                console.log(`   - Total Price: ₹${order.totalPrice}`);
                console.log(`   - Status: ${order.status}`);
                console.log(`   - Items: ${order.orderItems.length}`);
                console.log('');
            });
        }

        // Calculate total revenue
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        console.log(`💰 Total Revenue: ₹${totalRevenue[0]?.total || 0}`);

        // Check revenue by status
        const revenueByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            }
        ]);

        console.log('\n📊 Revenue by Status:');
        revenueByStatus.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} orders, ₹${stat.revenue}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkOrders();