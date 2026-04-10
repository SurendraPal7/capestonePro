import { useContext } from 'react';
import { FaSearch, FaBell, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import './Topbar.css';

const Topbar = () => {
    const { user } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);

    return (
        <header className="topbar">
            {user?.role === 'buyer' ? (
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search products, farms, or SKU..." 
                        className="topbar-search-input"
                    />
                </div>
            ) : (
                <div className="search-container-placeholder" style={{ flex: 1 }}></div>
            )}

            <div className="topbar-icons">
                <button className="icon-btn">
                    <FaBell />
                    <span className="badge-dot"></span>
                </button>
                <Link to="/cart" className="icon-btn">
                    <FaShoppingCart />
                    {cartItems.length > 0 && <span className="badge-count">{cartItems.length}</span>}
                </Link>
                
                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'Alex Rivers'}</span>
                        <span className="user-role">{user?.role === 'buyer' ? 'Premium Buyer' : 'Farmer'}</span>
                    </div>
                    <div className="user-avatar">
                        <img 
                            src="https://randomuser.me/api/portraits/men/32.jpg" 
                            alt="User Avatar" 
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
