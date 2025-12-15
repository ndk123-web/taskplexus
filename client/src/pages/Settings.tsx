import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore, { type User, type PlanDetails, type PlanType } from '../store/useUserInfo';
import '../styles/pages/Settings.css';
import updateUserNameApi from '../api/endpoints/updateUserNameApi';
import { useToast } from '../components/ui/ToastProvider';
import { dynamicRazorPayLoad , openRazorpayCheckout } from '../utils/razorpay';
import '../styles/pages/Home.css'
import SEO from '../components/SEO';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { clearPendingOperations } from '../store/indexDB/pendingOps/usePendingOps';

const Settings = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userInfo, signOutUser, signinUser } = useUserStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userInfo?.fullName || '');

  // Plan details
  const planDetails: Record<'FREE' | 'PRO_MONTHLY', PlanDetails> = {
    FREE: {
      type: 'FREE',
      workspaces: 2,
      todosPerWorkspace: 'Unlimited',
      goalsPerWorkspace: 'Unlimited',
      aiPlannerRequests: '5 Lifetime',
      aiChatRequests: '5 Lifetime',
      aiPlanRequestsInDay: 5, 
      aiChatRequestsInDay: 5, 
      features: ['2 Workspaces', 'Unlimited Todos', 'Unlimited Goals', 'Basic sync', 'AI Planner (5 lifetime)', 'AI Chat (5 lifetime)'],
    },
    PRO_MONTHLY: {
      type: 'PRO_MONTHLY',
      workspaces: 10,
      todosPerWorkspace: 'Unlimited',
      goalsPerWorkspace: 'Unlimited',
      syncTime: 'Faster',
      aiPlannerRequests: '50/day',
      aiChatRequests: '100/day',
      aiPlanRequestsInDay: 50, 
      aiChatRequestsInDay: 100, 
      features: ['10 Workspaces', 'Unlimited Todos', 'Unlimited Goals', 'Faster sync', 'AI Planner (50/day)', 'AI Chat (100/day)'],
    },
  };

  const currentPlan: PlanType = userInfo?.plan || 'FREE';
  const currentPlanDetails: any = planDetails[currentPlan];
  const otherPlan = currentPlan === 'FREE' ? 'PRO_MONTHLY' : 'FREE';
  const otherPlanDetails = planDetails[otherPlan];
  const [createOrderLoader , setCreateOrderLoader] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
          plan: userInfo.plan,
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

  // const handleUpgrade = () => {
  //   showToast('Upgrade feature coming soon!', 'info');
    
  // };

  
    const handleUpgrade = async () => {
      // lazy load razorpay script on button click
      await dynamicRazorPayLoad()

      setCreateOrderLoader(true);
      try {
        const order = {
          amount : import.meta.env.VITE_TASKPLEXUS_PREMIUM_MONEY, // amount in paise (100 INR)
          currency : "INR",
        }
        const data: any = await openRazorpayCheckout(order);
        if (data) {
          // Do NOT upgrade immediately. Webhook will update payments status; frontend polls.
          setIsProcessing(true);
          showToast('Payment verified. Finalizing…', 'info');
        } else {
          showToast('Payment failed. If charged, it will be refunded.', 'error');
        }
      } catch (error) {
        console.error("Payment error:", error);
        showToast('Unexpected payment error', 'error');
      } finally {
        setCreateOrderLoader(false);
      }
    }

  // Auto-redirect when plan becomes PRO via webhook + polling
  useEffect(() => {
    if (userInfo?.plan === 'PRO_MONTHLY' && isProcessing) {
      showToast('Premium activated! Enjoy PRO features.', 'success');
      setIsProcessing(false);
      navigate('/dashboard', { replace: true });
    }
  }, [userInfo?.plan, isProcessing, navigate]);

  const handleLogout = async () => {
    const store = useWorkspaceStore.getState();
    // Clear in-memory state first
    store.clearWorkspace();
    // Sign out & navigate quickly to unmount Dashboard (closes active IndexedDB usage)
    signOutUser();
    navigate('/');

    // Defer heavy cleanup to next tick to avoid race with component effects
    setTimeout(async () => {
      try {
        useWorkspaceStore.persist.clearStorage();
        console.log('✅ Persist storage cleared');
      } catch (e) {
        console.warn('⚠️ Failed clearing persist storage', e);
      }
      try {
        const req = indexedDB.deleteDatabase('workspaceDB');
        req.onsuccess = () => console.log('✅ workspaceDB deleted');
        req.onerror = (ev) => console.warn('⚠️ workspaceDB delete error', ev);
        req.onblocked = () => console.warn('⚠️ workspaceDB delete blocked (another open connection)');
      } catch (e) {
        console.warn('⚠️ deleteDatabase threw synchronously', e);
      }
      await clearPendingOperations();
      console.log('✅ Pending operations cleared');
    }, 2000);
  };

  return (
    <div className="settings-container">
      <SEO 
        title="Settings" 
        description="Manage your account settings, profile, and subscription plan."
      />
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

        {/* Plan Comparison Card */}
        <div className="card plan-card">
          <div className="card-header">
            <h2>Subscription Plan</h2>
          </div>
          <div className="card-body">
            <div className="plan-comparison-container">
              {/* Current Plan */}
              <div className={`plan-box plan-box-${currentPlan.toLowerCase()}`}>
                <div className="plan-badge-container">
                  <span className={`plan-badge plan-badge-${currentPlan.toLowerCase()}`}>
                    {currentPlan === 'PRO_MONTHLY' && '⭐ '}
                    {currentPlan}
                  </span>
                  {currentPlan === 'FREE' && <span className="plan-status">Current Plan</span>}
                  {currentPlan === 'PRO_MONTHLY' && <span className="plan-status premium">Active</span>}
                </div>
                
                <div className="plan-content">
                  <h3>{currentPlan === 'FREE' ? 'Free Plan' : 'Premium Plan'}</h3>
                  <p className="plan-description">
                    {currentPlan === 'FREE' ? 'Perfect for getting started' : 'For power users'}
                  </p>
                </div>

                <div className="plan-features">
                  <div className="feature-row">
                    <span className="feature-label">Workspaces</span>
                    <span className="feature-value">{currentPlanDetails.workspaces}</span>
                  </div>
                  <div className="feature-row">
                    <span className="feature-label">Todos per Workspace</span>
                    <span className="feature-value">{currentPlanDetails.todosPerWorkspace}</span>
                  </div>
                  <div className="feature-row">
                    <span className="feature-label">Goals per Workspace</span>
                    <span className="feature-value">{currentPlanDetails.goalsPerWorkspace}</span>
                  </div>
                  <div className="feature-row">
                    <span className="feature-label">AI Planner</span>
                    <span className="feature-value">{currentPlanDetails.aiPlannerRequests}</span>
                  </div>
                  <div className="feature-row">
                    <span className="feature-label">AI Chat</span>
                    <span className="feature-value">{currentPlanDetails.aiChatRequests}</span>
                  </div>
                  {currentPlan === 'PRO_MONTHLY' && (
                    <>
                      <div className="feature-row">
                        <span className="feature-label">Sync Speed</span>
                        <span className="feature-value">⚡ Faster</span>
                      </div>
                      <div className="feature-row">
                        <span className="feature-label">AI Requests/Day</span>
                        <span className="feature-value">{currentPlanDetails?.aiRequestsPerDay}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="plan-action">
                  {currentPlan === 'FREE' && (
                    <button onClick={handleUpgrade} className="btn-upgrade">
                      <span>Upgrade to Premium</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L10.5 7H13L10.5 9L11.5 14L8 11L4.5 14L5.5 9L3 7H5.5L8 2Z" fill="currentColor"/>
                      </svg>
                    </button>
                  )}
                  {currentPlan === 'PRO_MONTHLY' && (
                    <div className="plan-active-badge">✓ Currently Active</div>
                  )}
                </div>
              </div>

              {/* Other Plan Preview */}
              <div className={`plan-box plan-box-preview plan-box-${otherPlan.toLowerCase()}-preview`}>
                <div className="plan-badge-container">
                  <span className={`plan-badge plan-badge-${otherPlan.toLowerCase()}`}>
                    {otherPlan === 'PRO_MONTHLY' && '⭐ '}
                    {otherPlan}
                  </span>
                </div>
                
                <div className="plan-content">
                  <h3>{otherPlan === 'FREE' ? 'Free Plan' : 'Premium Plan'}</h3>
                  <p className="plan-description">
                    {otherPlan === 'FREE' ? 'Perfect for getting started' : 'For power users'}
                  </p>
                </div>

                <div className="plan-features">
                  <div className="feature-row">
                    <span className="feature-label">Workspaces</span>
                    <span className="feature-value">{otherPlanDetails.workspaces}</span>
                  </div>
                  <div className="feature-row">
                    <span className="feature-label">Todos per Workspace</span>
                    <span className="feature-value">{otherPlanDetails.todosPerWorkspace}</span>
                  </div>
                  <div className="feature-row">
                    <span className="feature-label">Goals per Workspace</span>
                    <span className="feature-value">{otherPlanDetails.goalsPerWorkspace}</span>
                  </div>
                  {otherPlan === 'PRO_MONTHLY' && (
                    <>
                      <div className="feature-row">
                        <span className="feature-label">Sync Speed</span>
                        <span className="feature-value">⚡ Faster</span>
                      </div>
                      <div className="feature-row">
                        <span className="feature-label">AI Planner</span>
                        <span className="feature-value">{otherPlanDetails.aiPlannerRequests}</span>
                      </div>
                      <div className="feature-row">
                        <span className="feature-label">AI Chat</span>
                        <span className="feature-value">{otherPlanDetails.aiChatRequests}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="plan-action">
                  {otherPlan === 'PRO_MONTHLY' && (
                    <button onClick={handleUpgrade} className="btn-upgrade">
                      {createOrderLoader ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="spinner"></span>
                      Processing...
                      </span>
                      ): (
                       <span>Upgrade Now</span>
                      )}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L10.5 7H13L10.5 9L11.5 14L8 11L4.5 14L5.5 9L3 7H5.5L8 2Z" fill="currentColor"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
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
