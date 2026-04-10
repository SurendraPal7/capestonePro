import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaShoppingBasket, FaLeaf } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
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
                        <Link to='/' style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1a1a1a', fontWeight: '800', fontSize: '1.4rem', textDecoration: 'none' }}>
                            <FaLeaf style={{ color: '#00d26a' }} /> AgriDirect
                        </Link>
                    </div>

                    <div className='mobile-menu-icon' onClick={toggleMenu}>
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </div>

                    <nav className={`nav-links ${isOpen ? 'active' : ''}`}>
                        <Link to='/' className='nav-link' onClick={() => setIsOpen(false)}>Home</Link>
                        {user ? (
                            <>
                                {user.role === 'farmer' && (
                                    <Link to='/dashboard' className='nav-link' onClick={() => setIsOpen(false)}>My Dashboard</Link>
                                )}
                                {user.role === 'buyer' && (
                                    <>
                                        <Link to='/marketplace' className='nav-link' onClick={() => setIsOpen(false)}>Marketplace</Link>
                                        <Link to='/orders' className='nav-link' onClick={() => setIsOpen(false)}>Orders</Link>
                                    </>
                                )}
                                <button className='btn btn-outline btn-logout' onClick={onLogout}>
                                    <FaSignOutAlt /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to='/login' className='nav-link' onClick={() => setIsOpen(false)}>
                                    <FaUser /> Login
                                </Link>
                                <Link to='/register' className='btn btn-primary' style={{ backgroundColor: '#00d26a', border: 'none' }} onClick={() => setIsOpen(false)}>
                                    Get Started
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
