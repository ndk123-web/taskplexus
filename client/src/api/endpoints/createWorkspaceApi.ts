import { api } from "./globalApi";

interface createWorkspaceData {
  workspaceName: string;
  userId: string;
}

const createWorkspaceAPI = async (
  data: createWorkspaceData
): Promise<string> => {
  const response = await api.post(`workspaces/create-workspace`, {
    workspaceName: data.workspaceName,
    userId: data.userId,
  });

  console.log("Response Create Workspace: ", response);
  console.log("Response Create Workspace Data: ", response.data);

  if (response.status < 200 || response.status > 299) {
    alert("Error While Sign in: " + JSON.stringify(response.data));
    return response.data; // ya throw error
  }

  return response.data;
};

export default createWorkspaceAPI;
