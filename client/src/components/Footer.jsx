import { FaSeedling, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaTractor, FaLeaf, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-global">
            <div className="container footer-content">
                <div className="footer-section brand-section">
                    <div className="footer-logo">
                        <div className="footer-logo-icon">
                            <FaSeedling />
                        </div>
                        <div className="footer-logo-text">
                            <span className="footer-logo-main">FarmDirect</span>
                            <span className="footer-logo-tagline">Fresh • Local • Sustainable</span>
                        </div>
                    </div>
                    <p className="footer-desc">
                        Connecting passionate farmers with conscious consumers for the freshest produce, 
                        fair prices, and a sustainable agricultural future.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon facebook"><FaFacebook /></a>
                        <a href="#" className="social-icon twitter"><FaTwitter /></a>
                        <a href="#" className="social-icon instagram"><FaInstagram /></a>
                        <a href="#" className="social-icon linkedin"><FaLinkedin /></a>
                    </div>
                </div>

                <div className="footer-section links-section">
                    <h4><FaLeaf className="section-icon" />For Farmers</h4>
                    <ul>
                        <li><Link to="/register?role=farmer">Join as Farmer</Link></li>
                        <li><Link to="#">Farmer Resources</Link></li>
                        <li><Link to="#">Pricing Guide</Link></li>
                        <li><Link to="#">Success Stories</Link></li>
                        <li><Link to="#">Farm Certification</Link></li>
                    </ul>
                </div>

                <div className="footer-section links-section">
                    <h4><FaHeart className="section-icon" />For Buyers</h4>
                    <ul>
                        <li><Link to="/marketplace">Browse Marketplace</Link></li>
                        <li><Link to="#">Quality Promise</Link></li>
                        <li><Link to="#">Delivery Info</Link></li>
                        <li><Link to="#">Seasonal Guide</Link></li>
                        <li><Link to="#">Recipe Ideas</Link></li>
                    </ul>
                </div>

                <div className="footer-section links-section">
                    <h4><FaTractor className="section-icon" />Support</h4>
                    <ul>
                        <li><Link to="#">Help Center</Link></li>
                        <li><Link to="#">Contact Us</Link></li>
                        <li><Link to="#">Community Forum</Link></li>
                        <li><Link to="#">Report Issue</Link></li>
                        <li><Link to="#">Feedback</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="footer-bottom">
                <div className="container bottom-content">
                    <div className="footer-bottom-left">
                        <p>© {new Date().getFullYear()} FarmDirect. Cultivating connections, growing communities.</p>
                    </div>
                    <div className="footer-bottom-right">
                        <Link to="#">Terms</Link>
                        <Link to="#">Privacy</Link>
                        <Link to="#">Cookies</Link>
                        <Link to="#">Security</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
