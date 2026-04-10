const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const migrate = async () => {
    try {
        const products = await Product.find({});

        for (const product of products) {
            // Check if location is a string (old format) or missing coordinates
            // Note: Mongoose might have already cast it to an object with fields undefined if strict is false, 
            // but since we updated the model, we need to interact directly or use lean().
            // However, accessing product.location might return the object structure with undefined values if the DB has a string.
            // Let's rely on finding products where coordinates are missing.

            // To safely handle the string vs object issue allowing us to read the old string:
            // We might need to use `Product.collection` to access raw data or just assume migration is needed.

            // Simpler approach: updateOne with aggregation or just pure logic if we can read the old value.
            // Since Mongoose schema is already changed, `product.location` might be problematic to read if it was a string.
            // Let's use the raw driver for safety to read the old string.

            const rawProduct = await Product.collection.findOne({ _id: product._id });

            if (typeof rawProduct.location === 'string') {
                console.log(`Migrating product: ${product.name}`);
                const oldLocation = rawProduct.location;

                product.location = {
                    type: 'Point',
                    coordinates: [0, 0], // Default coordinates
                    address: oldLocation
                };

                await product.save();
                console.log(`Migrated ${product.name}`);
            } else if (!product.location.coordinates || product.location.coordinates.length === 0) {
                // Object exists but coordinates missing
                console.log(`Fixing coordinates for: ${product.name}`);
                product.location.coordinates = [0, 0];
                product.location.type = 'Point';
                // product.location.address is likely already there or undefined
                if (!product.location.address) product.location.address = "Unknown Location";

                await product.save();
            }
        }

        console.log('Migration complete');
        process.exit();
    } catch (error) {
        console.error('Error with migration:', error);
        process.exit(1);
    }
};

migrate();
