import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/AiPlanner.css';

interface PlannerTask {
  id: string;
  title: string;
  time: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  status: 'completed' | 'in-progress' | 'pending';
  aiGenerated: boolean;
}

interface DayPlan {
  date: string;
  dayName: string;
  tasks: PlannerTask[];
  productivity: number;
}

const AiPlanner = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [userContext, setUserContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);

  // Get today's date info
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Dummy data - today's schedule only
  const todayPlan: DayPlan = {
    date: todayDateString,
    dayName: todayDayName,
    productivity: 85,
    tasks: [
      { id: '1', title: 'Morning meditation & exercise', time: '06:00', duration: '1h', priority: 'high', category: 'Health', status: 'completed', aiGenerated: true },
      { id: '2', title: 'Review project requirements', time: '09:00', duration: '30m', priority: 'high', category: 'Work', status: 'completed', aiGenerated: true },
      { id: '3', title: 'Team standup meeting', time: '10:00', duration: '15m', priority: 'medium', category: 'Work', status: 'in-progress', aiGenerated: true },
      { id: '4', title: 'Code review session', time: '11:00', duration: '2h', priority: 'high', category: 'Work', status: 'pending', aiGenerated: true },
      { id: '5', title: 'Lunch break', time: '13:00', duration: '1h', priority: 'low', category: 'Personal', status: 'pending', aiGenerated: false },
      { id: '6', title: 'Feature development', time: '14:00', duration: '3h', priority: 'high', category: 'Work', status: 'pending', aiGenerated: true },
      { id: '7', title: 'Documentation update', time: '17:00', duration: '1h', priority: 'medium', category: 'Work', status: 'pending', aiGenerated: true },
    ]
  };

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    // Simulate AI generation with user context
    console.log('Generating plan with context:', userContext);
    setTimeout(() => {
      setIsGenerating(false);
      setShowContextInput(false);
      setUserContext('');
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
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
            <h1>Today's AI Planner</h1>
            <p>Let AI organize your perfect day • {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
                Generate AI Plan
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
                <button 
                  className="example-chip"
                  onClick={() => setUserContext('Balance work with exercise and personal time throughout the day')}
                >
                  Balanced schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        <div className="schedule-section">
          <div className="schedule-header">
            <h2>{todayDayName}'s Schedule</h2>
            <div className="schedule-stats">
              <div className="stat-chip">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>8.5 hours planned</span>
              </div>
              <div className="stat-chip">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L10 6L14 7L11 10L12 14L8 12L4 14L5 10L2 7L6 6L8 2Z" fill="currentColor"/>
                </svg>
                <span>AI Optimized</span>
              </div>
            </div>
          </div>

          <div className="timeline-container">
            <div className="timeline-track"></div>
            <div className="schedule-list">
              {todayPlan.tasks.map((task) => (
                <div key={task.id} className={`schedule-item ${task.status}`}>
                  <div className="schedule-time">
                    <span className="time-label">{task.time}</span>
                    <span className="duration-label">{task.duration}</span>
                  </div>
                  <div className="schedule-card">
                    <div className="schedule-card-header">
                      <div className="schedule-card-title">
                        <h3>{task.title}</h3>
                        {task.aiGenerated && (
                          <span className="ai-tag">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 1L7.5 4.5L11 5L8 7.5L9 11L6 9L3 11L4 7.5L1 5L4.5 4.5L6 1Z" fill="currentColor"/>
                            </svg>
                            AI
                          </span>
                        )}
                      </div>
                      <div className="schedule-card-meta">
                        <span 
                          className="priority-badge"
                          style={{ background: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </span>
                        <span className="category-badge">{task.category}</span>
                      </div>
                    </div>
                    <div className="schedule-card-footer">
                      <div className="task-status-indicator">
                        <div 
                          className="status-circle"
                          style={{ background: getStatusColor(task.status) }}
                        ></div>
                        <span>{task.status.replace('-', ' ')}</span>
                      </div>
                      <div className="task-actions">
                        <button className="task-action-btn">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        </button>
                        <button className="task-action-btn">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="insights-section">
          <h2>AI Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <h3>Productivity Peak</h3>
              <p>You're most productive between 9 AM - 12 PM. Schedule important tasks during this time.</p>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⚡</div>
              <h3>Task Distribution</h3>
              <p>Your workload is well-balanced across the week with proper breaks included.</p>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🌟</div>
              <h3>Optimization Tip</h3>
              <p>Consider grouping similar tasks together to maintain focus and reduce context switching.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPlanner;
