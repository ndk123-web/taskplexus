import React from 'react';
import type { AiPlannerHeaderProps } from '../../types/aiPlanner';
import useWorkspaceStore from '../../store/useWorkspaceStore';

const AiPlannerHeader: React.FC<AiPlannerHeaderProps> = ({
  selectedDate,
  workspaceName = 'My Workspace',
  onBackClick,
  onRefreshClick,
  onNewPlanClick,
}) => {

    const currentWorkspaceName = useWorkspaceStore(state => state.currentWorkspace?.name);

    workspaceName = currentWorkspaceName || workspaceName;

  return (
    <header className="ai-planner-header">
      <div className="ai-planner-header-content">
        {/* Left: Navigation */}
        <div className="ai-planner-header-nav">
          <button
            className="ai-planner-header-nav-link"
            onClick={onBackClick}
            title="Back to Dashboard"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 2L1 8M1 8L6 14M1 8H15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard
          </button>
          <span className="ai-planner-header-nav-divider">/</span>
          <span className="ai-planner-header-nav-current">{workspaceName.toUpperCase()}</span>
          <span className="ai-planner-header-nav-divider">/</span>
          <span className="ai-planner-header-nav-current">AI Planner</span>
        </div>

        {/* Center: Title and Date */}
        <div className="ai-planner-header-main">
          <h1 className="ai-planner-header-title">AI Planner</h1>
          {selectedDate && (
            <p className="ai-planner-header-subtitle">{selectedDate}</p>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="ai-planner-header-actions">
          <button
            className="ai-planner-header-btn ai-planner-header-btn-icon"
            onClick={onRefreshClick}
            title="Refresh"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="ai-planner-header-btn ai-planner-header-btn-primary"
            onClick={onNewPlanClick}
            title="Generate New Plan"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2V16M2 9H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            New Plan
          </button>
        </div>
      </div>
    </header>
  );
};

export default AiPlannerHeader;
