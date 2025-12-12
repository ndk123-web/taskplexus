import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AiPlannerHeader from '../components/features/AiPlannerHeader';
import AiPlannerSidebar from '../components/features/AiPlannerSidebar';
import AiPlannerTimeline from '../components/features/AiPlannerTimeline';
import ContextInput from '../components/features/ContextInput';
import type { AiPlannerSidebarItem } from '../types/aiPlanner';
import type { AiPlannerResponse } from '../api/aiplanner';
import { sendAiPlannerApi } from '../api/aiplanner';
import '../styles/pages/AiPlanner.css';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useUserStore from '../store/useUserInfo';
import getAiPlannerById from '../api/endpoints/getAiPlannerByIdApi';

const AiPlanner: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [context, setContext] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [isInGenerationMode, setIsInGenerationMode] = useState<boolean>(false);
  const [planData, setPlanData] = useState<AiPlannerResponse | null>(null);
  const [allPlans, setAllPlans] = useState<AiPlannerSidebarItem[]>([]);
  const [isFetchingPlanDetails, setIsFetchingPlanDetails] = useState<boolean>(false);

  const userId = useUserStore(state => state.userInfo?.userId);
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace);
  const workspaceName = currentWorkspace?.name || 'My Workspace';

  // Add new plan to sidebar when generated
  const addNewPlanToSidebar = (newPlan: AiPlannerResponse) => {
    const newItem: AiPlannerSidebarItem = {
      id: newPlan.id,
      date: newPlan.date,
      summary: newPlan.summary.slice(0, 50) + '…',
      fullData: {
        id: newPlan.id,
        date: newPlan.date,
        plan: newPlan.plan as any,
        summary: newPlan.summary,
        context: newPlan.context,
        createdAt: newPlan.createdAt,
        updatedAt: newPlan.updatedAt,
      },
    };
    setAllPlans([newItem, ...allPlans]);
  };

  // Fetch plan details using ID
  const fetchPlanDetails = async (planId: string) => {
    setIsFetchingPlanDetails(true);
    try {
      const response: any = await getAiPlannerById(planId);
      console.log('Fetched plan details:', response);
      
      if (response?.success === 'true' && response?.response) {
        setPlanData(response.response);
      } else {
        console.error('Failed to fetch plan details or invalid response format');
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    } finally {
      setIsFetchingPlanDetails(false);
    }
  };

  const handleSelectPlan = (item: AiPlannerSidebarItem) => {
    setSelectedPlanId(item.id);
    // Fetch plan details using the API
    fetchPlanDetails(item.id);
  };

  const handleRefreshClick = () => {
    window.location.reload();
  };

  const handleNewPlanClick = () => {
    // Clear current selection and context, enter generation mode
    setSelectedPlanId(null);
    setPlanData(null);
    setContext('');
    setIsGeneratingPlan(false);
    setIsInGenerationMode(true);
  };

  const handleGeneratePlanClick = async () => {
    setIsGeneratingPlan(true);

    try {
      const response : any= await sendAiPlannerApi({
        context: context,
        userId: userId || '',
        workspaceId: currentWorkspace?.id || '',
      });

      console.log('AI Planner Response:', response);

      if (response?.success === 'true' && response?.response) {
        const newPlan = response.response;
        setPlanData(newPlan);
        setSelectedPlanId(newPlan.id);
        // Add new plan to sidebar
        addNewPlanToSidebar(newPlan);
        setIsInGenerationMode(false);
      } 
      else if (response?.LimitReached === 'true') {
        // toast notification for limit reached
        alert('You have reached your AI plan generation limit. Please upgrade your subscription to generate more plans.');
      }
      else {
        console.error('Failed to generate AI plan:', response);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="ai-planner-page">
      <AiPlannerHeader
        selectedDate={planData?.date}
        workspaceName={workspaceName}
        onBackClick={handleBackClick}
        onRefreshClick={handleRefreshClick}
        onNewPlanClick={handleNewPlanClick}
        showRegenerate={!!planData}
      />
      <div className="ai-planner-container">
        <AiPlannerSidebar
          items={allPlans}
          selectedId={selectedPlanId}
          onSelectItem={handleSelectPlan}
          isLoading={isFetchingPlanDetails}
        />
        <main className="ai-planner-main">
          <div className="ai-planner-workspace-header">
            <h2 className="ai-planner-workspace-title">Workspace: {workspaceName}</h2>
          </div>
          <div className="ai-planner-main-content">
            {isInGenerationMode && (
              <ContextInput
                value={context}
                onChange={setContext}
                isLoading={false}
                onGenerateClick={handleGeneratePlanClick}
                isGenerating={isGeneratingPlan}
              />
            )}
            <AiPlannerTimeline 
              data={planData as any} 
              isLoading={isGeneratingPlan || isFetchingPlanDetails} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AiPlanner;
