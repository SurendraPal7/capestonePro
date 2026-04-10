import { FaLeaf, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-global">
            <div className="container footer-content">
                <div className="footer-section brand-section">
                    <div className="footer-logo">
                        <FaLeaf className="text-primary"/> <strong>AgriDirect</strong>
                    </div>
                    <p className="footer-desc">
                        Connecting local farmers directly with you for fresh produce, fair prices, and a sustainable future for agriculture.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon"><FaFacebook /></a>
                        <a href="#" className="social-icon"><FaTwitter /></a>
                        <a href="#" className="social-icon"><FaInstagram /></a>
                        <a href="#" className="social-icon"><FaLinkedin /></a>
                    </div>
                </div>

                <div className="footer-section links-section">
                    <h4>Company</h4>
                    <ul>
                        <li><Link to="#">About Us</Link></li>
                        <li><Link to="#">Careers</Link></li>
                        <li><Link to="#">Blog</Link></li>
                        <li><Link to="#">Contact</Link></li>
                    </ul>
                </div>

                <div className="footer-section links-section">
                    <h4>Resources</h4>
                    <ul>
                        <li><Link to="#">Farmers Guide</Link></li>
                        <li><Link to="#">Buyer Guide</Link></li>
                        <li><Link to="#">Help Center</Link></li>
                        <li><Link to="#">Community</Link></li>
                    </ul>
                </div>

                <div className="footer-section links-section">
                    <h4>Legal</h4>
                    <ul>
                        <li><Link to="#">Terms of Service</Link></li>
                        <li><Link to="#">Privacy Policy</Link></li>
                        <li><Link to="#">Cookie Policy</Link></li>
                        <li><Link to="#">Security</Link></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container bottom-content">
                    <p>© {new Date().getFullYear()} AgriDirect Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
