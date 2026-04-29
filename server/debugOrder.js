import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const testOrder = async () => {
    try {
        console.log("Fetching a product...");
        const product = await Product.findOne({});
        if (!product) {
            console.log("No products found to test.");
            process.exit();
        }
        console.log(`Found product: ${product.name}, ID: ${product._id}, Qty: ${product.quantity}`);

        // Simulate Order Item
        const orderItem = {
            name: product.name,
            qty: 1,
            price: product.price,
            product: product._id,
            image: product.images && product.images[0]
        };

        console.log("Attempting to deduct stock...");
        product.quantity -= 1;
        await product.save();
        console.log("Stock deduction successful.");

        console.log("Attempting to create order...");
        const order = new Order({
            orderItems: [orderItem],
            buyer: product.farmer,
            farmer: "invalid_id", // Test invalid ID
            shippingAddress: { address: 'Test', city: 'Test', postalCode: '123', country: 'Test' },
            paymentMethod: 'Test',
            totalPrice: product.price
        });

        await order.save();
        console.log("Order created successfully.");
        process.exit();
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

testOrder();
