import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaTractor, FaBox } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, updateCartItemQty } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect farmers to dashboard since they shouldn't access cart
    useEffect(() => {
        if (user && user.role === 'farmer') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleQuantityChange = (productId, newQty, maxQty) => {
        if (newQty < 1) return;
        if (newQty > maxQty) {
            alert(`Maximum available quantity is ${maxQty}`);
            return;
        }
        updateCartItemQty(productId, newQty);
    };

    const placeOrder = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Group by farmer
        const itemsByFarmer = cartItems.reduce((acc, item) => {
            const farmerId = item.farmer._id || item.farmer;
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
                    shippingAddress: { 
                        address: '123 Main St', 
                        city: 'City', 
                        postalCode: '11111', 
                        country: 'India' 
                    },
                    paymentMethod: 'Cash',
                    totalPrice,
                    farmerId
                };

                await axios.post('/api/orders', orderData, config);
            }
            alert('Orders placed successfully!');
            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Error placing order';
            alert(message);
        }
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    if (cartItems.length === 0) {
        return (
            <div className='cart-page'>
                <div className='empty-cart'>
                    <div className='empty-cart-icon'>
                        <FaShoppingCart />
                    </div>
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added any fresh produce yet.</p>
                    <button className='shop-now-btn' onClick={() => navigate('/marketplace')}>
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='cart-page'>
            <div className='cart-header'>
                <h1>Shopping Cart</h1>
                <p>{totalItems} {totalItems === 1 ? 'item' : 'items'} ready for checkout</p>
            </div>

            <div className='cart-container'>
                {/* Cart Items */}
                <div className='cart-items-section'>
                    <div className='cart-items-header'>
                        <h2>Your Items</h2>
                        <button className='clear-cart-btn' onClick={clearCart}>
                            <FaTrash style={{ marginRight: '0.5rem' }} />
                            Clear Cart
                        </button>
                    </div>

                    {cartItems.map(item => (
                        <div key={item.product} className='cart-item'>
                            {item.image ? (
                                <img src={item.image} alt={item.name} className='cart-item-image' />
                            ) : (
                                <div className='cart-item-image-placeholder'>
                                    <FaBox />
                                </div>
                            )}

                            <div className='cart-item-details'>
                                <div className='cart-item-header'>
                                    <div className='cart-item-info'>
                                        <h3>{item.name}</h3>
                                        <div className='cart-item-farm'>
                                            <FaTractor />
                                            <span>{item.farmer?.farmName || item.farmer?.name || 'Local Farm'}</span>
                                        </div>
                                        <span className='cart-item-category'>{item.category || 'Fresh Produce'}</span>
                                    </div>
                                    <button 
                                        className='remove-btn' 
                                        onClick={() => removeFromCart(item.product)}
                                        title='Remove from cart'
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>

                                <div className='cart-item-footer'>
                                    <div className='cart-item-quantity'>
                                        <button 
                                            className='qty-btn' 
                                            onClick={() => handleQuantityChange(item.product, item.qty - 1, item.countInStock)}
                                            disabled={item.qty <= 1}
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className='qty-value'>{item.qty}</span>
                                        <button 
                                            className='qty-btn' 
                                            onClick={() => handleQuantityChange(item.product, item.qty + 1, item.countInStock)}
                                            disabled={item.qty >= item.countInStock}
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>

                                    <div className='cart-item-price'>
                                        <div className='item-unit-price'>
                                            ₹{item.price} / {item.unit}
                                        </div>
                                        <div className='item-total-price'>
                                            ₹{(item.price * item.qty).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart Summary */}
                <div className='cart-summary'>
                    <h2>Order Summary</h2>
                    
                    <div className='summary-row'>
                        <span className='summary-label'>Subtotal ({totalItems} items)</span>
                        <span className='summary-value'>₹{totalPrice.toLocaleString()}</span>
                    </div>

                    <div className='summary-row'>
                        <span className='summary-label'>Delivery Fee</span>
                        <span className='summary-value' style={{ color: '#10b981' }}>FREE</span>
                    </div>

                    <div className='summary-row summary-total'>
                        <span className='summary-label'>Total</span>
                        <span className='summary-value'>₹{totalPrice.toLocaleString()}</span>
                    </div>

                    <button className='checkout-btn' onClick={placeOrder}>
                        Proceed to Checkout
                    </button>

                    <button className='continue-shopping-btn' onClick={() => navigate('/marketplace')}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
