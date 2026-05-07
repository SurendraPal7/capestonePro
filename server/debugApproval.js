import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const debugApproval = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check admin user
        const admin = await User.findOne({ email: 'admin@farmdirect.com' });
        console.log('\n👤 Admin User:');
        console.log('- Exists:', !!admin);
        console.log('- Role:', admin?.role);
        console.log('- ID:', admin?._id);

        // Check all farmers
        const farmers = await User.find({ role: 'farmer' });
        console.log('\n🚜 All Farmers:');
        farmers.forEach((farmer, index) => {
            console.log(`${index + 1}. ${farmer.farmName || farmer.name}`);
            console.log(`   - ID: ${farmer._id}`);
            console.log(`   - Email: ${farmer.email}`);
            console.log(`   - isApproved: ${farmer.isApproved}`);
            console.log(`   - approvalStatus: ${farmer.approvalStatus}`);
            console.log(`   - approvalDate: ${farmer.approvalDate}`);
            console.log('');
        });

        // Test approval on first pending farmer
        const pendingFarmer = farmers.find(f => f.approvalStatus === 'pending');
        if (pendingFarmer) {
            console.log(`🔧 Testing approval on: ${pendingFarmer.farmName || pendingFarmer.name}`);
            
            pendingFarmer.isApproved = true;
            pendingFarmer.approvalStatus = 'approved';
            pendingFarmer.approvalDate = new Date();
            pendingFarmer.approvedBy = admin._id;
            
            await pendingFarmer.save();
            console.log('✅ Test approval successful!');
            
            // Verify the change
            const updatedFarmer = await User.findById(pendingFarmer._id);
            console.log('📋 Verification:');
            console.log(`   - isApproved: ${updatedFarmer.isApproved}`);
            console.log(`   - approvalStatus: ${updatedFarmer.approvalStatus}`);
            console.log(`   - approvalDate: ${updatedFarmer.approvalDate}`);
        } else {
            console.log('⚠️ No pending farmers found to test');
        }

        // Show final stats
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$approvalStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('\n📊 Final Stats:');
        stats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

debugApproval();