import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaStore, FaEdit, FaSave, FaTimes, FaShoppingBag, FaHeart } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Populate form with user data
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            businessName: user.businessName || ''
        });

        // Fetch order statistics
        fetchOrderStats();
    }, [user, navigate]);

    const fetchOrderStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/orders/myorders', config);
            
            const totalOrders = data.length;
            const totalSpent = data.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
            const pendingOrders = data.filter(order => 
                ['Pending', 'Confirmed', 'Shipped'].includes(order.status)
            ).length;

            setOrderStats({ totalOrders, totalSpent, pendingOrders });
        } catch (error) {
            console.error('Error fetching order stats:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const updateData = {
                name: formData.name,
                phone: formData.phone,
                businessName: formData.businessName
            };

            const { data } = await axios.put('/api/auth/profile', updateData, config);
            
            // Update context with new user data
            if (updateUser) {
                updateUser(data);
            }

            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original user data
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            businessName: user.businessName || ''
        });
        setIsEditing(false);
    };

    if (!user) {
        return <div className="profile-loading">Loading...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <FaUser />
                    </div>
                    <div className="profile-header-info">
                        <h1>{user.name}</h1>
                        <p className="profile-role">
                            {user.role === 'buyer' ? '🛒 Buyer Account' : '🌾 Farmer Account'}
                        </p>
                        <p className="profile-member-since">
                            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                            })}
                        </p>
                    </div>
                    {!isEditing && (
                        <button 
                            className="btn btn-primary edit-profile-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <FaEdit /> Edit Profile
                        </button>
                    )}
                </div>

                {/* Order Statistics */}
                {user.role === 'buyer' && (
                    <div className="profile-stats">
                        <div className="stat-card">
                            <div className="stat-icon orders">
                                <FaShoppingBag />
                            </div>
                            <div className="stat-info">
                                <h3>{orderStats.totalOrders}</h3>
                                <p>Total Orders</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon spent">
                                <FaHeart />
                            </div>
                            <div className="stat-info">
                                <h3>₹{orderStats.totalSpent.toLocaleString()}</h3>
                                <p>Total Spent</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon pending">
                                <FaShoppingBag />
                            </div>
                            <div className="stat-info">
                                <h3>{orderStats.pendingOrders}</h3>
                                <p>Active Orders</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Form */}
                <div className="profile-content">
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-section">
                            <h2>Personal Information</h2>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <FaUser className="label-icon" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input-field"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FaEnvelope className="label-icon" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input-field"
                                        value={formData.email}
                                        disabled
                                        title="Email cannot be changed"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <FaPhone className="label-icon" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="input-field"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {user.role === 'buyer' && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaStore className="label-icon" />
                                            Business Name
                                        </label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            className="input-field"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>



                        {isEditing && (
                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    <FaSave /> {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
