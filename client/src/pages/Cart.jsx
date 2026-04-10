import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import './Marketplace.css'; // Reusing some styles

const Cart = () => {
    const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Group items by farmer ? 
    // For MVP, simplistic order placement. If multi-farmer, we might need loop.
    // Let's assume one big order or split in backend. 
    // Wait, backend requires farmerId. 
    // So distinct farmers = distinct orders.

    const placeOrder = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Group by farmer
        const itemsByFarmer = cartItems.reduce((acc, item) => {
            const farmerId = item.farmer._id || item.farmer; // Depends on population
            if (!acc[farmerId]) acc[farmerId] = [];
            acc[farmerId].push(item);
            return acc;
        }, {});

        try {
            for (const farmerId in itemsByFarmer) {
                const items = itemsByFarmer[farmerId];
                const totalPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);

                const orderData = {
                    orderItems: items,
                    shippingAddress: { address: '123 Main St', city: 'City', postalCode: '11111', country: 'India' }, // Mock address for now
                    paymentMethod: 'Cash',
                    totalPrice,
                    farmerId
                };

                await axios.post('/api/orders', orderData, config);
            }
            alert('Orders placed successfully!');
            clearCart();
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Error placing order';
            alert(message);
        }
    };

    return (
        <div className='container cart-page'>
            <h1>Shopping Cart</h1>
            {cartItems.length === 0 ? <p>Your cart is empty.</p> : (
                <>
                    <div className='cart-items'>
                        {cartItems.map(item => (
                            <div key={item.product} className='card cart-item'>
                                <div>
                                    <h4>{item.name}</h4>
                                    <p>₹{item.price} x {item.qty}</p>
                                </div>
                                <button className='btn btn-danger btn-sm' onClick={() => removeFromCart(item.product)}>Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className='cart-summary'>
                        <h3>Total: ₹{cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)}</h3>
                        <button className='btn btn-primary btn-lg' onClick={placeOrder}>Place Order</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
