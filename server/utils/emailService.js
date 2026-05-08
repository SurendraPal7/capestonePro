import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // You can use other services like 'outlook', 'yahoo', etc.
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Email templates
const emailTemplates = {
    newOrder: (farmerName, buyerName, orderDetails) => ({
        subject: '🎉 New Order Received!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #3a7d44; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">🌾 New Order Received!</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333;">Hello <strong>${farmerName}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Great news! You have received a new order from <strong>${buyerName}</strong>.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3a7d44; margin-top: 0;">Order Details:</h3>
                        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                        <p><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>
                        <p><strong>Items:</strong> ${orderDetails.itemCount} item(s)</p>
                        <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #333;">Please log in to your dashboard to view the complete order details and confirm the order.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #3a7d44; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">Thank you for being part of our farming community!</p>
                </div>
            </div>
        `
    }),

    orderConfirmed: (buyerName, farmerName, orderDetails) => ({
        subject: '✅ Your Order Has Been Confirmed!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #3a7d44; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">✅ Order Confirmed!</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333;">Hello <strong>${buyerName}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Good news! Your order from <strong>${farmerName}</strong> has been confirmed and is being prepared.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3a7d44; margin-top: 0;">Order Details:</h3>
                        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                        <p><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>
                        <p><strong>Status:</strong> <span style="color: #3a7d44; font-weight: bold;">Confirmed</span></p>
                    </div>
                    
                    <p style="font-size: 16px; color: #333;">Your order will be shipped soon. We'll notify you once it's on the way!</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/profile" style="background-color: #3a7d44; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Order</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">Thank you for supporting local farmers!</p>
                </div>
            </div>
        `
    }),

    orderShipped: (buyerName, farmerName, orderDetails) => ({
        subject: '📦 Your Order Has Been Shipped!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #3a7d44; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">📦 Order Shipped!</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333;">Hello <strong>${buyerName}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Exciting news! Your order from <strong>${farmerName}</strong> has been shipped and is on its way to you!</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3a7d44; margin-top: 0;">Order Details:</h3>
                        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                        <p><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>
                        <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Shipped</span></p>
                        <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #333;">Your fresh produce will arrive soon. Please be available to receive the delivery!</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/profile" style="background-color: #3a7d44; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Order</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">Thank you for supporting local farmers!</p>
                </div>
            </div>
        `
    }),

    orderDelivered: (buyerName, farmerName, orderDetails) => ({
        subject: '🎉 Your Order Has Been Delivered!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #3a7d44; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">🎉 Order Delivered!</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333;">Hello <strong>${buyerName}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Great news! Your order from <strong>${farmerName}</strong> has been successfully delivered!</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3a7d44; margin-top: 0;">Order Details:</h3>
                        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                        <p><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>
                        <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Delivered</span></p>
                    </div>
                    
                    <p style="font-size: 16px; color: #333;">We hope you enjoy your fresh, organic produce! If you have any concerns about your order, please contact us.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/marketplace" style="background-color: #3a7d44; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Shop Again</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">Thank you for supporting local farmers! 🌾</p>
                </div>
            </div>
        `
    }),

    orderCancelled: (buyerName, farmerName, orderDetails) => ({
        subject: '❌ Order Cancelled',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">❌ Order Cancelled</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333;">Hello <strong>${buyerName}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">We regret to inform you that your order from <strong>${farmerName}</strong> has been cancelled.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #dc2626; margin-top: 0;">Order Details:</h3>
                        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                        <p><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>
                        <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Cancelled</span></p>
                    </div>
                    
                    <p style="font-size: 16px; color: #333;">If you have any questions about this cancellation, please contact the farmer or our support team.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/marketplace" style="background-color: #3a7d44; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse Marketplace</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">We hope to serve you again soon!</p>
                </div>
            </div>
        `
    })
};

// Send email function
export const sendEmail = async (to, template, data) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('⚠️ Email not configured. Skipping email send.');
            console.log(`Would have sent: ${template} to ${to}`);
            return { success: false, message: 'Email not configured' };
        }

        const transporter = createTransporter();
        const emailContent = emailTemplates[template](data.recipientName, data.senderName, data.orderDetails);

        const mailOptions = {
            from: `"FarmDirect" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: emailContent.subject,
            html: emailContent.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Specific email functions for different order events
export const sendNewOrderEmail = async (farmerEmail, farmerName, buyerName, orderDetails) => {
    return await sendEmail(farmerEmail, 'newOrder', {
        recipientName: farmerName,
        senderName: buyerName,
        orderDetails
    });
};

export const sendOrderConfirmedEmail = async (buyerEmail, buyerName, farmerName, orderDetails) => {
    return await sendEmail(buyerEmail, 'orderConfirmed', {
        recipientName: buyerName,
        senderName: farmerName,
        orderDetails
    });
};

export const sendOrderShippedEmail = async (buyerEmail, buyerName, farmerName, orderDetails) => {
    return await sendEmail(buyerEmail, 'orderShipped', {
        recipientName: buyerName,
        senderName: farmerName,
        orderDetails
    });
};

export const sendOrderDeliveredEmail = async (buyerEmail, buyerName, farmerName, orderDetails) => {
    return await sendEmail(buyerEmail, 'orderDelivered', {
        recipientName: buyerName,
        senderName: farmerName,
        orderDetails
    });
};

export const sendOrderCancelledEmail = async (buyerEmail, buyerName, farmerName, orderDetails) => {
    return await sendEmail(buyerEmail, 'orderCancelled', {
        recipientName: buyerName,
        senderName: farmerName,
        orderDetails
    });
};
