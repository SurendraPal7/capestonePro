import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const migrateUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update existing farmers to have approval fields
        const result = await User.updateMany(
            { 
                role: 'farmer',
                $or: [
                    { isApproved: { $exists: false } },
                    { approvalStatus: { $exists: false } }
                ]
            },
            {
                $set: {
                    isApproved: false,
                    approvalStatus: 'pending'
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} farmer records with approval fields`);

        // Update existing buyers and admins to be auto-approved
        const buyerResult = await User.updateMany(
            { 
                role: { $in: ['buyer', 'admin'] },
                $or: [
                    { isApproved: { $exists: false } },
                    { approvalStatus: { $exists: false } }
                ]
            },
            {
                $set: {
                    isApproved: true,
                    approvalStatus: 'approved'
                }
            }
        );

        console.log(`Updated ${buyerResult.modifiedCount} buyer/admin records with approval fields`);

        // Show current user statistics
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
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

        console.log('\nCurrent user statistics:');
        stats.forEach(stat => {
            console.log(`${stat._id}: ${stat.count} total (${stat.approved} approved, ${stat.pending} pending)`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error migrating users:', error);
        process.exit(1);
    }
};

migrateUsers();