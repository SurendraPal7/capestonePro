import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    let keyword = {};

    if (req.query.keyword) {
        keyword.name = {
            $regex: req.query.keyword,
            $options: 'i',
        };
    }

    if (req.query.farmerId) {
        keyword.farmer = req.query.farmerId;
    }

    if (req.query.lat && req.query.lng) {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        keyword.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
                $maxDistance: 10000, // 10km radius
            },
        };
    }

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .populate('farmer', 'name farmName')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('farmer', 'name farmName email phone');

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Farmer
export const createProduct = asyncHandler(async (req, res) => {
    const { name, category, quantity, unit, price, description, images, location, latitude, longitude, availabilityDate } = req.body;

    const locationData = {
        address: location,
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0], // Longitude first
    };

    const product = new Product({
        farmer: req.user._id,
        name,
        category,
        quantity,
        unit,
        price,
        description,
        images,
        location: locationData,
        availabilityDate,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Farmer
export const updateProduct = asyncHandler(async (req, res) => {
    const { name, category, quantity, unit, price, description, images, location, availabilityDate } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.farmer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }

        product.name = name || product.name;
        product.category = category || product.category;
        product.quantity = quantity || product.quantity;
        product.unit = unit || product.unit;
        product.price = price || product.price;
        product.description = description || product.description;
        product.images = images || product.images;

        if (location || (req.body.latitude && req.body.longitude)) {
            product.location = {
                address: location || product.location.address,
                type: 'Point',
                coordinates: [req.body.longitude || product.location.coordinates[0], req.body.latitude || product.location.coordinates[1]]
            };
        }

        product.availabilityDate = availabilityDate || product.availabilityDate;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Farmer
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.farmer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get products by farmer
// @route   GET /api/products/myproducts
// @access  Private/Farmer
export const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ farmer: req.user._id });
    res.json(products);
});
