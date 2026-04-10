import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'buyer', // default
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        farmName: '',
        businessName: '',
        farmImage: '',
    });

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, role, phone, address, city, state, zip, farmName, businessName } = formData;

    useEffect(() => {
        if (user) {
            if (user.role === 'farmer') navigate('/dashboard');
            else navigate('/marketplace');
        }
    }, [user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        }
    };

    return (
        <div className='auth-container'>
            <div className='auth-card card' style={{ maxWidth: '600px' }}>
                <h2>Create Account</h2>
                <p>Join our community today</p>
                <form onSubmit={handleSubmit}>
                    <div className='form-row'>
                        <div className='form-group'>
                            <label className='form-label'>Full Name</label>
                            <input type='text' className='input-field' name='name' value={name} onChange={onChange} required />
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>Email</label>
                            <input type='email' className='input-field' name='email' value={email} onChange={onChange} required />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>I am a...</label>
                        <select className='input-field' name='role' value={role} onChange={onChange}>
                            <option value='buyer'>Restaurant/Hotel Owner (Buyer)</option>
                            <option value='farmer'>Farmer (Seller)</option>
                        </select>
                    </div>

                    {role === 'farmer' ? (
                        <>
                            <div className='form-group'>
                                <label className='form-label'>Farm Name</label>
                                <input type='text' className='input-field' name='farmName' value={formData.farmName} onChange={onChange} required />
                            </div>
                            <div className='form-group'>
                                <label className='form-label'>Farm Image (Optional)</label>
                                <input type='text' className='input-field' name='farmImage' value={formData.farmImage} onChange={onChange} placeholder='Image URL or upload below' style={{ marginBottom: '0.5rem' }} />
                                <input type='file' accept='image/*' onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const uploadData = new FormData();
                                        uploadData.append('image', file);
                                        try {
                                            const { data } = await axios.post('/api/upload', uploadData);
                                            setFormData(prev => ({ ...prev, farmImage: `${data.image}` }));
                                        } catch (err) {
                                            console.error(err);
                                            alert('Image upload failed');
                                        }
                                    }
                                }} />
                            </div>
                        </>
                    ) : (
                        <div className='form-group'>
                            <label className='form-label'>Business/Restaurant Name</label>
                            <input type='text' className='input-field' name='businessName' value={businessName} onChange={onChange} required />
                        </div>
                    )}

                    <div className='form-row'>
                        <div className='form-group'>
                            <label className='form-label'>Phone</label>
                            <input type='text' className='input-field' name='phone' value={phone} onChange={onChange} required />
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>City</label>
                            <input type='text' className='input-field' name='city' value={city} onChange={onChange} required />
                        </div>
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Password</label>
                        <input type='password' className='input-field' name='password' value={password} onChange={onChange} required />
                    </div>

                    <button type='submit' className='btn btn-primary btn-block'>Register</button>
                </form>
                <p className='auth-footer'>
                    Already have an account? <Link to='/login'>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
