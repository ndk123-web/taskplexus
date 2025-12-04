import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface IncrementGoalParams {
  goalId: string;
  count: string;
}

const incrementGoalApi = async (goalParam: IncrementGoalParams) => {
  try {
    if (!goalParam.goalId) {
      throw new Error("Goal ID is required to increment goal progress.");
    }

    console.log("Incrementing Goal ID:", goalParam.goalId, "by count:", goalParam.count);

    const response: AxiosResponse = await api.post(
      `/goals/increament/${goalParam.goalId}`,
      {
        count: goalParam.count,
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Error incrementing goal progress: ${response.statusText}`
      );
    }

    return response.data;
  } catch (error) {
    console.error("Increment Goal API Error:", error);
  }
};

export default incrementGoalApi;
