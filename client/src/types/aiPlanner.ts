export interface AiPlanItem {
  taskId: string;
  title: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low' | 'none';
}

export interface AiPlannerData {
  id: string;
  date: string;
  plan: AiPlanItem[];
  summary: string;
  context: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiPlannerSidebarItem {
  id: string;
  date: string;
  summaryPreview: string;
  fullData: AiPlannerData;
}

export interface AiPlannerHeaderProps {
  selectedDate?: string;
  workspaceName?: string;
  onBackClick?: () => void;
  onRefreshClick?: () => void;
  onNewPlanClick?: () => void;
}

export interface ContextInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}
