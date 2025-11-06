import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Handle sign up logic here
    console.log('Sign up:', { name, email, password });
    navigate('/dashboard');
  };

  return (
    <div className="signup-container">
      {/* Navigation */}
      <nav className="signup-navbar">
        <div className="signup-nav-content">
          <Link to="/" className="signup-nav-logo">
            <span className="signup-nav-logo-icon">⚡</span>
            fast-todo
          </Link>
          <div className="signup-nav-links">
            <Link to="/" className="signup-nav-link">Home</Link>
            <Link to="/signin" className="signup-nav-button">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="signup-main">
        <div className="signup-content-wrapper">
          {/* Left Side - Form */}
          <div className="signup-left">
            <div className="signup-card">
              <div className="signup-card-header">
                <h2 className="signup-card-title">Create Account</h2>
                <p className="signup-card-subtitle">Join fast-todo and start organizing your life</p>
              </div>

              <form className="signup-form" onSubmit={handleSubmit}>
                <div className="signup-form-group">
                  <label htmlFor="name" className="signup-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="signup-input"
                    required
                  />
                </div>

                <div className="signup-form-group">
                  <label htmlFor="email" className="signup-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="signup-input"
                    required
                  />
                </div>

                <div className="signup-form-group">
                  <label htmlFor="password" className="signup-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="signup-input"
                    required
                  />
                </div>

                <div className="signup-form-group">
                  <label htmlFor="confirmPassword" className="signup-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="signup-input"
                    required
                  />
                </div>

                <div className="signup-terms">
                  <label className="signup-checkbox">
                    <input type="checkbox" required />
                    <span>I agree to the Terms & Conditions</span>
                  </label>
                </div>

                <button type="submit" className="signup-submit-btn">
                  Create Account
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className="signup-divider">
                  <span>Already have an account?</span>
                </div>

                <Link to="/signin" className="signup-signin-link">
                  Sign in instead
                </Link>
              </form>
            </div>
          </div>

          {/* Right Side - Info */}
          <div className="signup-right">
            <div className="signup-hero">
              <h1 className="signup-hero-title">
                Start Your Journey with
                <br />
                <span className="signup-gradient-text">fast-todo</span>
              </h1>
              <p className="signup-hero-description">
                Join thousands of users who trust fast-todo to organize their tasks and boost productivity.
              </p>
              
              <div className="signup-benefits">
                <div className="signup-benefit-item">
                  <div className="signup-benefit-icon">⚡</div>
                  <div>
                    <h3>Lightning Fast</h3>
                    <p>Create and manage tasks instantly</p>
                  </div>
                </div>
                <div className="signup-benefit-item">
                  <div className="signup-benefit-icon">🔒</div>
                  <div>
                    <h3>Secure & Private</h3>
                    <p>Your data is encrypted and protected</p>
                  </div>
                </div>
                <div className="signup-benefit-item">
                  <div className="signup-benefit-icon">🎯</div>
                  <div>
                    <h3>Stay Organized</h3>
                    <p>Never miss a task or deadline</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="signup-background">
        <div className="signup-bg-circle signup-bg-circle-1"></div>
        <div className="signup-bg-circle signup-bg-circle-2"></div>
        <div className="signup-bg-grid"></div>
      </div>
    </div>
  );
};

export default SignUp;
