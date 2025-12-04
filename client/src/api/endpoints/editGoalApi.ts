import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface EditGoalReq {
  goalId: string;
  updatedGoalName: string;
  updatedCategory: string;
  updatedTargetDays: string;
}

const editGoalApi = async (data: EditGoalReq) => {
  try {
    const response: AxiosResponse = await api.put(
      `/goals/update-goal/${data.goalId}`,
      {
        updatedGoalName: data.updatedGoalName,
        updatedCategory: data.updatedCategory,
        updatedTargetDays: data.updatedTargetDays,
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Error editing goal: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Edit Goal API Error:", error);
  }
};

export default editGoalApi;
