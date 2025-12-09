import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface AiPlannerRequest {
  context: string;
  workspaceId: string;
  userId: string;
}
const sendAiPlannerApi = async (data: AiPlannerRequest) => {
  try {
    const response: AxiosResponse = await api.post(
      "/aiplanner/handle-planner",
      data
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error in sendAiPlannerApi:", error);
  }
};

export default sendAiPlannerApi;
