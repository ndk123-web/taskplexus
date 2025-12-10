import React, { useEffect, useState } from 'react';
import type { AiPlannerSidebarItem } from '../../types/aiPlanner';
import { getAllAiPlannerApi } from '../../api';
import useUserStore from '../../store/useUserInfo';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import { useNavigate } from 'react-router-dom';

interface AiPlannerSidebarProps {
  items: AiPlannerSidebarItem[];
  selectedId: string | null;
  onSelectItem: (item: AiPlannerSidebarItem) => void;
  isLoading?: boolean;
}

const AiPlannerSidebar: React.FC<AiPlannerSidebarProps> = ({
  items: initialItems,
  selectedId,
  onSelectItem,
  isLoading = false,
}) => {
  const [items, setItems] = useState<AiPlannerSidebarItem[]>(initialItems);

  const userId : any= useUserStore(state => state.userInfo?.userId);
  const currentWorkspace = useWorkspaceStore(state=> state.currentWorkspace);
  const workspaceId = currentWorkspace?.id || '';

  const navigate = useNavigate();

  useEffect(() => {

    const fetchAllAiPlanners = async () => {
      try {
        const response: any = await getAllAiPlannerApi({userId:userId,workspaceId});
        console.log('Fetched AI planners:', response);

        if (response?.success !== "true") {
          console.error('Failed to fetch AI planners');
          return 
        }

        const fetchedItems = response?.response || [];
        setItems(fetchedItems);
      } 
      catch (error) {
        console.error('Error fetching AI planners:', error);
      }
    }

    fetchAllAiPlanners();

  }, [userId, workspaceId])

  return (
    <aside className="ai-planner-sidebar">
      <div className="ai-planner-sidebar-header">
        <h2 className="ai-planner-sidebar-title">Plans</h2>
        <span className="ai-planner-sidebar-count">{items.length}</span>
      </div>

      <nav className="ai-planner-sidebar-nav">
        {isLoading && (
          <div className="ai-planner-sidebar-loading">
            <div className="ai-planner-sidebar-loader">
              <div className="ai-planner-loader-spinner"></div>
              <p className="ai-planner-loader-text">Loading plan...</p>
            </div>
          </div>
        )}
        
        {!isLoading && items.length === 0 ? (
          <div className="ai-planner-sidebar-empty">
            <p>No plans yet</p>
          </div>
        ) : (
          !isLoading && (
            <ul className="ai-planner-sidebar-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    className={`ai-planner-sidebar-item ${
                      selectedId === item.id ? 'active' : ''
                    }`}
                    onClick={() =>{
                       onSelectItem(item);
                        navigate("?planId=" + item.id);
                      }}
                    type="button"
                  >
                    <div className="ai-planner-sidebar-item-date">
                      {item.date}
                    </div>
                    <div className="ai-planner-sidebar-item-summary">
                      {item?.summary}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </nav>
    </aside>
  );
};

export default AiPlannerSidebar;
