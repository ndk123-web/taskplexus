import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import resetPasswordApi from '../api/endpoints/resetPasswordApi';
import { useToast } from '../components/ui/ToastProvider';
import SEO from '../components/SEO';
import '../styles/pages/SignIn.css'; // Reusing SignIn styles

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      showToast('Invalid reset link. Missing email or token.', 'error');
      // Optionally redirect to home or forget password after a delay
    }
  }, [email, token, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !token) {
      showToast('Invalid reset link.', 'error');
      return;
    }

    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
    }

    setLoading(true);
    try {
      const response : any = await resetPasswordApi({ email, token, newPassword });
        console.log("Response from reset password API:", response);
      if (response?.success !== "true") {
        throw new Error(response.Error || 'Failed to reset password');
      }

      showToast('Password reset successfully! Please sign in.', 'success');
      setTimeout(() => navigate('/signin'), 2000);
    
    } catch (error: any) {
      console.error('Error resetting password:', error);
      showToast('Failed to reset password. The link may have expired.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
      return (
        <div className="signin-container">
            <div className="signin-main">
                <div className="signin-content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
                    <div className="signin-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                        <h2 className="signin-card-title" style={{ color: '#EF4444', justifyContent: 'center' }}>Invalid Link</h2>
                        <p className="signin-card-subtitle">This password reset link is invalid or incomplete.</p>
                        <Link to="/forget-password" className="signin-submit-btn" style={{ marginTop: '20px', textDecoration: 'none', display: 'flex' }}>
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="signin-container">
      <SEO 
        title="Reset Password" 
        description="Set a new password for your TaskPlexus account."
      />
      {/* Navigation */}
      <nav className="signin-navbar">
        <div className="signin-nav-content">
          <Link to="/" className="signin-nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={40} />
            <span style={{ marginLeft: '10px' }}>TaskPlexus</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="signin-main">
        <div className="signin-content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
          <div className="signin-right" style={{ width: '100%', maxWidth: '480px', margin: '0 auto', animation: 'none' }}>
            <div className="signin-card">
              <div className="signin-card-header">
                <h2 className="signin-card-title">Reset Password</h2>
                <p className="signin-card-subtitle">Create a new strong password</p>
              </div>

              <form className="signin-form" onSubmit={handleSubmit}>
                <div className="signin-form-group">
                  <label htmlFor="newPassword" className="signin-label">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="signin-input"
                    required
                    minLength={6}
                  />
                </div>

                <div className="signin-form-group">
                  <label htmlFor="confirmPassword" className="signin-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="signin-input"
                    required
                    minLength={6}
                  />
                </div>

                <button 
                  type="submit" 
                  className="signin-submit-btn"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div className="signin-divider">
                  <span>Or</span>
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

export default ResetPassword;
