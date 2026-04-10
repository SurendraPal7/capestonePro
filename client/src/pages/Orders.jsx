import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import './Dashboard.css';

const Orders = () => {
    const { user, loading } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                let res;
                if (user.role === 'farmer') {
                    res = await axios.get('/api/orders/farmerorders', config);
                } else {
                    res = await axios.get('/api/orders/myorders', config);
                }
                setOrders(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrders();
        // Polling for updates
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const handleStatusUpdate = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`/api/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    if (loading || !user) return <div className='container'>Loading...</div>;

    return (
        <DashboardLayout>
            <div className={user.role === 'farmer' ? '' : 'container dashboard'}>
                <h1>Order History</h1>
                <div className='orders-list'>
                    {orders.length === 0 ? <p>No orders found.</p> : (
                        orders.map(order => (
                            <div key={order._id} className='card order-card'>
                                <div className='order-header'>
                                    <h4>Order #{order._id.substring(order._id.length - 8)}</h4>
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                                </div>

                                <div className='contact-info-section'>
                                    {user.role === 'farmer' && order.buyer && (
                                        <p className='contact-detail'>
                                            <strong>Buyer:</strong> {order.buyer.name} <br />
                                            <strong>Phone:</strong> {order.buyer.phone}
                                        </p>
                                    )}
                                    {user.role === 'buyer' && order.farmer && (
                                        <p className='contact-detail'>
                                            <strong>Farmer:</strong> {order.farmer.farmName || order.farmer.name} <br />
                                            <strong>Phone:</strong> {order.farmer.phone}
                                        </p>
                                    )}
                                </div>

                                <p>Total: <strong>₹{order.totalAmount || order.totalPrice}</strong></p>
                                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                <div className='order-items'>
                                    {order.orderItems && order.orderItems.map((item, idx) => (
                                        <span key={idx} className='order-item'>{item.name} (x{item.qty})</span>
                                    ))}
                                </div>
                                {user.role === 'farmer' && (
                                    <div className='order-actions mt-3'>
                                        {order.status === 'Pending' && (
                                            <button className='btn btn-success btn-sm' onClick={() => handleStatusUpdate(order._id, 'Confirmed')}>Confirm Order</button>
                                        )}
                                        {order.status === 'Confirmed' && (
                                            <button className='btn btn-info btn-sm' onClick={() => handleStatusUpdate(order._id, 'Delivered')}>Mark Delivered</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Orders;
