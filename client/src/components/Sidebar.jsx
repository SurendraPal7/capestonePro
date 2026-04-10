import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaLeaf, FaHome, FaStore, FaBoxOpen, FaChartBar, FaWarehouse, FaUsers, FaCog, FaHeadset, FaRupeeSign, FaBox } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const isFarmer = user?.role === 'farmer';

    return (
        <aside className={`sidebar ${isFarmer ? 'sidebar-dark' : ''}`}>
            <div className="sidebar-logo">
                <Link to='/dashboard'>
                    <FaLeaf className="text-primary" /> <strong>AgriMarket</strong>
                </Link>
            </div>

            <nav className="sidebar-nav">
                {isFarmer ? (
                    <>
                        <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                            <FaHome className="nav-icon" /> Dashboard
                        </Link>
                        <Link to="/orders" className={`nav-item ${location.pathname === '/orders' ? 'active' : ''}`}>
                            <FaBoxOpen className="nav-icon" /> Orders
                        </Link>
                        <Link to="/products" className={`nav-item ${location.pathname === '/products' ? 'active' : ''}`}>
                            <FaBox className="nav-icon" /> Products
                        </Link>
                        <Link to="/earnings" className={`nav-item ${location.pathname === '/earnings' ? 'active' : ''}`}>
                            <FaRupeeSign className="nav-icon" /> Earnings
                        </Link>
                        <Link to="/analytics" className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}>
                            <FaChartBar className="nav-icon" /> Analytics
                        </Link>
                        <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                            <FaCog className="nav-icon" /> Settings
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                            <FaHome className="nav-icon" /> Home
                        </Link>
                        <Link to="/marketplace" className={`nav-item ${location.pathname === '/marketplace' ? 'active' : ''}`}>
                            <FaStore className="nav-icon" /> Marketplace
                        </Link>
                        <Link to="/orders" className={`nav-item ${location.pathname === '/orders' ? 'active' : ''}`}>
                            <FaBoxOpen className="nav-icon" /> My Orders
                        </Link>
                        <Link to="#" className="nav-item">
                            <FaChartBar className="nav-icon" /> Analytics
                        </Link>
                        <Link to="#" className="nav-item">
                            <FaWarehouse className="nav-icon" /> Inventory
                        </Link>
                        <Link to="#" className="nav-item">
                            <FaUsers className="nav-icon" /> My Suppliers
                        </Link>
                        <Link to="#" className="nav-item">
                            <FaCog className="nav-icon" /> Settings
                        </Link>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="support-card">
                    <h4>Support Center</h4>
                    <p>Need help with your orders?</p>
                    <button className="btn btn-primary btn-sm btn-full">Contact Agent</button>
                </div>
                <div className="sidebar-bottom-links">
                    <div className="copy">© 2024 AgriMarket</div>
                    <div className="links">
                        <Link to="#">Privacy Policy</Link>
                        <Link to="#">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
