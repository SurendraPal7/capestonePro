import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Role-based access control middleware
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }

        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Access denied. Required role: ${roles.join(' or ')}`);
        }

        next();
    };
};

// Admin only middleware
export const adminOnly = requireRole('admin');

// Approved farmer middleware
export const approvedFarmerOnly = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }

    if (req.user.role !== 'farmer') {
        res.status(403);
        throw new Error('Access denied. Farmers only');
    }

    if (!req.user.isApproved || req.user.approvalStatus !== 'approved') {
        res.status(403);
        throw new Error('Farm not approved. Please wait for admin approval');
    }

    next();
});
