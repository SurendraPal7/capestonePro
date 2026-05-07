import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['farmer', 'buyer', 'admin'],
        required: true,
    },
    // Common fields
    phone: {
        type: String,
        required: true,
    },
    location: {
        address: String,
        city: String,
        state: String,
        zip: String,
        // Add coordinates for geolocation
        coordinates: {
            latitude: {
                type: Number,
                min: -90,
                max: 90
            },
            longitude: {
                type: Number,
                min: -180,
                max: 180
            }
        }
    },
    // Farmer specific
    farmName: {
        type: String,
    },
    farmImage: {
        type: String,
    },
    // Buyer specific (Restaurant/Hotel)
    businessName: {
        type: String,
    },
    // Admin and approval fields
    isApproved: {
        type: Boolean,
        default: function() {
            return this.role !== 'farmer'; // Auto-approve buyers and admins
        }
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: function() {
            return this.role === 'farmer' ? 'pending' : 'approved';
        }
    },
    approvalDate: {
        type: Date,
    },
    approvalNotes: {
        type: String,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
