import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSeedling, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'farmer') navigate('/dashboard');
            else navigate('/marketplace');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            alert('Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='auth-container'>
            <div className='auth-background'></div>
            <div className='auth-content'>
                <div className='auth-benefits'>
                    <h3>Join thousands of farmers and buyers</h3>
                    <div className='benefit-list'>
                        <div className='benefit-item'>
                            <div className='benefit-icon'>🌱</div>
                            <span>Fresh, locally-sourced produce</span>
                        </div>
                        <div className='benefit-item'>
                            <div className='benefit-icon'>🚚</div>
                            <span>Direct farm-to-table delivery</span>
                        </div>
                        <div className='benefit-item'>
                            <div className='benefit-icon'>🤝</div>
                            <span>Support local farming communities</span>
                        </div>
                    </div>
                </div>
                
                <div className='auth-card'>
                    <div className='auth-header'>
                        <div className='auth-logo'>
                            <FaSeedling />
                        </div>
                        <h2>Welcome Back to FarmDirect</h2>
                        <p>Sign in to connect with fresh, local produce</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className='auth-form'>
                        <div className='form-group'>
                            <label className='form-label'>
                                <FaEnvelope className='label-icon' />
                                Email Address
                            </label>
                            <input
                                type='email'
                                className='input-field'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter your email'
                                required
                            />
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='Enter your password'
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
                        
                        <div className='form-options'>
                            <label className='checkbox-label'>
                                <input type='checkbox' />
                                <span className='checkmark'></span>
                                Remember me
                            </label>
                            <Link to='#' className='forgot-link'>Forgot password?</Link>
                        </div>
                        
                        <button 
                            type='submit' 
                            className={`btn btn-primary btn-block ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className='auth-footer'>
                        <p>New to FarmDirect? <Link to='/register' className='auth-link'>Create an account</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
