import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore, { type User } from '../store/useUserInfo';
import '../styles/pages/Settings.css';
import updateUserNameApi from '../api/endpoints/updateUserNameApi';
import { useToast } from '../components/ui/ToastProvider';

const Settings = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userInfo, signOutUser, signinUser } = useUserStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userInfo?.fullName || '');

  const handleSaveName = async () => {
    if (!userInfo) {
      showToast('Not authenticated', 'error');
      return;
    }
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Name cannot be empty', 'warning');
      return;
    }
    if (trimmed === userInfo.fullName) {
      showToast('Name unchanged', 'info');
      return;
    }
    try {
      const response: any = await updateUserNameApi({
        userId: userInfo.userId,
        newName: trimmed,
      });
      if (response && response.success === 'true') {
        const updatedUser: User = {
          email: userInfo.email,
          userId: userInfo.userId,
          _accessToken: userInfo._accessToken,
          _refreshToken: userInfo._refreshToken,
          fullName: trimmed,
          auth: userInfo.auth ?? true,
        };
        signinUser(updatedUser);
        setIsEditingName(false);
        showToast('Name updated successfully', 'success');
      } else {
        showToast(response?.message || 'Failed to update name', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Unexpected error updating name', 'error');
    }
  };

  const handleLogout = () => {
    signOutUser();
    showToast('Signed out', 'info');
    navigate('/');
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <Link to="/dashboard" className="back-link">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11.25 13.5L6.75 9L11.25 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </Link>
        <div className="header-content">
          <h1>Settings</h1>
          <p>Manage your account preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="settings-content">
        
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="card-header">
            <h2>Profile</h2>
          </div>
          <div className="card-body">
            <div className="profile-section">
              <div className="avatar">
                {userInfo?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <div className="name-section">
                  {isEditingName ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="name-input"
                        placeholder="Enter your name"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button onClick={handleSaveName} className="save-btn">Save</button>
                        <button onClick={() => setIsEditingName(false)} className="cancel-btn">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="name-display">
                      <h3>{userInfo?.fullName || 'No name set'}</h3>
                      <button onClick={() => setIsEditingName(true)} className="edit-btn">Edit</button>
                    </div>
                  )}
                </div>
                <div className="email-section">
                  <span className="email">{userInfo?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Card */}
        <div className="card plan-card">
          <div className="card-header">
            <h2>Plan</h2>
          </div>
          <div className="card-body">
            <div className="plan-info">
              <div className="plan-badge">
                <span className="badge-text">FREE</span>
              </div>
              <div className="plan-details">
                <h3>Free Plan</h3>
                <p>Perfect for personal use</p>
              </div>
            </div>
            <div className="plan-limits">
              <div className="limit-item">
                <span className="limit-number">5</span>
                <span className="limit-label">Workspaces</span>
              </div>
              <div className="limit-item">
                <span className="limit-number">15</span>
                <span className="limit-label">Todos each</span>
              </div>
              <div className="limit-item">
                <span className="limit-number">5</span>
                <span className="limit-label">Goals each</span>
              </div>
            </div>
            <div className="upgrade-section">
              <button className="upgrade-btn">
                <span>Premium Coming Soon</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L10.5 7H13L10.5 9L11.5 14L8 11L4.5 14L5.5 9L3 7H5.5L8 2Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Account Card */}
        <div className="card account-card">
          <div className="card-header">
            <h2>Account</h2>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Email Notifications</span>
                <span className="setting-desc">Get updates about your tasks</span>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Auto Save</span>
                <span className="setting-desc">Automatically save your work</span>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Logout Card */}
        <div className="card logout-card">
          <div className="card-body">
            <div className="logout-section">
              <div className="logout-info">
                <h3>Sign Out</h3>
                <p>You'll need to sign in again to access your account</p>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 14H3C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 11L14 8L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
