import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import signInUserApi from '../api/endpoints/signInUserApi';
import type { signInResponse } from '../types/signType';
import useUserStore from '../store/useUserInfo';
import '../styles/pages/SignIn.css';
import { useToast } from '../components/ui/ToastProvider';
import { auth } from "../config/firebase";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleLogin , setGoogleLogin] = useState(false)
  const navigate = useNavigate();
  let { signinUser } = useUserStore();

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Email & password required', 'warning');
      return;
    }
    try {
      const response: signInResponse & { success?: string | boolean; Error?: string } = await signInUserApi({ email, password, googleLogin, idToken: "" });
      console.log('Sign In Response:', response);
      const successFlag = String(response.success).toLowerCase();
      if (successFlag !== 'true') {
        showToast('Password / Username is Invalid', 'error');
        return;
      }
      signinUser(response.response);
      showToast('Signed in successfully', 'success');
      setTimeout(() => navigate('/dashboard'), 120);
    } catch (error: any) {
      console.error('Error during sign in:', error);
      showToast('Password / Username is Invalid', 'error');
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      // local flag avoids async state race; we still set UI state below
      const googleFlag = true;
      setGoogleLogin(true);
      const googleAuthProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      console.log("Firebase User:", firebaseUser);
      console.log("Google Login sending flag: ", googleFlag); 
      try {
      const response: signInResponse & { success?: string | boolean; Error?: string } = await signInUserApi({ 
        email: firebaseUser.email || '',
        password: '',
        googleLogin: googleFlag,
        idToken 
      });
      console.log('Sign In Response:', response);
      const successGoogle = String(response.success).toLowerCase();
      if (successGoogle !== 'true') {
        showToast(response.Error || 'Password / Username is Invalid', 'error');
        return;
      }
      signinUser(response.response);
      showToast('Signed in successfully', 'success');
      setTimeout(() => navigate('/dashboard'), 160);
    } catch (error: any) {
      console.error('Error during sign in:', error);
      showToast(error.message || 'Password / Username is Invalid', 'error');
    }

      // showToast('Google sign-in success', 'success');
      // If you want to immediately treat this as a backend sign-in, call an API here with idToken.
      // navigate('/dashboard');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      showToast(err?.message || 'Google sign-in failed', 'error');
    } finally {
      setGoogleLoading(false);
      setGoogleLogin(false)
    }
  };

  return (
    <div className="signin-container">
      {/* Navigation */}
      <nav className="signin-navbar">
        <div className="signin-nav-content">
          <Link to="/" className="signin-nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={40} />
            <span style={{ marginLeft: '10px' }}>TaskPlexus</span>
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

                <button
                  type="button"
                  onClick={handleSignInWithGoogle}
                  className="google-signin-btn"
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <div className="google-loader"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="google-logo" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Sign In With Google</span>
                    </>
                  )}
                </button>
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
