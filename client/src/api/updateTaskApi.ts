import { api } from "./globalApi";

interface UpdateTaskReq {
  task: string;
  id: string;
  priority: string;
}

const updateTaskApi = async (data: UpdateTaskReq) => {
  try {
    const response: any = await api.put(`/todos/update-todo`, {
      ...data,
    });

    console.log("Update Task Response:", response);

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to update task");
    }

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default updateTaskApi;
