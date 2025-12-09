import type { AxiosResponse } from 'axios';
import { api } from './endpoints/globalApi';

export interface AiPlanItem {
  taskId: string;
  title: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low' | 'none' | string;
}

export interface AiPlannerResponse {
  id: string;
  userId: string;
  workspace: string;
  date: string;
  plan: AiPlanItem[];
  createdAt: string;
  updatedAt: string;
  context: string;
  summary: string;
}

export interface AiPlannerRequest {
  context: string;
  workspaceId: string;
  userId: string;
}

export interface AiPlannerApiResponse {
  success: string;
  response: AiPlannerResponse;
}

export const sendAiPlannerApi = async (data: AiPlannerRequest) => {
  try {
    const response: AxiosResponse<AiPlannerApiResponse> = await api.post(
      '/aiplanner/handle-planner',
      data
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error in sendAiPlannerApi:', error);
    throw error;
  }
};
