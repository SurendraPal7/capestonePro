import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const pendingFarmers = await User.countDocuments({ role: 'farmer', approvalStatus: 'pending' });
    const approvedFarmers = await User.countDocuments({ role: 'farmer', approvalStatus: 'approved' });
    const rejectedFarmers = await User.countDocuments({ role: 'farmer', approvalStatus: 'rejected' });
    
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Recent activity
    const recentFarmers = await User.find({ role: 'farmer' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name farmName email approvalStatus createdAt');

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('buyer', 'name email')
        .populate('farmer', 'name farmName');

    res.json({
        stats: {
            totalUsers,
            totalFarmers,
            totalBuyers,
            pendingFarmers,
            approvedFarmers,
            rejectedFarmers,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        },
        recentActivity: {
            recentFarmers,
            recentOrders
        }
    });
});

// @desc    Get all farmers with approval status
// @route   GET /api/admin/farmers
// @access  Private/Admin
export const getAllFarmers = asyncHandler(async (req, res) => {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = { role: 'farmer' };
    
    if (status && status !== 'all') {
        query.approvalStatus = status;
    }
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { farmName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const farmers = await User.find(query)
        .select('-password')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
        farmers,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    });
});

// @desc    Get pending farmers for approval
// @route   GET /api/admin/farmers/pending
// @access  Private/Admin
export const getPendingFarmers = asyncHandler(async (req, res) => {
    const farmers = await User.find({ 
        role: 'farmer', 
        approvalStatus: 'pending' 
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(farmers);
});

// @desc    Get single farmer details with products
// @route   GET /api/admin/farmers/:id
// @access  Private/Admin
export const getFarmerById = asyncHandler(async (req, res) => {
    const farmer = await User.findById(req.params.id)
        .select('-password')
        .populate('approvedBy', 'name email');

    if (!farmer || farmer.role !== 'farmer') {
        res.status(404);
        throw new Error('Farmer not found');
    }

    // Get farmer's products
    const products = await Product.find({ farmer: farmer._id })
        .select('name category price unit countInStock image images')
        .sort({ createdAt: -1 });

    // Get order statistics
    const orderCount = await Order.countDocuments({ farmer: farmer._id });
    const totalRevenue = await Order.aggregate([
        { $match: { farmer: farmer._id, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
        ...farmer.toObject(),
        products,
        productCount: products.length,
        orderCount,
        totalRevenue: totalRevenue[0]?.total || 0
    });
});

// @desc    Approve a farmer
// @route   PUT /api/admin/farmers/:id/approve
// @access  Private/Admin
export const approveFarmer = asyncHandler(async (req, res) => {
    const { notes } = req.body;
    
    const farmer = await User.findById(req.params.id);
    
    if (!farmer || farmer.role !== 'farmer') {
        res.status(404);
        throw new Error('Farmer not found');
    }

    farmer.isApproved = true;
    farmer.approvalStatus = 'approved';
    farmer.approvalDate = new Date();
    farmer.approvalNotes = notes || '';
    farmer.approvedBy = req.user._id;

    await farmer.save();

    res.json({
        message: 'Farmer approved successfully',
        farmer: {
            _id: farmer._id,
            name: farmer.name,
            farmName: farmer.farmName,
            email: farmer.email,
            approvalStatus: farmer.approvalStatus,
            approvalDate: farmer.approvalDate
        }
    });
});

// @desc    Reject a farmer
// @route   PUT /api/admin/farmers/:id/reject
// @access  Private/Admin
export const rejectFarmer = asyncHandler(async (req, res) => {
    const { notes } = req.body;
    
    if (!notes) {
        res.status(400);
        throw new Error('Rejection notes are required');
    }
    
    const farmer = await User.findById(req.params.id);
    
    if (!farmer || farmer.role !== 'farmer') {
        res.status(404);
        throw new Error('Farmer not found');
    }

    farmer.isApproved = false;
    farmer.approvalStatus = 'rejected';
    farmer.approvalDate = new Date();
    farmer.approvalNotes = notes;
    farmer.approvedBy = req.user._id;

    await farmer.save();

    res.json({
        message: 'Farmer rejected',
        farmer: {
            _id: farmer._id,
            name: farmer.name,
            farmName: farmer.farmName,
            email: farmer.email,
            approvalStatus: farmer.approvalStatus,
            approvalNotes: farmer.approvalNotes
        }
    });
});

// @desc    Get all buyers
// @route   GET /api/admin/buyers
// @access  Private/Admin
export const getAllBuyers = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { role: 'buyer' };
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { businessName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const buyers = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get order statistics for each buyer
    const buyersWithStats = await Promise.all(buyers.map(async (buyer) => {
        const orderCount = await Order.countDocuments({ buyer: buyer._id });
        const totalSpent = await Order.aggregate([
            { $match: { buyer: buyer._id, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        
        return {
            ...buyer.toObject(),
            orderCount,
            totalSpent: totalSpent[0]?.total || 0
        };
    }));

    res.json({
        buyers: buyersWithStats,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    });
});

// @desc    Get single buyer details with orders
// @route   GET /api/admin/buyers/:id
// @access  Private/Admin
export const getBuyerById = asyncHandler(async (req, res) => {
    const buyer = await User.findById(req.params.id)
        .select('-password');

    if (!buyer || buyer.role !== 'buyer') {
        res.status(404);
        throw new Error('Buyer not found');
    }

    // Get buyer's orders
    const recentOrders = await Order.find({ buyer: buyer._id })
        .populate('farmer', 'name farmName email')
        .populate('orderItems.product', 'name category')
        .sort({ createdAt: -1 })
        .limit(10);

    // Get order statistics
    const orderCount = await Order.countDocuments({ buyer: buyer._id });
    const totalSpent = await Order.aggregate([
        { $match: { buyer: buyer._id, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const pendingOrders = await Order.countDocuments({ 
        buyer: buyer._id, 
        status: { $in: ['Pending', 'Confirmed', 'Shipped'] }
    });

    const completedOrders = await Order.countDocuments({ 
        buyer: buyer._id, 
        status: 'Delivered'
    });

    // Get last order date
    const lastOrder = await Order.findOne({ buyer: buyer._id })
        .sort({ createdAt: -1 })
        .select('createdAt');

    res.json({
        ...buyer.toObject(),
        recentOrders,
        orderCount,
        totalSpent: totalSpent[0]?.total || 0,
        pendingOrders,
        completedOrders,
        lastOrderDate: lastOrder?.createdAt || null
    });
});

// @desc    Get all orders for admin tracking
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
        query.status = status;
    }

    const orders = await Order.find(query)
        .populate('buyer', 'name email businessName')
        .populate('farmer', 'name farmName email')
        .populate('orderItems.product', 'name category')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    });
});

// @desc    Get single order details for admin
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('buyer', 'name email phone businessName location')
        .populate('farmer', 'name farmName email phone location')
        .populate('orderItems.product', 'name category unit images');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.json(order);
});

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getSystemAnalytics = asyncHandler(async (req, res) => {
    // User growth over time
    const userGrowth = await User.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    role: '$role'
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Order trends
    const orderTrends = await Order.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                orderCount: { $sum: 1 },
                revenue: { $sum: '$totalPrice' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Product categories distribution
    const categoryStats = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Top performing farmers
    const topFarmers = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        {
            $group: {
                _id: '$farmer',
                orderCount: { $sum: 1 },
                totalRevenue: { $sum: '$totalPrice' }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'farmerInfo'
            }
        },
        { $unwind: '$farmerInfo' },
        {
            $project: {
                farmName: '$farmerInfo.farmName',
                name: '$farmerInfo.name',
                orderCount: 1,
                totalRevenue: 1
            }
        }
    ]);

    res.json({
        userGrowth,
        orderTrends,
        categoryStats,
        topFarmers
    });
});

// @desc    Update user status (suspend/activate)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
    const { isActive, notes } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role === 'admin') {
        res.status(403);
        throw new Error('Cannot modify admin users');
    }

    user.isActive = isActive;
    if (notes) {
        user.adminNotes = notes;
    }

    await user.save();

    res.json({
        message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isActive: user.isActive
        }
    });
});