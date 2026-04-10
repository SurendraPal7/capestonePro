import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
    const { user, loading } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [timeFilter, setTimeFilter] = useState('1m');

    useEffect(() => {
        if (!user || user.role !== 'farmer') return;

        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const { data } = await axios.get('/api/orders/farmerorders', config);
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders for analytics', err);
            }
        };

        fetchOrders();
    }, [user]);

    const chartData = useMemo(() => {
        if (!orders.length) return [];

        const now = new Date();
        let cutoffDate = new Date();

        // Calculate cutoff date based on timeFilter
        switch (timeFilter) {
            case '1m':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case '6m':
                cutoffDate.setMonth(now.getMonth() - 6);
                break;
            case '1y':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            case '2y':
                cutoffDate.setFullYear(now.getFullYear() - 2);
                break;
            case '3y':
                cutoffDate.setFullYear(now.getFullYear() - 3);
                break;
            case '5y':
                cutoffDate.setFullYear(now.getFullYear() - 5);
                break;
            case 'older':
                cutoffDate.setFullYear(now.getFullYear() - 5);
                break;
            default:
                cutoffDate.setMonth(now.getMonth() - 1);
        }

        // Filter orders
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            if (timeFilter === 'older') {
                return orderDate < cutoffDate;
            }
            return orderDate >= cutoffDate && orderDate <= now;
        });

        // Group by Date for graph
        const salesByDate = {};
        filteredOrders.forEach(order => {
            const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: timeFilter !== '1m' ? 'numeric' : undefined });
            if (!salesByDate[dateStr]) {
                salesByDate[dateStr] = 0;
            }
            salesByDate[dateStr] += order.totalPrice || order.totalAmount || 0;
        });

        const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
        
        return sortedDates.map(date => ({
            name: date,
            sales: salesByDate[date],
        }));

    }, [orders, timeFilter]);

    if (loading || !user) return <div className='container'>Loading...</div>;

    if (user.role !== 'farmer') {
        return (
            <DashboardLayout>
                <div className="dashboard-section card">
                    <h2>Analytics</h2>
                    <p>Only sellers can view sales analytics.</p>
                </div>
            </DashboardLayout>
        );
    }

    const totalRevenue = chartData.reduce((acc, curr) => acc + curr.sales, 0);

    return (
        <DashboardLayout>
            <div className="dashboard-section card">
                <div className='section-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Sales Analytics</h2>
                    <select 
                        className='form-control' 
                        style={{ width: 'auto', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                    >
                        <option value="1m">Last 1 Month</option>
                        <option value="6m">Last 6 Months</option>
                        <option value="1y">Last 1 Year</option>
                        <option value="2y">Last 2 Years</option>
                        <option value="3y">Last 3 Years</option>
                        <option value="5y">Last 5 Years</option>
                        <option value="older">Older than 5 Years</option>
                    </select>
                </div>
                
                <div className='stats-grid mb-4'>
                    <div className='stat-card'>
                        <div className='stat-title'>Filtered Revenue</div>
                        <div className='stat-value text-blue'>₹{totalRevenue.toLocaleString()}</div>
                    </div>
                    <div className='stat-card'>
                        <div className='stat-title'>Orders in Period</div>
                        <div className='stat-value text-green'>
                            {timeFilter === 'older' 
                                ? orders.filter(o => new Date(o.createdAt) < new Date(new Date().setFullYear(new Date().getFullYear() - 5))).length
                                : orders.filter(o => new Date(o.createdAt) >= new Date(new Date().setMonth(new Date().getMonth() - parseInt(timeFilter) * (timeFilter.includes('y') ? 12 : 1)))).length
                            }
                        </div>
                    </div>
                </div>

                <div className='chart-container mt-4'>
                    {chartData.length === 0 ? (
                        <div className="text-center py-5 text-gray">No sales data found for the selected time period.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dx={-10} />
                                <Tooltip formatter={(value) => `₹${value}`} />
                                <Area type="monotone" dataKey="sales" stroke="#10b981" fill="#d1fae5" fillOpacity={0.6} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Analytics;
