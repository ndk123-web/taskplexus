import React from 'react';
import type { ContextInputProps } from '../../types/aiPlanner';

interface ContextInputWithButtonProps extends ContextInputProps {
  onGenerateClick?: () => void;
  isGenerating?: boolean;
}

const ContextInput: React.FC<ContextInputWithButtonProps> = ({
  value,
  onChange,
  isLoading = false,
  onGenerateClick,
  isGenerating = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="ai-planner-context-section">
      <label htmlFor="context-input" className="ai-planner-context-label">
        Your Context
      </label>
      <textarea
        id="context-input"
        className="ai-planner-context-textarea"
        placeholder="Describe what you want to work on today. Include your goals, focus areas, and any specific tasks or learning objectives..."
        value={value}
        onChange={handleChange}
        disabled={isLoading || isGenerating}
        rows={4}
      />
      <div className="ai-planner-context-footer">
        <p className="ai-planner-context-hint">
          Provide context to help AI generate a more personalized and focused plan for your day.
        </p>
        <button
          className="ai-planner-generate-btn"
          onClick={onGenerateClick}
          disabled={isGenerating}
          title="Generate new plan"
        >
          {isGenerating ? (
            <>
              <div className="ai-planner-spinner-small"></div>
              Generating...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="currentColor"
                />
              </svg>
              Generate Planner
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContextInput;
