import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import '../styles/pages/Legal.css';
import SEO from '../components/SEO';

const Contact = () => {
  return (
    <div className="legal-page">
      <SEO 
        title="Contact Us" 
        description="Get in touch with the TaskPlexus team. We're here to help with support, feedback, and inquiries."
      />
      <nav className="legal-navbar">
        <div className="legal-nav-content">
          <Link to="/" className="legal-nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={32} />
            <span>TaskPlexus</span>
          </Link>
          <Link to="/" className="legal-nav-back">← Back to Home</Link>
        </div>
      </nav>

      <main className="legal-container">
        <div className="legal-header">
          <h1>Contact Us</h1>
          <p className="legal-date">We'd love to hear from you</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '40px' }}>
              Have a question, suggestion, or just want to say hello? We're here to help!
            </p>

            <div className="legal-contact-info" style={{ display: 'grid', gap: '20px', padding: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📧</div>
                <h3>Email Support</h3>
                <p>For general inquiries and support:</p>
                <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL}`} style={{ fontSize: '18px', fontWeight: 'bold' }}>support@taskplexus.com</a>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🐛</div>
                <h3>Report a Bug</h3>
                <p>Found something broken? Let us know:</p>
                <a href="mailto:support@taskplexus.com?subject=Bug Report" style={{ fontSize: '18px', fontWeight: 'bold' }}>Report Issue</a>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📍</div>
                <h3>Location</h3>
                <p>Mumbai, India</p>
              </div>
            </div>
          </section>

          <section className="legal-section" style={{ marginTop: '60px' }}>
            <h2>Response Time</h2>
            <p>
              We aim to respond to all inquiries within 24-48 hours during business days (Monday - Friday).
              Premium users receive priority support with faster response times.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
