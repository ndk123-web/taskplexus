import { Link, Navigate } from 'react-router-dom';
// import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import useUserStore from '../store/useUserInfo';
import '../styles/pages/Home.css';
import Footer from '../components/layout/Footer';
import DemoFlowchart from '../components/features/DemoFlowchart';

const Home = () => {
  let userInfo = useUserStore(state => state.userInfo);
  const [showDemoFlowchart, setShowDemoFlowchart] = useState(false);

  const handlePayment = async () => {
    
    // // lazy load razorpay script on button click
    // await dynamicRazorPayLoad()

    // setCreateOrderLoader(true);
    // try {
    //   const order = {
    //     amount : import.meta.env.VITE_TASKPLEXUS_PREMIUM_MONEY, // amount in paise (100 INR)
    //     currency : "INR",
    //   }
    //   await openRazorpayCheckout(order);
    // } catch (error) {
    //   console.error("Payment error:", error);
    // } finally {
    //   setCreateOrderLoader(false);
    // }

    if (!userInfo?.auth) return

    Navigate({to:"/settings", replace:true});
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

      {/* Interactive Demo Section */}
      <section className="demo-section">
        <div className="demo-container">
          <div className="section-header">
            <h2 className="section-title">Try It Out!</h2>
            <p className="section-subtitle">Experience our interactive flowchart editor</p>
          </div>

          <div className="demo-preview-card">
            <div className="demo-preview-header">
              <h3>Interactive Flowchart Demo</h3>
              <p>Add nodes, create connections, and explore the full power of visual task management</p>
            </div>
            <div className="demo-preview-content">
              <div className="demo-flowchart-preview">
                <DemoFlowchart />
              </div>
              <div className="demo-preview-overlay">
                <button 
                  className="demo-expand-btn"
                  onClick={() => setShowDemoFlowchart(true)}
                  title="Expand to fullscreen"
                >
                  🔲 Fullscreen
                </button>
              </div>
            </div>
          </div>

          <div className="demo-features-grid">
            <div className="demo-feature">
              <div className="demo-feature-icon">🎯</div>
              <h4>Drag & Drop</h4>
              <p>Easily position your tasks anywhere on the canvas</p>
            </div>
            <div className="demo-feature">
              <div className="demo-feature-icon">🔗</div>
              <h4>Visual Connections</h4>
              <p>Create relationships between tasks visually</p>
            </div>
            <div className="demo-feature">
              <div className="demo-feature-icon">➕</div>
              <h4>Add & Manage</h4>
              <p>Add new tasks on the fly and manage everything easily</p>
            </div>
            <div className="demo-feature">
              <div className="demo-feature-icon">🎨</div>
              <h4>Priority Colors</h4>
              <p>Color-coded priorities for quick visual scanning</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Demo Section */}
      <section className="ai-demo-section">
        <div className="ai-demo-container">
          <div className="section-header">
            <h2 className="section-title">AI-Powered Features</h2>
            <p className="section-subtitle">Watch how AI can transform your productivity</p>
          </div>

          <div className="ai-demos-grid">
            {/* AI Planner Demo */}
            <div className="ai-demo-card">
              <div className="ai-demo-header">
                <div className="ai-icon">🤖</div>
                <h3>AI Planner</h3>
              </div>
              <div className="ai-demo-video" style={{ padding: 0 }}>
                <video 
                  src="/AIPLANNER.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="ai-demo-description">
                <p><strong>What it does:</strong> Describe your project or goal, and our AI will automatically break it down into organized tasks with priorities and timelines.</p>
                <ul>
                  <li>✓ Convert ideas into actionable tasks</li>
                  <li>✓ Auto-assign priorities</li>
                  <li>✓ Suggest task sequences</li>
                  <li>✓ 5 free requests, 50/day with premium</li>
                </ul>
              </div>
            </div>

            {/* AI Chat Demo */}
            <div className="ai-demo-card">
              <div className="ai-demo-header">
                <div className="ai-icon">💬</div>
                <h3>AI Chat</h3>
              </div>
              <div className="ai-demo-video" style={{ padding: 0 }}>
                <video 
                  src="/AICHAT.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="ai-demo-description">
                <p><strong>What it does:</strong> Chat with our AI assistant to get personalized productivity advice, task suggestions, and workflow optimization tips.</p>
                <ul>
                  <li>✓ Get productivity insights</li>
                  <li>✓ Ask for task recommendations</li>
                  <li>✓ Optimize your workflow</li>
                  <li>✓ 5 free requests, 100/day with premium</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                Create up to 2 workspaces on free plan, up to 10 on premium. Each with isolated todos, goals, and flowcharts. Switch seamlessly between projects.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Smart Task Management</h3>
              <p className="feature-description">
                Priority-based organization (Low, Medium, High). Unlimited todos per workspace. Real-time status tracking.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Goal Tracking</h3>
              <p className="feature-description">
                Set and monitor long-term goals. Unlimited goals per workspace. Progress visualization with completion metrics.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI-Powered Features</h3>
              <p className="feature-description">
                AI Planner: 5 lifetime requests (free), 50/day (premium). AI Chat: 5 lifetime requests (free), 100/day (premium).
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
                <li>✓ 2 Workspaces</li>
                <li>✓ Unlimited Todos per workspace</li>
                <li>✓ Unlimited Goals per workspace</li>
                <li>✓ Flowchart View</li>
                <li>✓ Basic Analytics</li>
                <li>✓ Offline Access</li>
                <li>✓ AI Planner (5 lifetime)</li>
                <li>✓ AI Chat (5 lifetime)</li>
              </ul>
              <Link to="/signup" className="plan-cta">Get Started</Link>
            </div>

            <div className="pricing-card premium-plan">
              <div className="plan-badge">Premium</div>
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
              <button 
                onClick={()=>handlePayment()} 
                className="plan-cta"
              >
                  {userInfo?.auth ? <Link to={"/settings"}>"Buy Premium"</Link> : <Link to={"/signin"}>Login First</Link>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conditions & Privacy Policy - Modal Style */}
      
      {/* Fullscreen Demo Modal */}
      {showDemoFlowchart && (
        <div className="demo-modal-overlay">
          <DemoFlowchart isModal={true} onClose={() => setShowDemoFlowchart(false)} />
        </div>
      )}
      
      {/* Footer */}
      <Footer />

      <div className="background-elements">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
    </div>
  );
};

export default Home;
