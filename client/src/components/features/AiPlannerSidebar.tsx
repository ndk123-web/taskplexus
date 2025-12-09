import React from 'react';
import type { AiPlannerSidebarItem } from '../../types/aiPlanner';

interface AiPlannerSidebarProps {
  items: AiPlannerSidebarItem[];
  selectedId: string | null;
  onSelectItem: (item: AiPlannerSidebarItem) => void;
}

const AiPlannerSidebar: React.FC<AiPlannerSidebarProps> = ({
  items,
  selectedId,
  onSelectItem,
}) => {
  return (
    <aside className="ai-planner-sidebar">
      <div className="ai-planner-sidebar-header">
        <h2 className="ai-planner-sidebar-title">Plans</h2>
        <span className="ai-planner-sidebar-count">{items.length}</span>
      </div>

      <nav className="ai-planner-sidebar-nav">
        {items.length === 0 ? (
          <div className="ai-planner-sidebar-empty">
            <p>No plans yet</p>
          </div>
        ) : (
          <ul className="ai-planner-sidebar-list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className={`ai-planner-sidebar-item ${
                    selectedId === item.id ? 'active' : ''
                  }`}
                  onClick={() => onSelectItem(item)}
                  type="button"
                >
                  <div className="ai-planner-sidebar-item-date">
                    {item.date}
                  </div>
                  <div className="ai-planner-sidebar-item-summary">
                    {item.summaryPreview}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default AiPlannerSidebar;
