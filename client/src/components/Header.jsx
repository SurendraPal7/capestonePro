import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaShoppingBasket, FaSeedling, FaTractor } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import './Header.css';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const onLogout = () => {
        logout();
        navigate('/');
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <header className='header'>
            <div className='container'>
                <div className='nav-wrapper'>
                    <div className='logo'>
                        <Link 
                            to={user && user.role === 'admin' ? '/admin' : user && user.role === 'farmer' ? '/dashboard' : '/'} 
                            className='logo-link'
                        >
                            <div className='logo-icon'>
                                <FaSeedling />
                            </div>
                            <div className='logo-text'>
                                <span className='logo-main'>FarmDirect</span>
                                <span className='logo-tagline'>Fresh • Local • Sustainable</span>
                            </div>
                        </Link>
                    </div>

                    <div className='mobile-menu-icon' onClick={toggleMenu}>
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </div>

                    <nav className={`nav-links ${isOpen ? 'active' : ''}`}>
                        {/* Show Home link only for non-farmers */}
                        {(!user || user.role !== 'farmer') && (
                            <Link to='/' className='nav-link' onClick={() => setIsOpen(false)}>
                                <span>Home</span>
                            </Link>
                        )}
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to='/admin' className='nav-link admin-link' onClick={() => setIsOpen(false)}>
                                        <FaUser className='nav-icon' />
                                        <span>Admin Panel</span>
                                    </Link>
                                )}
                                {user.role === 'farmer' && (
                                    <Link to='/dashboard' className='nav-link farmer-link' onClick={() => setIsOpen(false)}>
                                        <FaTractor className='nav-icon' />
                                        <span>Farm Dashboard</span>
                                    </Link>
                                )}
                                {user.role === 'buyer' && (
                                    <>
                                        <Link to='/marketplace' className='nav-link' onClick={() => setIsOpen(false)}>
                                            <span>Marketplace</span>
                                        </Link>
                                        <Link to='/orders' className='nav-link' onClick={() => setIsOpen(false)}>
                                            <span>My Orders</span>
                                        </Link>
                                        <Link to='/cart' className='nav-link cart-link' onClick={() => setIsOpen(false)}>
                                            <FaShoppingBasket className='nav-icon' />
                                            <span>Cart</span>
                                            {cartItems.length > 0 && (
                                                <span className='cart-badge'>{cartItems.reduce((acc, item) => acc + item.qty, 0)}</span>
                                            )}
                                        </Link>
                                    </>
                                )}
                                <button className='btn btn-outline logout-btn' onClick={onLogout}>
                                    <FaSignOutAlt className='btn-icon' />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to='/login' className='nav-link login-link' onClick={() => setIsOpen(false)}>
                                    <FaUser className='nav-icon' />
                                    <span>Login</span>
                                </Link>
                                <Link to='/register' className='btn btn-primary register-btn' onClick={() => setIsOpen(false)}>
                                    <span>Join Our Farm Network</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
