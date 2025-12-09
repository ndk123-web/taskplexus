import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AiPlannerHeader from '../components/features/AiPlannerHeader';
import AiPlannerSidebar from '../components/features/AiPlannerSidebar';
import AiPlannerTimeline from '../components/features/AiPlannerTimeline';
import ContextInput from '../components/features/ContextInput';
import type { AiPlannerData, AiPlannerSidebarItem } from '../types/aiPlanner';
import type { AiPlannerResponse } from '../api/aiplanner';
import { sendAiPlannerApi } from '../api/aiplanner';
import '../styles/pages/AiPlanner.css';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useUserStore from '../store/useUserInfo';

const AiPlanner: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [context, setContext] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [isInGenerationMode, setIsInGenerationMode] = useState<boolean>(false);
  const [planData, setPlanData] = useState<AiPlannerResponse | null>(null);

  const userId = useUserStore(state => state.userInfo?.userId);
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace);
  const workspaceName = currentWorkspace?.name || 'My Workspace';

  // Transform API plan data to sidebar items
  const sidebarItems: AiPlannerSidebarItem[] = planData
    ? [
        {
          id: planData.id,
          date: planData.date,
          summaryPreview: planData.summary.slice(0, 50) + '…',
          fullData: {
            id: planData.id,
            date: planData.date,
            plan: planData.plan as any,
            summary: planData.summary,
            context: planData.context,
            createdAt: planData.createdAt,
            updatedAt: planData.updatedAt,
          },
        },
      ]
    : [];

  // Get selected plan data from API response
  const selectedPlan = planData
    ? ({
        id: planData.id,
        date: planData.date,
        plan: planData.plan,
        summary: planData.summary,
        context: planData.context,
        createdAt: planData.createdAt,
        updatedAt: planData.updatedAt,
      } as AiPlannerData)
    : null;

  const handleSelectPlan = (item: AiPlannerSidebarItem) => {
    setSelectedPlanId(item.id);
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleRefreshClick = () => {
    if (planData) {
      handleGeneratePlanClick();
    }
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
      const response = await sendAiPlannerApi({
        context: context,
        userId: userId || '',
        workspaceId: currentWorkspace?.id || '',
      });

      console.log('AI Planner Response:', response);

      if (response?.success === 'true' && response?.response) {
        setPlanData(response.response);
        setSelectedPlanId(response.response.id);
        setIsInGenerationMode(false);
      } else {
        console.error('Failed to generate AI plan:', response);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="ai-planner-page">
      <AiPlannerHeader
        selectedDate={selectedPlan?.date}
        workspaceName={workspaceName}
        onBackClick={handleBackClick}
        onRefreshClick={handleRefreshClick}
        onNewPlanClick={handleNewPlanClick}
      />
      <div className="ai-planner-container">
        <AiPlannerSidebar
          items={sidebarItems}
          selectedId={selectedPlanId}
          onSelectItem={handleSelectPlan}
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
            <AiPlannerTimeline data={selectedPlan} isLoading={isGeneratingPlan} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AiPlanner;
