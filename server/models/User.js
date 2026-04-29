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
        enum: ['farmer', 'buyer'],
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
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
