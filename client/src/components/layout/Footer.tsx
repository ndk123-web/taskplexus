import { Link } from 'react-router-dom';
import '../../styles/components/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-wrapper">
        {/* Top Section - Main Content */}
        <div className="footer-main">
          <div className="footer-column footer-brand">
            <div className="footer-logo">
              <img src="/TaskPlexus.png" alt="TaskPlexus" width={40} />
              <h3 className="footer-brand-name">TaskPlexus</h3>
            </div>
            <p className="footer-tagline">
              AI-powered task management for the modern professional. Simple, fast, and productive.
            </p>
            <div className="footer-social">
              <a href="mailto:support@taskplexus.com" className="footer-social-link" title="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Product</h4>
            <ul className="footer-links">
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/signin">Sign In</Link></li>
              <li><Link to="/signup">Get Started</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="mailto:support@taskplexus.com">Email Support</a></li>
              <li><a href="mailto:support@taskplexus.com">Report Bug</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><span className="footer-info">Navnath</span></li>
              <li><span className="footer-info">Mumbai, India</span></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section - Copyright */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} <strong>TaskPlexus</strong>. All rights reserved.
          </p>
          <p className="footer-operator">
            Operated by <strong>Navnath (Individual)</strong> | Mumbai, India
          </p>
          <p className="footer-tagline-bottom">
            Built with focus and simplicity for productivity enthusiasts worldwide.
          </p>
        </div>
      </div>

      {/* Background Elements */}
      <div className="footer-bg-elements">
        <div className="footer-bg-circle footer-bg-1"></div>
        <div className="footer-bg-circle footer-bg-2"></div>
      </div>
    </footer>
  );
};

export default Footer;
