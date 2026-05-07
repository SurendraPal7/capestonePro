import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { 
    FaUsers, 
    FaTractor, 
    FaStore, 
    FaClipboardList, 
    FaCheckCircle, 
    FaClock, 
    FaTimesCircle,
    FaChartLine,
    FaEye,
    FaCheck,
    FaTimes,
    FaSearch,
    FaFilter
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({});
    const [recentActivity, setRecentActivity] = useState({});
    const [pendingFarmers, setPendingFarmers] = useState([]);
    const [approvedFarmers, setApprovedFarmers] = useState([]);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [farmers, setFarmers] = useState([]);
    const [buyers, setBuyers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [showFarmerModal, setShowFarmerModal] = useState(false);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [showBuyerModal, setShowBuyerModal] = useState(false);

    // Redirect non-admin users
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch admin stats
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                console.log('🔄 Fetching admin data...');
                console.log('Token exists:', !!token);
                console.log('API Base URL:', axios.defaults.baseURL || 'default');

                const [statsRes, pendingRes, approvedRes] = await Promise.all([
                    axios.get('/api/admin/stats', config),
                    axios.get('/api/admin/farmers/pending', config),
                    axios.get('/api/admin/farmers?status=approved&limit=6', config)
                ]);

                console.log('📊 Stats response:', statsRes.data);
                console.log('💰 Total Revenue from API:', statsRes.data.stats.totalRevenue);
                console.log('⏳ Pending farmers:', pendingRes.data);
                console.log('✅ Approved farmers:', approvedRes.data);

                setStats(statsRes.data.stats);
                setRecentActivity(statsRes.data.recentActivity);
                setPendingFarmers(pendingRes.data);
                setApprovedFarmers(approvedRes.data.farmers);
                setLoading(false);
            } catch (error) {
                console.error('❌ Error fetching admin data:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchAdminData();
        }
    }, [user]);

    // Fetch data based on selected tab
    useEffect(() => {
        const fetchTabData = async () => {
            if (selectedTab === 'overview') return;

            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                switch (selectedTab) {
                    case 'farmers':
                        const farmersRes = await axios.get(`/api/admin/farmers?status=${filterStatus}&search=${searchTerm}`, config);
                        setFarmers(farmersRes.data.farmers);
                        break;
                    case 'buyers':
                        const buyersRes = await axios.get(`/api/admin/buyers?search=${searchTerm}`, config);
                        setBuyers(buyersRes.data.buyers);
                        break;
                    case 'orders':
                        const ordersRes = await axios.get(`/api/admin/orders?status=${filterStatus}&search=${searchTerm}`, config);
                        setOrders(ordersRes.data.orders);
                        break;
                }
            } catch (error) {
                console.error('Error fetching tab data:', error);
            }
        };

        fetchTabData();
    }, [selectedTab, filterStatus, searchTerm]);

    const handleApproveFarmer = async (farmerId, notes = '') => {
        console.log('🔄 Starting approval process for farmer:', farmerId);
        
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            console.log('📡 Sending approval request...');
            const response = await axios.put(`/api/admin/farmers/${farmerId}/approve`, { notes }, config);
            console.log('✅ Approval response:', response.data);
            
            // Find the approved farmer from pending list
            const approvedFarmer = pendingFarmers.find(farmer => farmer._id === farmerId);
            console.log('👤 Found farmer to approve:', approvedFarmer);
            
            if (approvedFarmer) {
                // Update the farmer's status for immediate UI update
                const updatedFarmer = {
                    ...approvedFarmer,
                    approvalStatus: 'approved',
                    isApproved: true,
                    approvalDate: new Date()
                };
                
                console.log('🔄 Updating UI state...');
                // Remove from pending and add to approved (at the beginning for recent display)
                setPendingFarmers(prev => {
                    const updated = prev.filter(farmer => farmer._id !== farmerId);
                    console.log('📝 Updated pending farmers:', updated.length);
                    return updated;
                });
                
                setApprovedFarmers(prev => {
                    const updated = [updatedFarmer, ...prev.slice(0, 5)];
                    console.log('📝 Updated approved farmers:', updated.length);
                    return updated;
                });
            }
            
            // Refresh stats and get updated data from server
            console.log('🔄 Refreshing data from server...');
            const [statsRes, approvedRes] = await Promise.all([
                axios.get('/api/admin/stats', config),
                axios.get('/api/admin/farmers?status=approved&limit=6', config)
            ]);
            
            console.log('📊 Updated stats:', statsRes.data.stats);
            console.log('👥 Fresh approved farmers:', approvedRes.data.farmers);
            
            setStats(statsRes.data.stats);
            setApprovedFarmers(approvedRes.data.farmers); // Use fresh data from server
            
            // Show success message with farmer name
            const farmerName = approvedFarmer?.farmName || approvedFarmer?.name || 'Farmer';
            
            // Create a success notification
            const notification = document.createElement('div');
            notification.className = 'approval-success-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">✅</span>
                    <span class="notification-text">${farmerName} moved to Approved Farmers!</span>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
            
            console.log('✅ Approval process completed successfully!');
            
        } catch (error) {
            console.error('❌ Error approving farmer:', error);
            console.error('Error details:', error.response?.data);
            alert(`Error approving farmer: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleViewAllApprovedFarmers = () => {
        setSelectedTab('farmers');
        setFilterStatus('approved');
        setSearchTerm('');
    };

    const handleViewOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Fetch full order details
            const { data } = await axios.get(`/api/admin/orders/${orderId}`, config);
            setSelectedOrder(data);
            setShowOrderModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Error loading order details');
        }
    };

    const handleCloseOrderModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
    };

    const handleViewFarmer = async (farmerId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Fetch full farmer details
            const { data } = await axios.get(`/api/admin/farmers/${farmerId}`, config);
            setSelectedFarmer(data);
            setShowFarmerModal(true);
        } catch (error) {
            console.error('Error fetching farmer details:', error);
            alert('Error loading farmer details');
        }
    };

    const handleCloseFarmerModal = () => {
        setShowFarmerModal(false);
        setSelectedFarmer(null);
    };

    const handleViewBuyer = async (buyerId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Fetch full buyer details
            const { data } = await axios.get(`/api/admin/buyers/${buyerId}`, config);
            setSelectedBuyer(data);
            setShowBuyerModal(true);
        } catch (error) {
            console.error('Error fetching buyer details:', error);
            alert('Error loading buyer details');
        }
    };

    const handleCloseBuyerModal = () => {
        setShowBuyerModal(false);
        setSelectedBuyer(null);
    };

    const handleRejectFarmer = async (farmerId) => {
        const notes = prompt('Please provide a reason for rejection:');
        if (!notes) return;

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`/api/admin/farmers/${farmerId}/reject`, { notes }, config);
            
            // Refresh all farmer data
            const [pendingRes, statsRes] = await Promise.all([
                axios.get('/api/admin/farmers/pending', config),
                axios.get('/api/admin/stats', config)
            ]);
            
            setPendingFarmers(pendingRes.data);
            setStats(statsRes.data.stats);
            
            alert('Farmer rejected');
        } catch (error) {
            console.error('Error rejecting farmer:', error);
            alert('Error rejecting farmer');
        }
    };

    if (loading) {
        return <div className="admin-loading">Loading admin dashboard...</div>;
    }

    if (!user || user.role !== 'admin') {
        return <div className="admin-error">Access denied. Admin privileges required.</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage farms, track operations, and oversee the platform</p>
            </div>

            {/* Navigation Tabs */}
            <div className="admin-nav">
                <button 
                    className={`nav-tab ${selectedTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('overview')}
                >
                    <FaChartLine /> Overview
                </button>
                <button 
                    className={`nav-tab ${selectedTab === 'farmers' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('farmers')}
                >
                    <FaTractor /> Farmers ({stats.totalFarmers})
                </button>
                <button 
                    className={`nav-tab ${selectedTab === 'buyers' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('buyers')}
                >
                    <FaStore /> Buyers ({stats.totalBuyers})
                </button>
                <button 
                    className={`nav-tab ${selectedTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('orders')}
                >
                    <FaClipboardList /> Orders ({stats.totalOrders})
                </button>
            </div>

            {/* Overview Tab */}
            {selectedTab === 'overview' && (
                <div className="admin-content">
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon users">
                                <FaUsers />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.totalUsers}</h3>
                                <p>Total Users</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon farmers">
                                <FaTractor />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.approvedFarmers}</h3>
                                <p>Approved Farmers</p>
                            </div>
                        </div>
                        <div className="stat-card pending">
                            <div className="stat-icon">
                                <FaClock />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.pendingFarmers}</h3>
                                <p>Pending Approvals</p>
                            </div>
                        </div>
                        <div className="stat-card revenue">
                            <div className="stat-icon">
                                <FaChartLine />
                            </div>
                            <div className="stat-info">
                                <h3>₹{stats.totalRevenue?.toLocaleString() || '0'}</h3>
                                <p>Total Revenue</p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Approvals */}
                    {pendingFarmers.length > 0 && (
                        <div className="pending-approvals">
                            <h2>
                                <FaClock style={{ color: '#f59e0b' }} />
                                Pending Farm Approvals ({pendingFarmers.length})
                            </h2>
                            <div className="farmers-grid">
                                {pendingFarmers.map(farmer => (
                                    <div key={farmer._id} className="farmer-approval-card pending">
                                        <div className="farmer-info">
                                            <h4>{farmer.farmName || farmer.name}</h4>
                                            <p><strong>Email:</strong> {farmer.email}</p>
                                            <p><strong>Phone:</strong> {farmer.phone}</p>
                                            <p><strong>Location:</strong> {farmer.location?.city}, {farmer.location?.state}</p>
                                            <p><strong>Applied:</strong> {new Date(farmer.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="farmer-actions">
                                            <button 
                                                className="btn btn-success"
                                                onClick={() => handleApproveFarmer(farmer._id)}
                                            >
                                                <FaCheck /> Approve
                                            </button>
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => handleRejectFarmer(farmer._id)}
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Approved Farmers */}
                    {approvedFarmers.length > 0 && (
                        <div className="approved-farmers">
                            <div className="section-header-clickable" onClick={handleViewAllApprovedFarmers}>
                                <h2>
                                    <FaCheckCircle style={{ color: '#10b981' }} />
                                    Recently Approved Farmers ({stats.approvedFarmers} total)
                                </h2>
                                <button className="view-all-link">
                                    View All <FaEye />
                                </button>
                            </div>
                            <div className="farmers-grid">
                                {approvedFarmers.map(farmer => (
                                    <div key={farmer._id} className="farmer-approval-card approved">
                                        <div className="farmer-info">
                                            <h4>{farmer.farmName || farmer.name}</h4>
                                            <p><strong>Email:</strong> {farmer.email}</p>
                                            <p><strong>Phone:</strong> {farmer.phone}</p>
                                            <p><strong>Location:</strong> {farmer.location?.city}, {farmer.location?.state}</p>
                                            <p><strong>Approved:</strong> {farmer.approvalDate ? new Date(farmer.approvalDate).toLocaleDateString() : 'Recently'}</p>
                                            {farmer.approvedBy && (
                                                <p><strong>Approved by:</strong> Admin</p>
                                            )}
                                        </div>
                                        <div className="farmer-status">
                                            <span className="status-badge approved">
                                                <FaCheckCircle /> Active
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {stats.approvedFarmers > 6 && (
                                <div className="view-all-section">
                                    <button 
                                        className="btn btn-outline"
                                        onClick={handleViewAllApprovedFarmers}
                                    >
                                        View All {stats.approvedFarmers} Approved Farmers
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div className="recent-activity">
                        <div className="activity-section">
                            <h3>Recent Farmer Registrations</h3>
                            <div className="activity-list">
                                {recentActivity.recentFarmers?.map(farmer => (
                                    <div key={farmer._id} className="activity-item">
                                        <div className="activity-info">
                                            <strong>{farmer.farmName || farmer.name}</strong>
                                            <span className={`status ${farmer.approvalStatus}`}>
                                                {farmer.approvalStatus}
                                            </span>
                                        </div>
                                        <span className="activity-date">
                                            {new Date(farmer.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="activity-section">
                            <h3>Recent Orders</h3>
                            <div className="activity-list">
                                {recentActivity.recentOrders?.map(order => (
                                    <div key={order._id} className="activity-item">
                                        <div className="activity-info">
                                            <strong>Order #{order._id.slice(-6)}</strong>
                                            <span>₹{order.totalPrice}</span>
                                        </div>
                                        <span className="activity-date">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Farmers Tab */}
            {selectedTab === 'farmers' && (
                <div className="admin-content">
                    <div className="content-header">
                        <div className="search-filter">
                            <div className="search-box">
                                <FaSearch />
                                <input 
                                    type="text" 
                                    placeholder="Search farmers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Farm Name</th>
                                    <th>Owner</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {farmers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            {searchTerm || filterStatus !== 'all' 
                                                ? `No farmers found matching "${searchTerm}" with status "${filterStatus}"`
                                                : 'No farmers found'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    farmers.map(farmer => (
                                        <tr key={farmer._id}>
                                            <td>{farmer.farmName || 'N/A'}</td>
                                            <td>{farmer.name}</td>
                                            <td>{farmer.email}</td>
                                            <td>{farmer.location?.city}, {farmer.location?.state}</td>
                                            <td>
                                                <span className={`status-badge ${farmer.approvalStatus}`}>
                                                    {farmer.approvalStatus}
                                                </span>
                                            </td>
                                            <td>{new Date(farmer.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => handleViewFarmer(farmer._id)}
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    {farmer.approvalStatus === 'pending' && (
                                                        <>
                                                            <button 
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleApproveFarmer(farmer._id)}
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleRejectFarmer(farmer._id)}
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Buyers Tab */}
            {selectedTab === 'buyers' && (
                <div className="admin-content">
                    <div className="content-header">
                        <div className="search-box">
                            <FaSearch />
                            <input 
                                type="text" 
                                placeholder="Search buyers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Business Name</th>
                                    <th>Owner</th>
                                    <th>Email</th>
                                    <th>Orders</th>
                                    <th>Total Spent</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buyers.map(buyer => (
                                    <tr key={buyer._id}>
                                        <td>{buyer.businessName || 'N/A'}</td>
                                        <td>{buyer.name}</td>
                                        <td>{buyer.email}</td>
                                        <td>{buyer.orderCount}</td>
                                        <td>₹{buyer.totalSpent?.toLocaleString()}</td>
                                        <td>{new Date(buyer.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleViewBuyer(buyer._id)}
                                            >
                                                <FaEye /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {selectedTab === 'orders' && (
                <div className="admin-content">
                    <div className="content-header">
                        <div className="search-filter">
                            <div className="search-box">
                                <FaSearch />
                                <input 
                                    type="text" 
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Buyer</th>
                                    <th>Farmer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            {searchTerm || filterStatus !== 'all' 
                                                ? `No orders found matching "${searchTerm}" with status "${filterStatus}"`
                                                : 'No orders found'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order._id}>
                                            <td>#{order._id.slice(-6)}</td>
                                            <td>{order.buyer?.name}</td>
                                            <td>{order.farmer?.farmName || order.farmer?.name}</td>
                                            <td>₹{order.totalPrice}</td>
                                            <td>
                                                <span className={`status-badge ${order.status}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleViewOrder(order._id)}
                                                >
                                                    <FaEye /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="modal-overlay" onClick={handleCloseOrderModal}>
                    <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details</h2>
                            <button className="modal-close" onClick={handleCloseOrderModal}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {/* Order Info */}
                            <div className="order-info-grid">
                                <div className="info-card">
                                    <h3>Order Information</h3>
                                    <div className="info-row">
                                        <span className="label">Order ID:</span>
                                        <span className="value">#{selectedOrder._id.slice(-8)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Status:</span>
                                        <span className={`status-badge ${selectedOrder.status}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Order Date:</span>
                                        <span className="value">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Payment Method:</span>
                                        <span className="value">{selectedOrder.paymentMethod}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Payment Status:</span>
                                        <span className={`status-badge ${selectedOrder.isPaid ? 'approved' : 'pending'}`}>
                                            {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>Buyer Information</h3>
                                    <div className="info-row">
                                        <span className="label">Name:</span>
                                        <span className="value">{selectedOrder.buyer?.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Email:</span>
                                        <span className="value">{selectedOrder.buyer?.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Phone:</span>
                                        <span className="value">{selectedOrder.buyer?.phone || 'N/A'}</span>
                                    </div>
                                    {selectedOrder.buyer?.businessName && (
                                        <div className="info-row">
                                            <span className="label">Business:</span>
                                            <span className="value">{selectedOrder.buyer.businessName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="info-card">
                                    <h3>Farmer Information</h3>
                                    <div className="info-row">
                                        <span className="label">Farm Name:</span>
                                        <span className="value">{selectedOrder.farmer?.farmName || selectedOrder.farmer?.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Email:</span>
                                        <span className="value">{selectedOrder.farmer?.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Phone:</span>
                                        <span className="value">{selectedOrder.farmer?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Location:</span>
                                        <span className="value">
                                            {selectedOrder.farmer?.location?.city}, {selectedOrder.farmer?.location?.state}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>Shipping Address</h3>
                                    <div className="info-row">
                                        <span className="label">Address:</span>
                                        <span className="value">{selectedOrder.shippingAddress?.address}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">City:</span>
                                        <span className="value">{selectedOrder.shippingAddress?.city}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Postal Code:</span>
                                        <span className="value">{selectedOrder.shippingAddress?.postalCode}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Country:</span>
                                        <span className="value">{selectedOrder.shippingAddress?.country}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="order-items-section">
                                <h3>Order Items</h3>
                                <div className="items-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.orderItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div className="product-info-cell">
                                                            {item.image && (
                                                                <img src={item.image} alt={item.name} className="product-thumb" />
                                                            )}
                                                            <span>{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>{item.product?.category || 'N/A'}</td>
                                                    <td>{item.qty} {item.product?.unit || 'units'}</td>
                                                    <td>₹{item.price}</td>
                                                    <td>₹{item.price * item.qty}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="4" className="text-right"><strong>Total Amount:</strong></td>
                                                <td><strong>₹{selectedOrder.totalPrice}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={handleCloseOrderModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Farmer Details Modal */}
            {showFarmerModal && selectedFarmer && (
                <div className="modal-overlay" onClick={handleCloseFarmerModal}>
                    <div className="modal-content farmer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Farmer Details</h2>
                            <button className="modal-close" onClick={handleCloseFarmerModal}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {/* Farmer Info Grid */}
                            <div className="order-info-grid">
                                <div className="info-card">
                                    <h3>Basic Information</h3>
                                    <div className="info-row">
                                        <span className="label">Farm Name:</span>
                                        <span className="value">{selectedFarmer.farmName || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Owner Name:</span>
                                        <span className="value">{selectedFarmer.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Email:</span>
                                        <span className="value">{selectedFarmer.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Phone:</span>
                                        <span className="value">{selectedFarmer.phone || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Role:</span>
                                        <span className="value">{selectedFarmer.role}</span>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>Location Details</h3>
                                    <div className="info-row">
                                        <span className="label">Address:</span>
                                        <span className="value">{selectedFarmer.location?.address || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">City:</span>
                                        <span className="value">{selectedFarmer.location?.city || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">State:</span>
                                        <span className="value">{selectedFarmer.location?.state || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Postal Code:</span>
                                        <span className="value">{selectedFarmer.location?.postalCode || 'N/A'}</span>
                                    </div>
                                    {selectedFarmer.location?.coordinates && selectedFarmer.location.coordinates.length === 2 && (
                                        <div className="info-row">
                                            <span className="label">Full Location:</span>
                                            <span className="value">
                                                {selectedFarmer.location.city && selectedFarmer.location.state 
                                                    ? `${selectedFarmer.location.city}, ${selectedFarmer.location.state}${selectedFarmer.location.postalCode ? ` - ${selectedFarmer.location.postalCode}` : ''}`
                                                    : selectedFarmer.location.address || 'Location not specified'
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="info-card">
                                    <h3>Approval Status</h3>
                                    <div className="info-row">
                                        <span className="label">Status:</span>
                                        <span className={`status-badge ${selectedFarmer.approvalStatus}`}>
                                            {selectedFarmer.approvalStatus}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Is Approved:</span>
                                        <span className="value">{selectedFarmer.isApproved ? 'Yes' : 'No'}</span>
                                    </div>
                                    {selectedFarmer.approvalDate && (
                                        <div className="info-row">
                                            <span className="label">Approval Date:</span>
                                            <span className="value">{new Date(selectedFarmer.approvalDate).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedFarmer.approvedBy && (
                                        <div className="info-row">
                                            <span className="label">Approved By:</span>
                                            <span className="value">Admin</span>
                                        </div>
                                    )}
                                    {selectedFarmer.approvalNotes && (
                                        <div className="info-row">
                                            <span className="label">Notes:</span>
                                            <span className="value">{selectedFarmer.approvalNotes}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="info-card">
                                    <h3>Account Information</h3>
                                    <div className="info-row">
                                        <span className="label">User ID:</span>
                                        <span className="value">#{selectedFarmer._id.slice(-8)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Joined Date:</span>
                                        <span className="value">{new Date(selectedFarmer.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Last Updated:</span>
                                        <span className="value">{new Date(selectedFarmer.updatedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Total Products:</span>
                                        <span className="value">{selectedFarmer.productCount || 0}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Total Orders:</span>
                                        <span className="value">{selectedFarmer.orderCount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Products Section */}
                            {selectedFarmer.products && selectedFarmer.products.length > 0 && (
                                <div className="order-items-section">
                                    <h3>Products ({selectedFarmer.products.length})</h3>
                                    <div className="items-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Product Name</th>
                                                    <th>Category</th>
                                                    <th>Price</th>
                                                    <th>Stock</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedFarmer.products.map((product) => (
                                                    <tr key={product._id}>
                                                        <td>
                                                            <div className="product-info-cell">
                                                                {product.image && (
                                                                    <img src={product.image} alt={product.name} className="product-thumb" />
                                                                )}
                                                                <span>{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{product.category}</td>
                                                        <td>₹{product.price}/{product.unit}</td>
                                                        <td>{product.countInStock} {product.unit}</td>
                                                        <td>
                                                            <span className={`status-badge ${product.countInStock > 0 ? 'approved' : 'cancelled'}`}>
                                                                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            {selectedFarmer.approvalStatus === 'pending' && (
                                <>
                                    <button 
                                        className="btn btn-success"
                                        onClick={() => {
                                            handleCloseFarmerModal();
                                            handleApproveFarmer(selectedFarmer._id);
                                        }}
                                    >
                                        <FaCheck /> Approve Farmer
                                    </button>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => {
                                            handleCloseFarmerModal();
                                            handleRejectFarmer(selectedFarmer._id);
                                        }}
                                    >
                                        <FaTimes /> Reject Farmer
                                    </button>
                                </>
                            )}
                            <button className="btn btn-outline" onClick={handleCloseFarmerModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Buyer Details Modal */}
            {showBuyerModal && selectedBuyer && (
                <div className="modal-overlay" onClick={handleCloseBuyerModal}>
                    <div className="modal-content buyer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Buyer Details</h2>
                            <button className="modal-close" onClick={handleCloseBuyerModal}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {/* Buyer Info Grid */}
                            <div className="order-info-grid">
                                <div className="info-card">
                                    <h3>Basic Information</h3>
                                    <div className="info-row">
                                        <span className="label">Business Name:</span>
                                        <span className="value">{selectedBuyer.businessName || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Owner Name:</span>
                                        <span className="value">{selectedBuyer.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Email:</span>
                                        <span className="value">{selectedBuyer.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Phone:</span>
                                        <span className="value">{selectedBuyer.phone || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Role:</span>
                                        <span className="value">{selectedBuyer.role}</span>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>Location Details</h3>
                                    <div className="info-row">
                                        <span className="label">Address:</span>
                                        <span className="value">{selectedBuyer.location?.address || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">City:</span>
                                        <span className="value">{selectedBuyer.location?.city || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">State:</span>
                                        <span className="value">{selectedBuyer.location?.state || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Postal Code:</span>
                                        <span className="value">{selectedBuyer.location?.postalCode || 'N/A'}</span>
                                    </div>
                                    {selectedBuyer.location?.coordinates && selectedBuyer.location.coordinates.length === 2 && (
                                        <div className="info-row">
                                            <span className="label">Full Location:</span>
                                            <span className="value">
                                                {selectedBuyer.location.city && selectedBuyer.location.state 
                                                    ? `${selectedBuyer.location.city}, ${selectedBuyer.location.state}${selectedBuyer.location.postalCode ? ` - ${selectedBuyer.location.postalCode}` : ''}`
                                                    : selectedBuyer.location.address || 'Location not specified'
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="info-card">
                                    <h3>Purchase Statistics</h3>
                                    <div className="info-row">
                                        <span className="label">Total Orders:</span>
                                        <span className="value">{selectedBuyer.orderCount || 0}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Total Spent:</span>
                                        <span className="value">₹{selectedBuyer.totalSpent?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Average Order:</span>
                                        <span className="value">
                                            ₹{selectedBuyer.orderCount > 0 
                                                ? Math.round(selectedBuyer.totalSpent / selectedBuyer.orderCount).toLocaleString() 
                                                : '0'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Pending Orders:</span>
                                        <span className="value">{selectedBuyer.pendingOrders || 0}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Completed Orders:</span>
                                        <span className="value">{selectedBuyer.completedOrders || 0}</span>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>Account Information</h3>
                                    <div className="info-row">
                                        <span className="label">User ID:</span>
                                        <span className="value">#{selectedBuyer._id.slice(-8)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Joined Date:</span>
                                        <span className="value">{new Date(selectedBuyer.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Last Updated:</span>
                                        <span className="value">{new Date(selectedBuyer.updatedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Last Order:</span>
                                        <span className="value">
                                            {selectedBuyer.lastOrderDate 
                                                ? new Date(selectedBuyer.lastOrderDate).toLocaleDateString()
                                                : 'No orders yet'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Account Status:</span>
                                        <span className={`status-badge approved`}>
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders Section */}
                            {selectedBuyer.recentOrders && selectedBuyer.recentOrders.length > 0 && (
                                <div className="order-items-section">
                                    <h3>Recent Orders ({selectedBuyer.recentOrders.length})</h3>
                                    <div className="items-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Farmer</th>
                                                    <th>Items</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedBuyer.recentOrders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>#{order._id.slice(-6)}</td>
                                                        <td>{order.farmer?.farmName || order.farmer?.name || 'N/A'}</td>
                                                        <td>{order.orderItems?.length || 0} items</td>
                                                        <td>₹{order.totalPrice?.toLocaleString()}</td>
                                                        <td>
                                                            <span className={`status-badge ${order.status}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline"
                                                                onClick={() => {
                                                                    handleCloseBuyerModal();
                                                                    handleViewOrder(order._id);
                                                                }}
                                                            >
                                                                <FaEye /> View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={handleCloseBuyerModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;