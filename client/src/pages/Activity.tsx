import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { useToast } from '../components/ui/ToastProvider';
import '../styles/pages/Activity.css';
import { getActivitiesApi } from '../api/activity';

interface Activity {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_deleted' | 'goal_created' | 'goal_completed' | 'workspace_created';
  message: string;
  timestamp: Date;
  metadata?: {
    taskName?: string;
    goalName?: string;
    workspaceName?: string;
    priority?: string;
    name?: string 
    workspaceId?: string 
    id?: string
    activityType?: string 
  };
}

const Activity = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'both' | 'tasks' | 'goals'>('both');
  const [page] = useState(1)
  const [limit] = useState(5)

  useEffect(() => {
    const loadActivities = async () => {
      if (!currentWorkspace?.id) return;
      
      setLoading(true);

      try {
        const response: any = await getActivitiesApi({
          workspaceId: currentWorkspace.id,
          filter: filter === 'both' ? 'both' : filter,
          page: page,
          limit: limit
        });
        
        console.log("Activities Response:", response);

        if (response?.success !== "true") {
          showToast('Failed to fetch activities', 'error');
          setActivities([]);
        } else {
          const activitiesData: any[] = response?.response || [];
          
          // Convert timestamp strings to Date objects
          const processedActivities = activitiesData.map(activity => ({
            ...activity,
            timestamp: activity.timeStamp ? new Date(activity.timeStamp) : new Date(),
            type: activity.activityType?.toLowerCase().replace('_', '_') || 'task_created'
          }));
          
          setActivities(processedActivities);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        showToast('Error loading activities', 'error');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [currentWorkspace?.id, filter, page, limit]);

  // Activities are already filtered by the API based on filter parameter
  console.log("Activities:",activities)
  const filteredActivities = activities.filter(activity => {
    if (filter === 'both') return true;
    if (filter === 'tasks') return activity.type.includes('task');
    if (filter === 'goals') return activity.type.includes('goal');
  })

  // Format relative time
  const formatRelativeTime = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Unknown';
    
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMins = Math.floor(diffInMs / 1000 / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Get icon for activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_created':
        return (
          <div className="activity-icon activity-icon-created">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'task_completed':
        return (
          <div className="activity-icon activity-icon-completed">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16 6L7.5 14.5L4 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case 'task_deleted':
        return (
          <div className="activity-icon activity-icon-deleted">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 7L7 13M7 7L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'goal_created':
        return (
          <div className="activity-icon activity-icon-goal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        );
      case 'goal_completed':
        return (
          <div className="activity-icon activity-icon-goal-completed">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'workspace_created':
        return (
          <div className="activity-icon activity-icon-workspace">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6C3 5.44772 3.44772 5 4 5H7L8 7H16C16.5523 7 17 7.44772 17 8V14C17 14.5523 16.5523 15 16 15H4C3.44772 15 3 14.5523 3 14V6Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="activity-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2" fill="currentColor"/>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="activity-container">
      {/* Header */}
      <header className="activity-header">
        <button className="activity-back-btn" onClick={() => navigate('/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="activity-header-content">
          <div className="activity-header-left">
            <h1 className="activity-title">Activity Feed</h1>
            <p className="activity-subtitle">
              Track all activities in <span className="workspace-name">{currentWorkspace?.name || 'your workspace'}</span>
            </p>
          </div>
          <div className="activity-header-right">
            <div className="activity-filter-tabs">
              <button 
                className={`filter-tab ${filter === 'both' ? 'active' : ''}`}
                onClick={() => setFilter('both')}
              >
                Both
              </button>
              <button 
                className={`filter-tab ${filter === 'tasks' ? 'active' : ''}`}
                onClick={() => setFilter('tasks')}
              >
                Tasks
              </button>
              <button 
                className={`filter-tab ${filter === 'goals' ? 'active' : ''}`}
                onClick={() => setFilter('goals')}
              >
                Goals
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Activity Content */}
      <div className="activity-content">
        {loading ? (
          <div className="activity-loading">
            <div className="loading-spinner"></div>
            <p>Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="activity-empty">
            <div className="empty-icon">📋</div>
            <h3>No activities yet</h3>
            <p>Start creating tasks and goals to see your activity here</p>
            <button className="empty-action-btn" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="activity-list">
            {filteredActivities.slice(0,5).map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-item-icon">
                  {getActivityIcon(activity?.type)}
                </div>
                <div className="activity-item-content">
                  <p className="activity-item-message">{activity.metadata?.name}</p>
                  {activity.metadata && (
                    <div className="activity-item-metadata">
                      {activity.metadata.priority && (
                        <span className={`priority-badge priority-${activity.metadata.priority}`}>
                          {activity.metadata.priority}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="activity-item-time">{formatRelativeTime(activity.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="activity-stats">
        <div className="stat-item">
          <span className="stat-value">{activities.filter(a => a.type.includes('task')).length}</span>
          <span className="stat-label">Task Activities</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{activities.filter(a => a.type.includes('goal')).length}</span>
          <span className="stat-label">Goal Activities</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{activities.length}</span>
          <span className="stat-label">Total Activities</span>
        </div>
      </div>
    </div>
  );
};

export default Activity;
