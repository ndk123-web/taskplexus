import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface GetAllAiPlannerReq {
  userId: string;
  workspaceId: string;
  page?: number;
  limit?: number;
}

const getAllAiPlannerApi = async (data: GetAllAiPlannerReq) => {
  try {
    const page = data.page || 1;
    const limit = data.limit || 5;
    const response: AxiosResponse = await api.get(
      `/aiplanner/get-all-planner/u/${data.userId}/w/${data.workspaceId}?page=${page}&limit=${limit}`
    );

    console.log("Get All AI Planner API Response:", response);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API request failed with status code ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching AI planners:", error);
  }
};

export default getAllAiPlannerApi;
