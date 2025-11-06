import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-logo">
            <span className="nav-logo-icon">⚡</span>
            fast-todo
          </h1>
          <div className="nav-links">
            <Link to="/signin" className="nav-link">Sign In</Link>
            <Link to="/signup" className="nav-button">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <div className="badge">
            <span className="badge-text">Simple. Fast. Efficient.</span>
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
            <Link to="/signup" className="cta-primary">
              Start Free Today
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
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

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Instantly add, edit, and complete tasks without any lag or delays
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Stay Focused</h3>
            <p className="feature-description">
              Clean, distraction-free interface keeps you focused on your priorities
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Your data is encrypted and secure, accessible only to you
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">© 2025 fast-todo. Built with focus and simplicity.</p>
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
