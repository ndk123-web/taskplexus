import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface DecrementGoalReq {
  goalId: string;
  count: string;
}

const decrementGoalApi = async (data: DecrementGoalReq) => {
  try {
    if (!data.goalId) {
      throw new Error("Goal ID is required");
    }

    const response: AxiosResponse = await api.post(
      `/goals/decreament/${data.goalId}`,
      {
        count: data.count,
      }
    );

    console.log("Decrement Goal API Response:", response.data);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error in decrementGoalApi:", error);
  }
};

export default decrementGoalApi;
