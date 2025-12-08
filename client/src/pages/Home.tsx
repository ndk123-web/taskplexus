import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';
import useUserStore from '../store/useUserInfo';
import '../styles/pages/Home.css';
import { dynamicRazorPayLoad , openRazorpayCheckout } from '../utils/razorpay';

const Home = () => {
  let userInfo = useUserStore(state => state.userInfo);
  const [showTerms, setShowTerms] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
     dynamicRazorPayLoad();
  },[])

  const handlePayment = async () => {
    await openRazorpayCheckout({});
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={32} />
            <span style={{ marginLeft: '8px' }}>TaskPlexus</span>
          </h1>
          <div className="nav-links">
            <span className="nav-tagline">Built By Ndk</span>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <div className="badge">
            <span className="badge-text">Simple.Fast.Productive</span>
          </div>
          
          <h1 className="hero-title">
            Organize Your Life,
            <br />
            <span className="gradient-text">One Task at a Time</span>
          </h1>
          
          <p className="hero-description">
            A minimalist todo app designed to help you focus on what matters most.
            Clean interface, powerful features, zero distractions.
          </p>
          
          <div className="cta-buttons">

            {userInfo?.auth ? (<>
              <Link to="/dashboard" className="cta-primary">
              Go to Dashboard
              </Link>
            </>):(<>
            <Link to="/signup" className="cta-primary">
              Start Free Today
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            </>)}

            <Link to="/signin" className="cta-secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card card-1">
            <div className="card-header">
              <div className="card-icon">✓</div>
              <span className="card-title">Today's Tasks</span>
            </div>
            <div className="card-content">
              <div className="task-item completed">
                <span className="task-check">✓</span>
                <span className="task-text">Morning workout</span>
              </div>
              <div className="task-item">
                <span className="task-check"></span>
                <span className="task-text">Review project docs</span>
              </div>
              <div className="task-item">
                <span className="task-check"></span>
                <span className="task-text">Team meeting at 3pm</span>
              </div>
            </div>
          </div>

          <div className="visual-card card-2">
            <div className="card-header">
              <div className="card-icon">★</div>
              <span className="card-title">Goals</span>
            </div>
            <div className="card-stats">
              <div className="stat-item">
                <div className="stat-number">12</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Core Features</h2>
            <p className="section-subtitle">Everything you need to stay organized</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📂</div>
              <h3 className="feature-title">Multi-Workspace Management</h3>
              <p className="feature-description">
                Create up to 5 workspaces. Each with isolated todos, goals, and flowcharts. Switch seamlessly between projects.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Smart Task Management</h3>
              <p className="feature-description">
                Priority-based organization (Low, Medium, High). Up to 15 todos per workspace. Real-time status tracking.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Goal Tracking</h3>
              <p className="feature-description">
                Set and monitor long-term goals. Up to 5 goals per workspace. Progress visualization with completion metrics.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3 className="feature-title">Interactive Flowchart View</h3>
              <p className="feature-description">
                Drag-and-drop node positioning. Visual task dependencies. Custom connections. Auto-save functionality.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Advanced Analytics</h3>
              <p className="feature-description">
                Track task completion trends over time. Workspace-specific statistics. Priority distribution charts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3 className="feature-title">Modern UI/UX</h3>
              <p className="feature-description">
                Glass-morphism design. Smooth animations. Responsive on all devices. Dark-themed professional interface.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Offline capability with IndexedDB. Instant UI updates. Optimistic data sync. No lags or delays.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your data is encrypted and secure. Accessible only to you. No ads or tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="pricing-container">
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">Start free, upgrade when you need more</p>
          </div>

          <div className="pricing-cards">
            <div className="pricing-card free-plan">
              <div className="plan-header">
                <h3 className="plan-name">Free</h3>
                <p className="plan-price">
                  <span className="price-value">$0</span>
                  <span className="price-period">Forever</span>
                </p>
              </div>
              <ul className="plan-features">
                <li>✓ 5 Workspaces</li>
                <li>✓ 15 Todos per workspace</li>
                <li>✓ 5 Goals per workspace</li>
                <li>✓ Flowchart View</li>
                <li>✓ Basic Analytics</li>
                <li>✓ Offline Access</li>
              </ul>
              <Link to="/signup" className="plan-cta">Get Started</Link>
            </div>

            <div className="pricing-card premium-plan">
              <div className="plan-badge">Coming Soon</div>
              <div className="plan-header">
                <h3 className="plan-name">Premium</h3>
                <p className="plan-price">
                  <span className="price-value">$4.99</span>
                  <span className="price-period">/month</span>
                </p>
              </div>
              <ul className="plan-features">
                <li>✓ Unlimited Workspaces</li>
                <li>✓ Unlimited Todos</li>
                <li>✓ Unlimited Goals</li>
                <li>✓ Advanced Flowchart Features</li>
                <li>✓ Detailed Analytics</li>
                <li>✓ AI-Powered Suggestions</li>
                <li>✓ Priority Support</li>
              </ul>
              <button onClick={()=>handlePayment()}  className="plan-cta">{userInfo?.auth ? "Buy" : <Link to={"/signin"}>Login First</Link> }</button>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conditions & Privacy Policy - Modal Style */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTerms(false)}>✕</button>
            <h2>Terms & Conditions</h2>
            <div className="modal-body">
              <h3>1. Acceptance of Terms</h3>
              <p>By using TaskPlexus, you agree to these Terms & Conditions. If you do not agree, please do not use the service.</p>

              <h3>2. Use License</h3>
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on TaskPlexus for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the site</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>

              <h3>3. Disclaimer</h3>
              <p>The materials on TaskPlexus are provided on an "as is" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

              <h3>4. Limitations</h3>
              <p>In no event shall TaskPlexus or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the service.</p>

              <h3>5. User Content</h3>
              <p>You are responsible for the content you create and store in TaskPlexus. You grant us a license to store and backup your data to provide the service. We do not access or monitor your personal data.</p>

              <h3>6. Free Tier Limits</h3>
              <p>Free tier users are limited to 5 workspaces, 15 todos per workspace, and 5 goals per workspace. These limits may change at any time. Heavy abuse may result in account suspension.</p>

              <h3>7. Modification of Terms</h3>
              <p>We may revise these Terms & Conditions at any time without notice. By using the service, you are agreeing to be bound by the then current version of these terms.</p>
            </div>
          </div>
        </div>
      )}

      {showPolicy && (
        <div className="modal-overlay" onClick={() => setShowPolicy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPolicy(false)}>✕</button>
            <h2>Privacy Policy</h2>
            <div className="modal-body">
              <h3>1. Information We Collect</h3>
              <p>When you create an account, we collect:</p>
              <ul>
                <li>Full name and email address</li>
                <li>Password (encrypted)</li>
                <li>Tasks, goals, and project data you create</li>
                <li>Usage patterns and analytics (anonymized)</li>
              </ul>

              <h3>2. How We Use Your Information</h3>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain the service</li>
                <li>Send you account-related notifications</li>
                <li>Improve and optimize the platform</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h3>3. Data Storage & Security</h3>
              <p>Your data is stored on secure servers with encryption. We use industry-standard security practices to protect your information. Your password is never stored in plain text.</p>

              <h3>4. Third-Party Services</h3>
              <p>We may use third-party services for analytics and hosting. These services have their own privacy policies. We recommend reviewing their policies as well.</p>

              <h3>5. Data Access & Control</h3>
              <p>You can access, modify, or delete your account data at any time. Upon account deletion, your data will be permanently removed from our servers within 30 days.</p>

              <h3>6. Cookies & Tracking</h3>
              <p>We use cookies to maintain your session and remember your preferences. We do not use cookies for advertising or tracking purposes.</p>

              <h3>7. Children's Privacy</h3>
              <p>TaskPlexus is not intended for users under 13 years of age. We do not knowingly collect information from children.</p>

              <h3>8. Changes to Privacy Policy</h3>
              <p>We may update this Privacy Policy at any time. We will notify you of significant changes via email.</p>

              <h3>9. Contact Us</h3>
              <p>If you have questions about this Privacy Policy, please contact us at: support@taskplexus.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-section">
              <h4 className="footer-title">TaskPlexus</h4>
              <p className="footer-description">Simple, fast, and efficient task management for everyone.</p>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><Link to="/signin">Sign In</Link></li>
                <li><Link to="/signup">Get Started</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li><button onClick={() => setShowTerms(true)} className="link-button">Terms & Conditions</button></li>
                <li><button onClick={() => setShowPolicy(true)} className="link-button">Privacy Policy</button></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="mailto:support@taskplexus.com">Email Support</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-text">© 2025 TaskPlexus. All rights reserved. Built with focus and simplicity.</p>
          </div>
        </div>
      </footer>

      <div className="background-elements">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
    </div>
  );
};

export default Home;
