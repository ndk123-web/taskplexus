import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import addEmailForNewPassApi from '../api/endpoints/addEmailForNewPassApi';
import { useToast } from '../components/ui/ToastProvider';
import SEO from '../components/SEO';
import '../styles/pages/SignIn.css'; // Reusing SignIn styles for consistency

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Email is required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response : any = await addEmailForNewPassApi({ email,userId: "User" });
      console.log("Response from forget password API:", response);
      // Regardless of whether the email exists or not (security best practice), 
      // or if the API returns success, we show the success message and disable the button.
      // The user requirement says: "already agar ooska email hoga then oose email aayega else not"

      if (response?.success !== "true") {
        throw new Error(response.Error || 'Failed to send reset link');
      }
      
      setIsSubmitted(true);
      showToast('If an account exists with this email, a reset link has been sent.', 'success');
      
      // The button remains disabled (isSubmitted = true) for this session.
      // User said: "refresh krne ke baad again submit button dikhega" (After refresh, button appears again)
      // So we don't need to persist this state.
      
    } catch (error: any) {
      console.error('Error sending forget password email:', error);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <SEO 
        title="Forgot Password" 
        description="Reset your TaskPlexus password."
      />
      {/* Navigation */}
      <nav className="signin-navbar">
        <div className="signin-nav-content">
          <Link to="/" className="signin-nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={40} />
            <span style={{ marginLeft: '10px' }}>TaskPlexus</span>
          </Link>
          <div className="signin-nav-links">
            <Link to="/signin" className="signin-nav-link">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="signin-main">
        <div className="signin-content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
          {/* Centered Form */}
          <div className="signin-right" style={{ width: '100%', maxWidth: '480px', margin: '0 auto', animation: 'none' }}>
            <div className="signin-card">
              <div className="signin-card-header">
                <h2 className="signin-card-title">Forgot Password?</h2>
                <p className="signin-card-subtitle">Enter your email to receive a reset link</p>
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
                    disabled={isSubmitted}
                  />
                </div>

                <button 
                  type="submit" 
                  className="signin-submit-btn"
                  disabled={loading || isSubmitted}
                  style={{ opacity: (loading || isSubmitted) ? 0.7 : 1, cursor: (loading || isSubmitted) ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Sending...' : isSubmitted ? 'Link Sent' : 'Send Reset Link'}
                  {!loading && !isSubmitted && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                {isSubmitted && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <p style={{ color: '#10B981', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
                      Please check your email inbox (and spam folder) for the reset link. 
                      You can request another link in 10 minutes or by refreshing the page.
                    </p>
                  </div>
                )}

                <div className="signin-divider">
                  <span>Remember your password?</span>
                </div>

                <Link to="/signin" className="signin-signup-link">
                  Back to Sign In
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

export default ForgetPassword;
