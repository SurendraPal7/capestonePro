import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const testAdminAPI = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Simulate the admin stats API call
        const totalUsers = await User.countDocuments();
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const totalBuyers = await User.countDocuments({ role: 'buyer' });
        const pendingFarmers = await User.countDocuments({ role: 'farmer', approvalStatus: 'pending' });
        const approvedFarmers = await User.countDocuments({ role: 'farmer', approvalStatus: 'approved' });
        const rejectedFarmers = await User.countDocuments({ role: 'farmer', approvalStatus: 'rejected' });
        
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        console.log('📊 Admin Stats API Response:');
        console.log({
            totalUsers,
            totalFarmers,
            totalBuyers,
            pendingFarmers,
            approvedFarmers,
            rejectedFarmers,
            totalProducts,
            totalOrders
        });

        // Test revenue calculation
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        console.log('\n💰 Revenue Calculation:');
        console.log('Raw result:', totalRevenue);
        console.log('Total Revenue:', totalRevenue[0]?.total || 0);
        console.log('Formatted:', `₹${(totalRevenue[0]?.total || 0).toLocaleString()}`);

        // Test recent farmers
        const recentFarmers = await User.find({ role: 'farmer' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name farmName email approvalStatus createdAt');

        console.log('\n👥 Recent Farmers:');
        recentFarmers.forEach(farmer => {
            console.log(`- ${farmer.farmName || farmer.name} (${farmer.approvalStatus})`);
        });

        // Test recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('buyer', 'name email')
            .populate('farmer', 'name farmName');

        console.log('\n📦 Recent Orders:');
        recentOrders.forEach(order => {
            console.log(`- Order #${order._id.toString().slice(-6)}: ₹${order.totalPrice} (${order.status})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testAdminAPI();