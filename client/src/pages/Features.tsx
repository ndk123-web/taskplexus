import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import '../styles/pages/Legal.css'; // Reusing the base layout styles
import '../styles/pages/Home.css'; // Reusing feature card styles
import SEO from '../components/SEO';

const Features = () => {
  return (
    <div className="legal-page">
      <SEO 
        title="Features" 
        description="Explore the powerful features of TaskPlexus: AI Planner, Flowcharts, Goal Tracking, and more."
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

      <main className="legal-container" style={{ maxWidth: '1200px' }}>
        <div className="legal-header">
          <h1>Powerful Features</h1>
          <p className="legal-date">Everything you need to master your productivity</p>
        </div>

        <div className="features-grid" style={{ marginTop: '40px' }}>
          <div className="feature-card">
            <div className="feature-icon">📂</div>
            <h3 className="feature-title">Multi-Workspace Management</h3>
            <p className="feature-description">
              Create distinct workspaces for work, personal life, or side projects. Keep your contexts separate and organized.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3 className="feature-title">Smart Task Management</h3>
            <p className="feature-description">
              Organize tasks with priorities, due dates, and tags. Drag and drop to reorder. Mark as complete with a satisfying click.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Goal Tracking</h3>
            <p className="feature-description">
              Set ambitious long-term goals and break them down into actionable steps. Visualize your progress towards success.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">AI Planner</h3>
            <p className="feature-description">
              Describe your project in plain English, and let our AI generate a comprehensive task list and schedule for you.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">AI Chat Assistant</h3>
            <p className="feature-description">
              Stuck on a task? Chat with your personal productivity assistant for tips, strategies, and motivation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3 className="feature-title">Interactive Flowcharts</h3>
            <p className="feature-description">
              Visualize complex projects with our drag-and-drop flowchart editor. Connect tasks and see dependencies clearly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Advanced Analytics</h3>
            <p className="feature-description">
              Gain insights into your productivity habits. Track completion rates, peak productivity hours, and more.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Offline Capable</h3>
            <p className="feature-description">
              Keep working even without an internet connection. Your data syncs automatically when you're back online.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Enterprise-grade encryption keeps your data safe. We prioritize your privacy above all else.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '80px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px', color: 'white' }}>Ready to get started?</h2>
          <Link to="/signup" className="cta-primary">
            Start Free Today
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
