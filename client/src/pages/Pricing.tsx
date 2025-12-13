import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import '../styles/pages/Legal.css';
import '../styles/pages/Home.css';
import useUserStore from '../store/useUserInfo';
// import { use } from 'react';

const Pricing = () => {
  return (
    <div className="legal-page">
      <nav className="legal-navbar">
        <div className="legal-nav-content">
          <Link to="/" className="legal-nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={32} />
            <span>TaskPlexus</span>
          </Link>
          <Link to="/" className="legal-nav-back">← Back to Home</Link>
        </div>
      </nav>

      <main className="legal-container" style={{ maxWidth: '1200px' }}>
        <div className="legal-header">
          <h1>Simple, Transparent Pricing</h1>
          <p className="legal-date">Choose the plan that fits your workflow</p>
        </div>

        <div className="pricing-cards" style={{ marginTop: '40px', justifyContent: 'center' }}>
          <div className="pricing-card free-plan">
            <div className="plan-header">
              <h3 className="plan-name">Free</h3>
              <p className="plan-price">
                <span className="price-value">$0</span>
                <span className="price-period">Forever</span>
              </p>
            </div>
            <ul className="plan-features">
              <li>✓ 2 Workspaces</li>
              <li>✓ Unlimited Todos per workspace</li>
              <li>✓ Unlimited Goals per workspace</li>
              <li>✓ Flowchart View</li>
              <li>✓ Basic Analytics</li>
              <li>✓ Offline Access</li>
              <li>✓ AI Planner (5 lifetime)</li>
              <li>✓ AI Chat (5 lifetime)</li>
            </ul>
            <Link to="/signup" className="plan-cta">Get Started Free</Link>
          </div>

          <div className="pricing-card premium-plan">
            <div className="plan-badge">Most Popular</div>
            <div className="plan-header">
              <h3 className="plan-name">Premium</h3>
              <p className="plan-price">
                <span className="price-value">₹99</span>
                <span className="price-period">/month</span>
              </p>
            </div>
            <ul className="plan-features">
              <li>✓ 10 Workspaces</li>
              <li>✓ Unlimited Todos</li>
              <li>✓ Unlimited Goals</li>
              <li>✓ Advanced Flowchart Features</li>
              <li>✓ Detailed Analytics</li>
              <li>✓ Faster Sync</li>
              <li>✓ AI Planner (50/day)</li>
              <li>✓ AI Chat (100/day)</li>
              <li>✓ Priority Support</li>
            </ul>
            <div className="plan-cta">{useUserStore?.getState().userInfo?.plan == "PRO_MONTHLY" ?
            "Already Active" : 
            useUserStore?.getState().userInfo == null ? <Link to={"/signup"}>Sign Up First</Link> :
            <Link to={"/settings"}>Buy Now</Link>}</div>
          </div>
        </div>

        <div className="legal-content" style={{ marginTop: '80px' }}>
          <section className="legal-section">
            <h2 style={{ textAlign: 'center' }}>Frequently Asked Questions</h2>
            
            <div style={{ marginTop: '40px' }}>
              <h3 className="legal-subheading">Can I cancel anytime?</h3>
              <p>Yes, absolutely. There are no long-term contracts. You can cancel your premium subscription at any time from your settings page.</p>
              
              <h3 className="legal-subheading">What happens to my data if I downgrade?</h3>
              <p>If you downgrade to the Free plan, your data is preserved. However, you will be limited to accessing only 2 workspaces. You can choose which ones to keep active.</p>
              
              <h3 className="legal-subheading">Do you offer refunds?</h3>
              <p>Please refer to our <Link to="/refund-policy">Refund Policy</Link> for detailed information about refunds.</p>
              
              <h3 className="legal-subheading">Is my payment information secure?</h3>
              <p>Yes, we use Razorpay for processing payments. We do not store your credit card details on our servers.</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
