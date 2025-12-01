import { api } from "./globalApi";

interface UpdateTaskReq {
  id: string;
  toggle: string;
  userId: string;
  workspaceId?: string;
}

const toggleTodoApi = async (data: UpdateTaskReq) => {
  const response: any = await api.post("/users/toggle-todo", {
    ...data,
  });

  console.log("Toggle Todo API Response:", response);

  if (response.status < 200 || response.status >= 300) {
    throw new Error("Error toggling todo");
  }

  return response.data;
};

export default toggleTodoApi;
