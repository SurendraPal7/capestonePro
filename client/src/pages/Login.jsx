import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'farmer') navigate('/dashboard');
            else navigate('/marketplace');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (error) {
            alert('Invalid credentials');
        }
    };

    return (
        <div className='auth-container'>
            <div className='auth-card card'>
                <h2>Welcome Back</h2>
                <p>Login to access your dashboard</p>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label className='form-label'>Email Address</label>
                        <input
                            type='email'
                            className='input-field'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Password</label>
                        <input
                            type='password'
                            className='input-field'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type='submit' className='btn btn-primary btn-block'>Login</button>
                </form>
                <p className='auth-footer'>
                    Don't have an account? <Link to='/register'>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
