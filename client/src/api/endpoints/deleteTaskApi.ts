import { api } from "./globalApi";

interface DeleteTaskReq {
  id: string;
  workspaceId?: string;
  userId?: string;
}

const deleteTaskApi = async (data: DeleteTaskReq) => {
  try {
    const response: any = await api.delete(`/todos/delete-todo/${data.id}`, {
      params: {
        workspaceId: data.workspaceId,
        userId: data.userId,
      },
    });

    console.log("deleteTaskApi response:", response);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.log("Error in deleteTaskApi:", error);
  }
};

export default deleteTaskApi;
