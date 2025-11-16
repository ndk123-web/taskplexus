import { api } from "./globalApi";
import type { GetWorkspaceType } from "../types/getWorkspaceType";

const getUserWorkspaceApi = async (
  userId: string
): Promise<GetWorkspaceType[]> => {
  const response: any = await api.get(
    `/workspaces/get-user-workspaces?userId=${userId}`
  );

  console.log("Get User Workspace API Response:", response);

  if (response.status < 200 || response.status >= 300) {
    throw new Error("Failed to fetch user workspaces");
  }

  if (response.data.response?.Success === false) {
    throw new Error(
      response.data.response.Error || "Error fetching workspaces"
    );
  }
  return response.data.response;
};

export default getUserWorkspaceApi;