import { api } from "./globalApi";
import type { CreateTaskReq } from "../types/createTaskType";

const createTaskApi = async (data: CreateTaskReq): Promise<any> => {
  try {
    console.log("createTaskApi called with data:", data);

    // Do NOT send a custom _id: server expects a Mongo ObjectID and will generate one
    const response: any = await api.post(
      `/users/${data.userId}/create-todo/${data.workspaceId}`,
      {
        task: data.text,
        priority: data.priority,
        userId: data.userId,
        workspaceId: data.workspaceId,
        done: false,
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.data.Error);
    }

    return response.data;
  } catch (error) {
    console.log("Error in createTaskApi:", error);
  }
};

export default createTaskApi;
