import { api } from "./globalApi";

interface addGoalReq {
  workspaceId: string;
  userId: string;
  goalName: string;
  targetDays: string;
  category: string;
}

const addGoalApi = async (data: addGoalReq) => {
  try {
    const response = await api.post(
      `/goals/u/${data.userId}/create-gw/${data.workspaceId}`,
      {
        goalName: data.goalName,
        targetDays: data.targetDays,
        category: data.category,
      }
    );

    console.log("Response from addGoalApi:", response);

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to add goal");
    }

    return response.data;
  } catch (error) {
    console.error("Error in addGoalApi:", error);
    throw error;
  }
};

export default addGoalApi;
