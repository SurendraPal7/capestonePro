import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { geocodeAddress } from '../utils/geocoding.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, location, farmName, businessName, farmImage } = req.body;

    if (!name || !email || !password || !role || !phone) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Prepare location data
    let locationData = location || {};
    
    // For farmers, try to geocode the address to get coordinates
    if (role === 'farmer' && location && (location.address || location.city)) {
        const addressString = `${location.address || ''} ${location.city || ''} ${location.state || ''}`.trim();
        
        if (addressString) {
            try {
                const coordinates = await geocodeAddress(addressString);
                if (coordinates) {
                    locationData.coordinates = coordinates;
                }
            } catch (error) {
                console.error('Geocoding failed:', error);
                // Continue without coordinates if geocoding fails
            }
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        location: locationData,
        farmName: role === 'farmer' ? farmName : undefined,
        farmImage: role === 'farmer' ? farmImage : undefined,
        businessName: role === 'buyer' ? businessName : undefined,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Get all farmers
// @route   GET /api/auth/farmers
// @access  Public
export const getFarmers = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 10, category } = req.query; // radius in km, default 10km
    
    let farmers;
    
    // Build the base query
    let matchQuery = { 
        role: 'farmer',
        isApproved: true,
        approvalStatus: 'approved'
    };
    
    // If category is specified, find farmers who have products in that category
    if (category) {
        // First, get all products in the specified category
        const Product = (await import('../models/Product.js')).default;
        const productsInCategory = await Product.find({
            category: { $regex: category, $options: 'i' }
        }).distinct('farmer');
        
        // Filter farmers to only those who have products in this category
        matchQuery._id = { $in: productsInCategory };
    }
    
    if (lat && lng) {
        // Find farmers within specified radius using Haversine formula
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInRadians = radius / 6371; // Earth's radius in km
        
        farmers = await User.aggregate([
            {
                $match: matchQuery
            },
            {
                $addFields: {
                    distance: {
                        $let: {
                            vars: {
                                lat1: { $degreesToRadians: latitude },
                                lon1: { $degreesToRadians: longitude },
                                lat2: { $degreesToRadians: "$location.coordinates.latitude" },
                                lon2: { $degreesToRadians: "$location.coordinates.longitude" }
                            },
                            in: {
                                $multiply: [
                                    6371, // Earth's radius in km
                                    {
                                        $acos: {
                                            $add: [
                                                {
                                                    $multiply: [
                                                        { $sin: "$$lat1" },
                                                        { $sin: "$$lat2" }
                                                    ]
                                                },
                                                {
                                                    $multiply: [
                                                        { $cos: "$$lat1" },
                                                        { $cos: "$$lat2" },
                                                        { $cos: { $subtract: ["$$lon2", "$$lon1"] } }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { distance: { $lte: radius } },
                        { "location.coordinates.latitude": { $exists: false } } // Include farmers without coordinates
                    ]
                }
            },
            {
                $sort: { distance: 1 }
            },
            {
                $project: {
                    name: 1,
                    farmName: 1,
                    farmImage: 1,
                    location: 1,
                    distance: 1
                }
            }
        ]);
    } else {
        // Return farmers based on category filter (if any) without location filtering
        farmers = await User.find(matchQuery)
            .select('name farmName farmImage location')
            .limit(50);
    }
    
    res.status(200).json(farmers);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.farmName = req.body.farmName || user.farmName;
        user.farmImage = req.body.farmImage !== undefined ? req.body.farmImage : user.farmImage;
        user.businessName = req.body.businessName || user.businessName;
        
        // Update location if provided
        if (req.body.location) {
            user.location = { ...user.location, ...req.body.location };
            
            // If coordinates are provided directly, use them
            if (req.body.location.coordinates) {
                user.location.coordinates = req.body.location.coordinates;
            }
            // Otherwise, try to geocode the address for farmers
            else if (user.role === 'farmer' && (req.body.location.address || req.body.location.city)) {
                const addressString = `${req.body.location.address || user.location.address || ''} ${req.body.location.city || user.location.city || ''} ${req.body.location.state || user.location.state || ''}`.trim();
                
                if (addressString) {
                    try {
                        const coordinates = await geocodeAddress(addressString);
                        if (coordinates) {
                            user.location.coordinates = coordinates;
                        }
                    } catch (error) {
                        console.error('Geocoding failed during profile update:', error);
                    }
                }
            }
        }
        
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            location: updatedUser.location,
            farmName: updatedUser.farmName,
            farmImage: updatedUser.farmImage,
            businessName: updatedUser.businessName,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update farmer location coordinates
// @route   PUT /api/auth/location
// @access  Private/Farmer
export const updateFarmerLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude, address } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    if (user.role !== 'farmer') {
        res.status(403);
        throw new Error('Only farmers can update location coordinates');
    }
    
    // Update coordinates if provided
    if (latitude && longitude) {
        if (!user.location) {
            user.location = {};
        }
        user.location.coordinates = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };
        
        if (address) {
            user.location.address = address;
        }
    }
    // If only address provided, try to geocode it
    else if (address) {
        try {
            const coordinates = await geocodeAddress(address);
            if (coordinates) {
                if (!user.location) {
                    user.location = {};
                }
                user.location.coordinates = coordinates;
                user.location.address = address;
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
            res.status(400);
            throw new Error('Failed to geocode address');
        }
    } else {
        res.status(400);
        throw new Error('Please provide either coordinates or address');
    }
    
    const updatedUser = await user.save();
    
    res.json({
        message: 'Location updated successfully',
        location: updatedUser.location
    });
});

// @desc    Get category statistics
// @route   GET /api/auth/categories/stats
// @access  Public
export const getCategoryStats = asyncHandler(async (req, res) => {
    try {
        const Product = (await import('../models/Product.js')).default;
        
        // Define category mappings
        const categoryMappings = {
            'Fruits': ['Fruits', 'Fresh Fruits'],
            'Vegetables': ['Vegetables', 'Leafy Greens'],
            'Dairy': ['Dairy', 'Dairy Products'],
            'Grains': ['Grains', 'Grains & Cereals'],
            'Meat': ['Meat', 'Farm Meat'],
            'Other': ['Other', 'Organic Produce', 'Organic']
        };
        
        const stats = {};
        
        // Get stats for each category
        for (const [key, variations] of Object.entries(categoryMappings)) {
            const count = await Product.countDocuments({
                category: { $in: variations },
                quantity: { $gt: 0 } // Only count products that are in stock
            });
            stats[key] = count;
        }
        
        // Also get total products count
        const totalProducts = await Product.countDocuments({
            quantity: { $gt: 0 }
        });
        
        res.json({
            categories: stats,
            total: totalProducts
        });
    } catch (error) {
        console.error('Error getting category stats:', error);
        res.status(500);
        throw new Error('Failed to get category statistics');
    }
});
