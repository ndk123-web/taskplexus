import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log('Sign in:', { email, password });
    navigate('/dashboard');
  };

  return (
    <div className="signin-container">
      {/* Navigation */}
      <nav className="signin-navbar">
        <div className="signin-nav-content">
          <Link to="/" className="signin-nav-logo">
            <span className="signin-nav-logo-icon">⚡</span>
            TaskPlexus
          </Link>
          <div className="signin-nav-links">
            <Link to="/" className="signin-nav-link">Home</Link>
            <Link to="/signup" className="signin-nav-button">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="signin-main">
        <div className="signin-content-wrapper">
          {/* Left Side - Info */}
          <div className="signin-left">
            <div className="signin-hero">
              <h1 className="signin-hero-title">
                Welcome Back to
                <br />
                <span className="signin-gradient-text">TaskPlexus</span>
              </h1>
              <p className="signin-hero-description">
                Continue your productivity journey. Sign in to access your tasks and stay organized.
              </p>
              
              <div className="signin-features">
                <div className="signin-feature-item">
                  <div className="signin-feature-icon">✓</div>
                  <span>Secure & encrypted</span>
                </div>
                <div className="signin-feature-item">
                  <div className="signin-feature-icon">✓</div>
                  <span>All your tasks synced</span>
                </div>
                <div className="signin-feature-item">
                  <div className="signin-feature-icon">✓</div>
                  <span>Access anywhere</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="signin-right">
            <div className="signin-card">
              <div className="signin-card-header">
                <h2 className="signin-card-title">Sign In</h2>
                <p className="signin-card-subtitle">Enter your credentials to continue</p>
              </div>

              <form className="signin-form" onSubmit={handleSubmit}>
                <div className="signin-form-group">
                  <label htmlFor="email" className="signin-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="signin-input"
                    required
                  />
                </div>

                <div className="signin-form-group">
                  <label htmlFor="password" className="signin-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="signin-input"
                    required
                  />
                </div>

                <div className="signin-form-options">
                  <label className="signin-checkbox">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="signin-forgot">Forgot password?</a>
                </div>

                <button type="submit" className="signin-submit-btn">
                  Sign In
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className="signin-divider">
                  <span>New to fast-todo?</span>
                </div>

                <Link to="/signup" className="signin-signup-link">
                  Create an account
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="signin-background">
        <div className="signin-bg-circle signin-bg-circle-1"></div>
        <div className="signin-bg-circle signin-bg-circle-2"></div>
        <div className="signin-bg-grid"></div>
      </div>
    </div>
  );
};

export default SignIn;
