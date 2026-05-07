import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const resetFarmers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Reset all farmers to pending status
        const result = await User.updateMany(
            { role: 'farmer' },
            {
                $set: {
                    isApproved: false,
                    approvalStatus: 'pending'
                },
                $unset: {
                    approvalDate: 1,
                    approvalNotes: 1,
                    approvedBy: 1
                }
            }
        );

        console.log(`✅ Reset ${result.modifiedCount} farmers to pending status`);

        // Show current status
        const farmers = await User.find({ role: 'farmer' }).select('name farmName approvalStatus isApproved');
        console.log('\n🚜 Current Farmer Status:');
        farmers.forEach((farmer, index) => {
            console.log(`${index + 1}. ${farmer.farmName || farmer.name} - ${farmer.approvalStatus} (isApproved: ${farmer.isApproved})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetFarmers();