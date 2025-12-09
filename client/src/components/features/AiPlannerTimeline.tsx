import React from 'react';
import type { AiPlannerData } from '../../types/aiPlanner';

interface AiPlannerTimelineProps {
  data: AiPlannerData | null;
  isLoading?: boolean;
}

const AiPlannerTimeline: React.FC<AiPlannerTimelineProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="ai-planner-timeline-loading">
        <div className="ai-planner-loading-spinner">
          <div className="ai-planner-spinner-circle"></div>
          <p className="ai-planner-loading-text">Generating your AI plan...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ai-planner-timeline-empty">
        <div className="ai-planner-timeline-placeholder">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" opacity="0.1"/>
            <path d="M24 10V24M24 24L32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>Select a plan to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-planner-timeline">
      <div className="ai-planner-timeline-header">
        <h2 className="ai-planner-timeline-title">Schedule</h2>
        <span className="ai-planner-timeline-date">{data.date}</span>
      </div>

      <div className="ai-planner-timeline-summary">
        <h3 className="ai-planner-timeline-summary-title">Summary</h3>
        <p className="ai-planner-timeline-summary-text">{data.summary}</p>
        {data.context && (
          <div className="ai-planner-timeline-context">
            <p className="ai-planner-timeline-context-label">Context:</p>
            <p className="ai-planner-timeline-context-text">{data.context}</p>
          </div>
        )}
      </div>

      <div className="ai-planner-timeline-items">
        <div className="ai-planner-timeline-vertical">
          {data.plan && data.plan.length > 0 ? (
            data.plan.map((item, index) => (
              <div key={item.taskId || index} className="ai-planner-timeline-item">
                <div className="ai-planner-timeline-marker"></div>
                <div className="ai-planner-timeline-card">
                  <div className="ai-planner-timeline-card-time">
                    {item.startTime} - {item.endTime}
                  </div>
                  <div className="ai-planner-timeline-card-content">
                    <h4 className="ai-planner-timeline-card-title">{item.title}</h4>
                    {item.priority !== 'none' && (
                      <span
                        className={`ai-planner-timeline-priority ai-planner-timeline-priority-${item.priority}`}
                      >
                        {item.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="ai-planner-timeline-no-items">No tasks scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiPlannerTimeline;
