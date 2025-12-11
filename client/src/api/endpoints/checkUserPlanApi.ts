import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

const checkUserPlanApi = async (userId: string) => {
  try {
    const response: AxiosResponse = await api.get(
      `/users/check-plan/${userId}`
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to fetch user plan");
    }

    return response.data;
  } catch (error) {
    console.error("Error checking user plan:", error);
  }
};

export default checkUserPlanApi;
