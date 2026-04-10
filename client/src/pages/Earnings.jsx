import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';

const Earnings = () => {
    const { user, loading } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'farmer') return;

        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const { data } = await axios.get('/api/orders/farmerorders', config);
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders for earnings', err);
            }
        };

        fetchOrders();
    }, [user]);

    const deliveredEarnings = orders
        .filter(o => o.status === 'Delivered')
        .reduce((acc, current) => acc + (current.totalPrice || current.totalAmount || 0), 0);

    return (
        <DashboardLayout>
            <div className="dashboard-section card">
                <h2>Earnings & Payouts</h2>
                <p>Track your revenue gathered from successfully delivered products.</p>
                <div className="stats-grid mt-4">
                    <div className='stat-card'>
                        <div className='stat-title'>Total Delivered Earnings</div>
                        <div className='stat-value text-green'>₹{deliveredEarnings.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Earnings;
