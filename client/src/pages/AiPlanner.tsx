import { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/AiPlanner.css';
import { sendAiPlannerApi } from '../api';
import useUserStore from '../store/useUserInfo';
import useWorkspaceStore from '../store/useWorkspaceStore';

interface AiPlanItem {
  taskId: string;
  title: string;
  startTime: string;
  endTime: string;
  priority: string;
}

interface AiPlannerResponse {
  id: string;
  userId: string;
  workspace: string;
  date: string;
  plan: AiPlanItem[];
  createdAt: string;
  updatedAt: string;
  context: string;
  summary: string;
}

const AiPlanner = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [userContext, setUserContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [planData, setPlanData] = useState<AiPlannerResponse | null>(null);

  const userId = useUserStore(state => state.userInfo?.userId)
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace);
  // Mock data for initial render (as requested by user)
  // useEffect(() => {
  //   const mockData: AiPlannerResponse = {
  //     id: "69387db25dd394f84fc80751",
  //     userId: "690ef10c901a11c6bb8d9f09",
  //     workspace: "6922f702bc606f45d19149d8",
  //     date: new Date().toISOString().split('T')[0], // Use today for demo
  //     plan: [
  //       {
  //         taskId: "1",
  //         title: "DSA 1",
  //         startTime: "09:00",
  //         endTime: "11:00",
  //         priority: "medium"
  //       },
  //       {
  //         taskId: "2",
  //         title: "DSA 2",
  //         startTime: "11:00",
  //         endTime: "13:00",
  //         priority: "medium"
  //       },
  //       {
  //         taskId: "3",
  //         title: "DSA 3",
  //         startTime: "13:00",
  //         endTime: "15:00",
  //         priority: "medium"
  //       }
  //     ],
  //     createdAt: "2025-12-10T01:21:14.2775181+05:30",
  //     updatedAt: "2025-12-10T01:21:14.2775181+05:30",
  //     context: "Its About DSA and currently I Dont have TImeLine but i have 2,3 hours for each task",
  //     summary: "Today's plan includes 3 DSA tasks, each allocated 2 hours. The total dedicated study time is 6 hours, starting from 09:00 and concluding at 15:00."
  //   };
  //   setPlanData(mockData);
  // }, []);

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    // Simulate AI generation

    const handleGeneratePlan = async () => {
      const response: any = await sendAiPlannerApi({
        context: userContext,
        userId: userId || '',
        workspaceId: currentWorkspace?.id || ''
      })

      console.log("AI Planner Response:", response);

      if (response?.success !== "true") {
        console.error("Failed to generate AI plan");
      } 

      setPlanData(response?.response || [])
    }

    handleGeneratePlan();

    setTimeout(() => {
      setIsGenerating(false);
      setShowContextInput(false);
      // In a real app, we would fetch new data here
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const diff = endMin - startMin;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="ai-planner-container">
      {/* Header */}
      <header className="planner-header">
        <div className="planner-header-left">
          <button className="planner-back-btn" onClick={() => navigate('/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div className="planner-header-title">
            <div className="planner-ai-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10.5 6L16 6.5L11.5 10.5L13 16L8 13L3 16L4.5 10.5L0 6.5L5.5 6L8 1Z" fill="currentColor"/>
              </svg>
              AI Powered
            </div>
            <h1>Daily AI Planner</h1>
            <p>{planData ? formatDate(planData.date) : new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
        </p>
          </div>
        </div>
        <div className="planner-header-actions">
          <button 
            className="context-btn"
            onClick={() => setShowContextInput(!showContextInput)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 12V10M10 8H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {showContextInput ? 'Hide Context' : 'Add Context'}
          </button>
          <button className="generate-plan-btn" onClick={handleGeneratePlan} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <div className="btn-spinner"></div>
                Generating...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Regenerate Plan
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="planner-content">
        {/* Context Input Section */}
        {showContextInput && (
          <div className="context-section">
            <div className="context-card">
              <div className="context-header">
                <h3>Provide Context for AI</h3>
                <p>Tell us about your day, priorities, or any specific requirements</p>
              </div>
              <textarea
                className="context-input"
                placeholder="Example: I have a client meeting at 2 PM, need to finish the project report, and want to exercise in the morning..."
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                rows={4}
              />
              <div className="context-examples">
                <span className="examples-label">Quick examples:</span>
                <button 
                  className="example-chip"
                  onClick={() => setUserContext('I have important meetings today and need focused work time in the morning')}
                >
                  Meeting-heavy day
                </button>
                <button 
                  className="example-chip"
                  onClick={() => setUserContext('I want to focus on deep work and learning today with minimal distractions')}
                >
                  Deep work focus
                </button>
              </div>
            </div>
          </div>
        )}

        {planData && (
          <>
            {/* Summary Section */}
            <div className="insights-section" style={{ marginBottom: '30px', animationDelay: '0s' }}>
               <div className="insight-card" style={{ borderLeft: '4px solid #667eea' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div className="insight-icon" style={{ fontSize: '24px', marginBottom: 0 }}>✨</div>
                    <h3 style={{ margin: 0 }}>Daily Summary</h3>
                  </div>
                  <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)' }}>{planData.summary}</p>
                  {planData.context && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Based on context:</p>
                      <p style={{ fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"{planData.context}"</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Schedule Section */}
            <div className="schedule-section">
              <div className="schedule-header">
                <h2>Timeline</h2>
                <div className="schedule-stats">
                  <div className="stat-chip">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>{planData.plan.length} Tasks Planned</span>
                  </div>
                </div>
              </div>

              <div className="timeline-container">
                <div className="timeline-track"></div>
                <div className="schedule-list">
                  {planData.plan.map((task, index) => (
                    <div key={task.taskId || index} className="schedule-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="schedule-time">
                        <span className="time-label">{task.startTime}</span>
                        <span className="duration-label">{calculateDuration(task.startTime, task.endTime)}</span>
                      </div>
                      <div className="schedule-card">
                        <div className="schedule-card-header">
                          <div className="schedule-card-title">
                            <h3>{task.title}</h3>
                          </div>
                          <div className="schedule-card-meta">
                            <span 
                              className="priority-badge"
                              style={{ background: getPriorityColor(task.priority) }}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <div className="schedule-card-footer">
                          <div className="task-status-indicator">
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                              Ends at {task.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AiPlanner;
