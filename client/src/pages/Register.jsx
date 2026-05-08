import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaSeedling, FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaTractor, FaStore, FaEye, FaEyeSlash, FaUpload } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') || 'buyer';
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: initialRole,
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        farmName: '',
        businessName: '',
        farmImage: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [stats, setStats] = useState({
        activeFarmers: { count: 0, display: '0+' },
        happyBuyers: { count: 0, display: '0+' },
        ordersDelivered: { count: 0, display: '0+' }
    });

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, role, phone, address, city, state, zip, farmName, businessName } = formData;

    // Fetch platform statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('/api/auth/stats');
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                // Keep default values if fetch fails
            }
        };

        fetchStats();
        
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'farmer') navigate('/dashboard');
            else navigate('/marketplace');
        }
    }, [user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setDetectingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Use OpenStreetMap Nominatim API for reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                    );
                    const data = await response.json();
                    
                    if (data && data.address) {
                        const addr = data.address;
                        
                        setFormData(prev => ({
                            ...prev,
                            city: addr.city || addr.town || addr.village || addr.county || '',
                            state: addr.state || '',
                            zip: addr.postcode || '',
                            address: `${addr.road || ''} ${addr.suburb || ''}`.trim() || addr.neighbourhood || ''
                        }));
                        
                        alert('Location detected successfully!');
                    } else {
                        alert('Could not determine address from location');
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    alert('Failed to get address details. Please enter manually.');
                } finally {
                    setDetectingLocation(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setDetectingLocation(false);
                
                let errorMessage = 'Could not detect location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access in your browser.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                }
                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageUploading(true);
            const uploadData = new FormData();
            uploadData.append('image', file);
            try {
                const { data } = await axios.post('/api/upload', uploadData);
                setFormData(prev => ({ ...prev, farmImage: `${data.image}` }));
            } catch (err) {
                console.error(err);
                alert('Image upload failed');
            } finally {
                setImageUploading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                name,
                email,
                password,
                role,
                phone,
                location: { address, city, state, zip },
                farmName: role === 'farmer' ? farmName : undefined,
                businessName: role === 'buyer' ? businessName : undefined,
                farmImage: role === 'farmer' ? formData.farmImage : undefined,
            };
            await register(payload);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='auth-container register-container'>
            <div className='auth-background'></div>
            <div className='auth-content register-content'>
                {/* Left Side - Content */}
                <div className='register-info-section'>
                    <div className='register-info-content'>
                        <div className='info-header'>
                            <div className='info-logo'>
                                <FaSeedling />
                            </div>
                            <h1>Join FarmDirect Community</h1>
                            <p className='info-subtitle'>Connect directly with local agriculture</p>
                        </div>

                        <div className='info-features'>
                            {role === 'farmer' ? (
                                <>
                                    <div className='feature-item'>
                                        <div className='feature-icon'>
                                            <FaTractor />
                                        </div>
                                        <div className='feature-content'>
                                            <h3>Sell Your Produce</h3>
                                            <p>Reach buyers directly and get better prices for your fresh, organic produce</p>
                                        </div>
                                    </div>
                                    <div className='feature-item'>
                                        <div className='feature-icon'>
                                            <FaStore />
                                        </div>
                                        <div className='feature-content'>
                                            <h3>Manage Your Farm</h3>
                                            <p>Easy-to-use dashboard to manage products, orders, and track earnings</p>
                                        </div>
                                    </div>
                                    <div className='feature-item'>
                                        <div className='feature-icon'>
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className='feature-content'>
                                            <h3>Local Marketplace</h3>
                                            <p>Connect with nearby buyers and build lasting business relationships</p>
                                        </div>
                                    </div>
                                    <div className='feature-item'>
                                        <div className='feature-icon'>
                                            <FaSeedling />
                                        </div>
                                        <div className='feature-content'>
                                            <h3>Grow Your Business</h3>
                                            <p>Access analytics, insights, and tools to expand your farming business</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className='feature-item'>
                                        <div className='feature-icon'>
                                            <FaSeedling />
                                        </div>
                                        <div className='feature-content'>
                                            <h3>Fresh & Organic</h3>
                                            <p>Get farm-fresh, organic produce delivered directly from local farmers</p>
                                        </div>
                                    </div>
                                    <div className='feature-item'>
                                        <div className='feature-icon'>
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className='feature-content'>
                                            <h3>Support Local Farms</h3>
                                            <p>Discover and support farmers in your area while getting the freshest produce</p>
                                        </div>
                                    </div>
                                    <div className='feature-item'>
                                        <div className='feature-icon'>
                                            <FaStore />
                                        </div>
                                        <div className='feature-content'>
                                            <h3>Easy Ordering</h3>
                                            <p>Browse products, place orders, and track deliveries all in one place</p>
                                        </div>
                                    </div>
                                    <div className='feature-item'>
                                        <div className='feature-icon'>
                                            <FaUser />
                                        </div>
                                        <div className='feature-content'>
                                            <h3>Quality Guaranteed</h3>
                                            <p>Direct from farm to your table - no middlemen, just fresh quality produce</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className='info-stats'>
                            <div className='stat-item'>
                                <h3>{stats.activeFarmers.display}</h3>
                                <p>Active Farmers</p>
                            </div>
                            <div className='stat-item'>
                                <h3>{stats.happyBuyers.display}</h3>
                                <p>Happy Buyers</p>
                            </div>
                            <div className='stat-item'>
                                <h3>{stats.ordersDelivered.display}</h3>
                                <p>Orders Delivered</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className='register-form-section'>
                    <div className='auth-card register-card'>
                        {/* Toggle Switch at the very top - Large Style */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            marginBottom: '2rem',
                            marginTop: '0'
                        }}>
                            <div style={{
                                position: 'relative',
                                display: 'inline-flex',
                                background: 'white',
                                borderRadius: '60px',
                                padding: '8px',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                                width: '100%',
                                maxWidth: '500px',
                                border: '2px solid #e5e7eb'
                            }}>
                                <button
                                    type='button'
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                                    style={{
                                        position: 'relative',
                                        zIndex: 2,
                                        flex: 1,
                                        padding: '1.25rem 2rem',
                                        border: 'none',
                                        background: role === 'buyer' ? 'linear-gradient(135deg, #3a7d44 0%, #2d6235 100%)' : 'transparent',
                                        borderRadius: '60px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        fontWeight: 700,
                                        fontSize: '1.25rem',
                                        color: role === 'buyer' ? 'white' : '#4b5563',
                                        transition: 'all 0.3s ease',
                                        boxShadow: role === 'buyer' ? '0 4px 12px rgba(58, 125, 68, 0.4)' : 'none',
                                        transform: role === 'buyer' ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <span style={{ fontSize: '1.75rem' }}>🛒</span>
                                    <span>Buyer</span>
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'farmer' }))}
                                    style={{
                                        position: 'relative',
                                        zIndex: 2,
                                        flex: 1,
                                        padding: '1.25rem 2rem',
                                        border: 'none',
                                        background: role === 'farmer' ? 'linear-gradient(135deg, #3a7d44 0%, #2d6235 100%)' : 'transparent',
                                        borderRadius: '60px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        fontWeight: 700,
                                        fontSize: '1.25rem',
                                        color: role === 'farmer' ? 'white' : '#4b5563',
                                        transition: 'all 0.3s ease',
                                        boxShadow: role === 'farmer' ? '0 4px 12px rgba(58, 125, 68, 0.4)' : 'none',
                                        transform: role === 'farmer' ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <span style={{ fontSize: '1.75rem' }}>👨‍🌾</span>
                                    <span>Farmer</span>
                                </button>
                            </div>
                        </div>

                        <div className='auth-header' style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h2>Create Your Account</h2>
                            <p>Join FarmDirect as a {role === 'buyer' ? '🛒 Buyer' : '👨‍🌾 Farmer'}</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className='auth-form register-form'>
                            <div className='form-row'>
                                <div className='form-group'>
                                    <label className='form-label'>
                                        <FaUser className='label-icon' />
                                        Full Name
                                    </label>
                                    <input 
                                        type='text' 
                                        className='input-field' 
                                        name='name' 
                                        value={name} 
                                        onChange={onChange} 
                                        placeholder='Enter your full name'
                                        required 
                                    />
                                </div>
                                <div className='form-group'>
                                    <label className='form-label'>
                                        <FaEnvelope className='label-icon' />
                                        Email Address
                                    </label>
                                    <input 
                                        type='email' 
                                        className='input-field' 
                                        name='email' 
                                        value={email} 
                                        onChange={onChange} 
                                        placeholder='Enter your email'
                                        required 
                                    />
                                </div>
                            </div>

                            {role === 'farmer' ? (
                                <div className='form-group'>
                                    <label className='form-label'>
                                        <FaTractor className='label-icon' />
                                        Farm Name
                                    </label>
                                    <input 
                                        type='text' 
                                        className='input-field' 
                                        name='farmName' 
                                        value={farmName} 
                                        onChange={onChange} 
                                        placeholder='Enter your farm name'
                                        required 
                                    />
                                </div>
                            ) : (
                                <div className='form-group'>
                                    <label className='form-label'>
                                        <FaStore className='label-icon' />
                                        Business Name
                                    </label>
                                    <input 
                                        type='text' 
                                        className='input-field' 
                                        name='businessName' 
                                        value={businessName} 
                                        onChange={onChange} 
                                        placeholder='Restaurant, hotel, or business name'
                                        required 
                                    />
                                </div>
                            )}

                            {role === 'farmer' && (
                                <div className='form-group'>
                                    <label className='form-label'>
                                        <FaUpload className='label-icon' />
                                        Farm Image (Optional)
                                    </label>
                                    <div className='file-upload-wrapper'>
                                        <input 
                                            type='text' 
                                            className='input-field' 
                                            name='farmImage' 
                                            value={formData.farmImage} 
                                            onChange={onChange} 
                                            placeholder='Image URL or upload below'
                                            readOnly={imageUploading}
                                        />
                                        <div className='file-upload'>
                                            <input 
                                                type='file' 
                                                accept='image/*' 
                                                onChange={handleImageUpload}
                                                disabled={imageUploading}
                                                id='farm-image-upload'
                                            />
                                            <label htmlFor='farm-image-upload' className='file-upload-label'>
                                                {imageUploading ? 'Uploading...' : 'Choose File'}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className='form-row'>
                                <div className='form-group'>
                                    <label className='form-label'>
                                        <FaPhone className='label-icon' />
                                        Phone Number
                                    </label>
                                    <input 
                                        type='tel' 
                                        className='input-field' 
                                        name='phone' 
                                        value={phone} 
                                        onChange={onChange} 
                                        placeholder='Enter phone number'
                                        required 
                                    />
                                </div>
                                <div className='form-group'>
                                    <label className='form-label'>
                                        <FaMapMarkerAlt className='label-icon' />
                                        City
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            type='text' 
                                            className='input-field' 
                                            name='city' 
                                            value={city} 
                                            onChange={onChange} 
                                            placeholder='Enter your city'
                                            required 
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type='button'
                                            className='btn btn-outline'
                                            onClick={handleDetectLocation}
                                            disabled={detectingLocation}
                                            style={{ 
                                                whiteSpace: 'nowrap',
                                                padding: '0.75rem 1rem',
                                                fontSize: '0.9rem'
                                            }}
                                            title='Detect my location automatically'
                                        >
                                            {detectingLocation ? (
                                                <>🔄 Detecting...</>
                                            ) : (
                                                <>📍 Detect</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Additional location fields - auto-filled by detect button */}
                            <div className='form-row'>
                                <div className='form-group'>
                                    <label className='form-label'>State</label>
                                    <input 
                                        type='text' 
                                        className='input-field' 
                                        name='state' 
                                        value={state} 
                                        onChange={onChange} 
                                        placeholder='State (auto-filled)'
                                    />
                                </div>
                                <div className='form-group'>
                                    <label className='form-label'>Address</label>
                                    <input 
                                        type='text' 
                                        className='input-field' 
                                        name='address' 
                                        value={address} 
                                        onChange={onChange} 
                                        placeholder='Street address (auto-filled)'
                                    />
                                </div>
                                <div className='form-group'>
                                    <label className='form-label'>ZIP Code</label>
                                    <input 
                                        type='text' 
                                        className='input-field' 
                                        name='zip' 
                                        value={zip} 
                                        onChange={onChange} 
                                        placeholder='Postal code (auto-filled)'
                                    />
                                </div>
                            </div>
                            
                            <div className='form-group'>
                                <label className='form-label'>
                                    <FaLock className='label-icon' />
                                    Password
                                </label>
                                <div className='password-input-wrapper'>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        className='input-field' 
                                        name='password' 
                                        value={password} 
                                        onChange={onChange} 
                                        placeholder='Create a strong password'
                                        required 
                                    />
                                    <button
                                        type='button'
                                        className='password-toggle'
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className='terms-agreement'>
                                <label className='checkbox-label'>
                                    <input type='checkbox' required />
                                    <span className='checkmark'></span>
                                    I agree to the <Link to='#'>Terms of Service</Link> and <Link to='#'>Privacy Policy</Link>
                                </label>
                            </div>

                            <button 
                                type='submit' 
                                className={`btn btn-primary btn-block ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : `Join as ${role === 'farmer' ? 'Farmer' : 'Buyer'}`}
                            </button>
                        </form>
                        
                        <div className='auth-footer'>
                            <p>Already have an account? <Link to='/login' className='auth-link'>Sign in here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
