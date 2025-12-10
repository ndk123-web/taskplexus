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
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const userId : any= useUserStore(state => state.userInfo?.userId);
  const currentWorkspace = useWorkspaceStore(state=> state.currentWorkspace);
  const workspaceId = currentWorkspace?.id || '';

  const navigate = useNavigate();

  // Handle new items from parent (e.g. newly generated plan)
  useEffect(() => {
    if (initialItems.length > 0) {
      const newItems = initialItems.filter(
        newItem => !items.some(existingItem => existingItem.id === newItem.id)
      );
      if (newItems.length > 0) {
        setItems(prev => [...newItems, ...prev]);
        setTotalCount(prev => prev + newItems.length);
      }
    }
  }, [initialItems]);

  useEffect(() => {
    const fetchAllAiPlanners = async () => {
      try {
        const response: any = await getAllAiPlannerApi({
          userId: userId,
          workspaceId,
          page: 1,
          limit: 5
        });
        console.log('Fetched AI planners:', response);

        if (response?.success !== "true") {
          console.error('Failed to fetch AI planners');
          return;
        }

        const fetchedItems = response?.response || [];
        // Ensure we get the total count from the API, or fallback to current length
        // This is crucial for the "Load More" button to appear
        const count = response?.count || fetchedItems.length; 
        
        setItems(fetchedItems);
        setTotalCount(count);
        setPage(1);
      } 
      catch (error) {
        console.error('Error fetching AI planners:', error);
      }
    }

    if (userId && workspaceId) {
      fetchAllAiPlanners();
    }

  }, [userId, workspaceId]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response: any = await getAllAiPlannerApi({
        userId: userId,
        workspaceId,
        page: nextPage,
        limit: 5
      });

      if (response?.success === "true") {
        const newItems = response?.response || [];
        setItems(prev => [...prev, ...newItems]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more plans:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <aside className="ai-planner-sidebar">
      <div className="ai-planner-sidebar-header">
        <h2 className="ai-planner-sidebar-title">Plans</h2>
        <span className="ai-planner-sidebar-count">{totalCount}</span>
      </div>

      <nav className="ai-planner-sidebar-nav">
        {isLoading && items.length === 0 && (
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
            
            {items.length < totalCount && (
              <li className="ai-planner-sidebar-load-more">
                <button 
                  className="ai-planner-load-more-btn"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <span className="ai-planner-spinner-small"></span>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </li>
            )}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default AiPlannerSidebar;
