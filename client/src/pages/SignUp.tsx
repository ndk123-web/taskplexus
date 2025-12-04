import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import signUpUserApi from '../api/endpoints/signUpUserApi';
import useUserStore from '../store/useUserInfo';
import '../styles/pages/SignUp.css';
import { useToast } from '../components/ui/ToastProvider';
import { auth } from '../config/firebase';
import { signInWithPopup , GoogleAuthProvider } from 'firebase/auth';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { signinUser } = useUserStore();

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast('All fields are required', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const response: any = await signUpUserApi({ fullName: name, email, password, googleLogin: false, idToken: "" });
      console.log('Sign Up Response:', response);
      if (response?.success && response.success !== 'true') {
        showToast(response?.Error || 'Sign up failed', 'error');
        return;
      }
      if (response && response.response) {
        signinUser(response.response);
        showToast('Account created successfully', 'success');
        navigate('/dashboard');
      } else {
        showToast('Invalid sign up response', 'error');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      showToast(error?.message || 'Unexpected sign up error', 'error');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      const googleProvider = new GoogleAuthProvider();
      const googleLoginFlag = true;
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      
      console.log("Google Login sending flag: ", googleLoginFlag);
      console.log("Firebase User:", firebaseUser);
      
      const response: any = await signUpUserApi({ 
        fullName: firebaseUser.displayName || 'Google User', 
        email: firebaseUser.email || '', 
        password: '', 
        googleLogin: googleLoginFlag, 
        idToken 
      });
      
      console.log('Sign Up Response:', response);
      if (response?.success && response.success !== 'true') {
        showToast(response?.Error || 'Sign up failed', 'error');
        return;
      }
      if (response && response.response) {
        signinUser(response.response);
        showToast('Account created successfully', 'success');
        navigate('/dashboard');
      } else {
        showToast(response.Error || 'Invalid sign up response', 'error');
      }
    } catch (error: any) {
      console.error('Google sign up error:', error);
      showToast(error?.message || 'Unexpected sign up error', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Navigation */}
      <nav className="signup-navbar">
        <div className="signup-nav-content">
          <Link to="/" className="signup-nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={40} />
            <span style={{ marginLeft: '10px' }}>TaskPlexus</span>
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
                <p className="signup-card-subtitle">Join TaskPlexus and start organizing your life</p>
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

                <button 
                  type="button"
                  onClick={handleGoogleSignUp} 
                  className="google-signup-btn"
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <div className="google-loader"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <svg className="google-logo" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Sign Up With Google</span>
                    </>
                  )}
                </button>
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
                <span className="signup-gradient-text">TaskPlexus</span>
              </h1>
              <p className="signup-hero-description">
                Join thousands of users who trust TaskPlexus to organize their tasks and boost productivity.
              </p>
              
              <div className="signup-benefits">
                <div className="signup-benefit-item">
                  <div className="signup-benefit-icon"><img src="/TaskPlexus.png" alt="TaskPlexus" width={48} /></div>
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
