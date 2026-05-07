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

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, role, phone, address, city, state, zip, farmName, businessName } = formData;

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
            <div className='auth-content'>
                <div className='auth-card register-card'>
                    <div className='auth-header'>
                        <div className='auth-logo'>
                            <FaSeedling />
                        </div>
                        <h2>Join FarmDirect Community</h2>
                        <p>Connect with fresh, local agriculture</p>
                    </div>

                    <div className='role-selector'>
                        <div className='role-tabs'>
                            <button
                                type='button'
                                className={`role-tab ${role === 'buyer' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                            >
                                <FaStore className='role-icon' />
                                <span>I'm a Buyer</span>
                                <small>Restaurant, Hotel, Consumer</small>
                            </button>
                            <button
                                type='button'
                                className={`role-tab ${role === 'farmer' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, role: 'farmer' }))}
                            >
                                <FaTractor className='role-icon' />
                                <span>I'm a Farmer</span>
                                <small>Grow & Sell Fresh Produce</small>
                            </button>
                        </div>
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
                                <input 
                                    type='text' 
                                    className='input-field' 
                                    name='city' 
                                    value={city} 
                                    onChange={onChange} 
                                    placeholder='Enter your city'
                                    required 
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
    );
};

export default Register;
