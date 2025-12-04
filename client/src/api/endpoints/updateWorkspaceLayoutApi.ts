import { api } from "./globalApi";

export interface FlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data?: any;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: any;
  type?: string;
}

export interface UpdateLayoutRequest {
  workspaceId: string;
  initialNodes: FlowNode[];
  initialEdges: FlowEdge[];
}

export interface UpdateLayoutResponse {
  success: boolean;
  message: string;
}

const updateWorkspaceLayoutApi = async (data: UpdateLayoutRequest): Promise<UpdateLayoutResponse> => {
  try {
    const response = await api.put(
      `/workspaces/${data.workspaceId}/layout`,
      {
        initialNodes: data.initialNodes,
        initialEdges: data.initialEdges,
      }
    );
    
    console.log('✅ Layout API Response:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("❌ Update layout API error:", error);
    
    // Handle different error scenarios
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error message:", error.response.data);
    }
    
    throw error;
  }
};

export default updateWorkspaceLayoutApi;