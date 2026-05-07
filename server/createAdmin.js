import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@farmdirect.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            name: 'System Administrator',
            email: 'admin@farmdirect.com',
            password: 'admin123', // This will be hashed by the pre-save hook
            role: 'admin',
            phone: '+1234567890',
            location: {
                address: 'Admin Office',
                city: 'System',
                state: 'Admin',
                zip: '00000'
            },
            isApproved: true,
            approvalStatus: 'approved'
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@farmdirect.com');
        console.log('Password: admin123');
        console.log('Please change the password after first login');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();