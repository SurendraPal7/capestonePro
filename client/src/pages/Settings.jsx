import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';

const Settings = () => {
    const { user, setUser } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        farmName: '',
        farmImage: '',
        businessName: '',
        password: '',
    });
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                farmName: user.farmName || '',
                farmImage: user.farmImage || '',
                businessName: user.businessName || '',
                password: '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Filter out empty password
            const updateData = { ...formData };
            if (!updateData.password) delete updateData.password;
            
            const { data } = await axios.put('/api/auth/profile', updateData, config);
            
            setUser({ ...user, ...data });
            setMessage('Profile updated successfully!');
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        }
    };

    return (
        <DashboardLayout>
            <div className="dashboard-section card" style={{ maxWidth: '800px' }}>
                <div className='section-header'>
                    <h2>Account Settings</h2>
                </div>
                
                {message && <div className="alert alert-success" style={{ padding:'1rem', background:'#d1fae5', color:'#065f46', marginBottom:'1rem', borderRadius:'6px' }}>{message}</div>}
                {error && <div className="alert alert-danger" style={{ padding:'1rem', background:'#fee2e2', color:'#b91c1c', marginBottom:'1rem', borderRadius:'6px' }}>{error}</div>}
                
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            className="form-control" 
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius:'6px' }}
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            className="form-control" 
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius:'6px' }}
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone Number</label>
                        <input 
                            type="text" 
                            name="phone" 
                            className="form-control" 
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius:'6px' }}
                            value={formData.phone} 
                            onChange={handleChange} 
                        />
                    </div>

                    {user?.role === 'farmer' && (
                        <>
                            <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Farm Name</label>
                                <input 
                                    type="text" 
                                    name="farmName" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius:'6px' }}
                                    value={formData.farmName} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Farm Image (URL or Upload)</label>
                                <input 
                                    type="text" 
                                    name="farmImage" 
                                    className="form-control" 
                                    placeholder="Image URL or upload below"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius:'6px', marginBottom: '0.5rem' }}
                                    value={formData.farmImage} 
                                    onChange={handleChange} 
                                />
                                <input type='file' accept='image/*' onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const uploadData = new FormData();
                                        uploadData.append('image', file);
                                        try {
                                            const { data } = await axios.post('/api/upload', uploadData);
                                            setFormData(prev => ({ ...prev, farmImage: `${axios.defaults.baseURL}${data.image}` }));
                                        } catch (err) {
                                            console.error(err);
                                            alert('Image upload failed');
                                        }
                                    }
                                }} />
                            </div>
                        </>
                    )}
                    
                    {user?.role === 'buyer' && (
                        <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Business Name</label>
                            <input 
                                type="text" 
                                name="businessName" 
                                className="form-control" 
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius:'6px' }}
                                value={formData.businessName} 
                                onChange={handleChange} 
                            />
                        </div>
                    )}

                    <div className="form-group mb-4" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>New Password (leave blank to keep current)</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="form-control" 
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius:'6px' }}
                            value={formData.password} 
                            onChange={handleChange} 
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontWeight: '600', borderRadius: '6px' }}>
                        Update Profile
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
