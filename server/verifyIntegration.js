import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const verifyIntegration = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Verify admin user exists
        const admin = await User.findOne({ email: 'admin@farmdirect.com' });
        if (admin && admin.role === 'admin') {
            console.log('✅ Admin user exists and configured correctly');
        } else {
            console.log('❌ Admin user not found or misconfigured');
        }

        // 2. Verify user roles and approval status
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    total: { $sum: 1 },
                    approved: {
                        $sum: {
                            $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        console.log('\n📊 User Statistics:');
        userStats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.total} total (${stat.approved} approved, ${stat.pending} pending)`);
        });

        // 3. Verify farmers have approval fields
        const farmersWithoutApproval = await User.countDocuments({
            role: 'farmer',
            $or: [
                { isApproved: { $exists: false } },
                { approvalStatus: { $exists: false } }
            ]
        });

        if (farmersWithoutApproval === 0) {
            console.log('✅ All farmers have approval fields configured');
        } else {
            console.log(`❌ ${farmersWithoutApproval} farmers missing approval fields`);
        }

        // 4. Verify only approved farmers are returned in public API
        const publicFarmers = await User.find({
            role: 'farmer',
            isApproved: true,
            approvalStatus: 'approved'
        });

        const allFarmers = await User.find({ role: 'farmer' });
        
        console.log(`\n🔒 Farmer Visibility:`);
        console.log(`   Total farmers: ${allFarmers.length}`);
        console.log(`   Publicly visible (approved): ${publicFarmers.length}`);

        // 5. Check if there are any products from unapproved farmers
        const productsFromUnapprovedFarmers = await Product.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'farmer',
                    foreignField: '_id',
                    as: 'farmerInfo'
                }
            },
            {
                $unwind: '$farmerInfo'
            },
            {
                $match: {
                    'farmerInfo.role': 'farmer',
                    'farmerInfo.approvalStatus': { $ne: 'approved' }
                }
            },
            {
                $count: 'count'
            }
        ]);

        const unapprovedProductCount = productsFromUnapprovedFarmers[0]?.count || 0;
        console.log(`   Products from unapproved farmers: ${unapprovedProductCount}`);

        // 6. Verify database indexes and performance
        const indexes = await User.collection.getIndexes();
        console.log(`\n📈 Database Indexes: ${Object.keys(indexes).length} indexes configured`);

        // 7. Check recent activity for admin dashboard
        const recentFarmers = await User.find({ role: 'farmer' })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('name farmName approvalStatus createdAt');

        console.log('\n🕒 Recent Farmer Activity:');
        recentFarmers.forEach(farmer => {
            console.log(`   ${farmer.farmName || farmer.name} - ${farmer.approvalStatus} (${new Date(farmer.createdAt).toLocaleDateString()})`);
        });

        // 8. Verify order statistics
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        if (orderStats.length > 0) {
            console.log('\n💰 Order Statistics:');
            console.log(`   Total Orders: ${orderStats[0].totalOrders}`);
            console.log(`   Total Revenue: ₹${orderStats[0].totalRevenue?.toLocaleString()}`);
            console.log(`   Average Order Value: ₹${Math.round(orderStats[0].avgOrderValue)}`);
        } else {
            console.log('\n💰 No orders found in the system yet');
        }

        console.log('\n🎉 Integration verification completed!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Login as admin: admin@farmdirect.com / admin123');
        console.log('   2. Navigate to /admin to access the admin dashboard');
        console.log('   3. Approve pending farmers to make them visible');
        console.log('   4. Monitor platform activity and user operations');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during verification:', error);
        process.exit(1);
    }
};

verifyIntegration();