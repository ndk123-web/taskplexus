import { api } from "./globalApi";
import type { updateWorkspaceReqType } from "../../types/updateWorkspaceType";

const updateWorkspaceAPI = async (
  data: updateWorkspaceReqType
): Promise<string> => {
  // API call to update workspace
  const response = await api.put(`workspaces/update-workspace`, {
    workspaceName: data.workspaceName,
    updatedWorkspaceName: data.updatedWorkspaceName,
    userId: data.userId,
  });

  // Debug log
  console.log("Response Update Workspace: ", response);

  // Error handling
  if (response.status < 200 || response.status > 299) {
    alert("Error While Updating Workspace: " + JSON.stringify(response.data));
    return response.data; // ya throw error
  }

  return response.data;
};

export default updateWorkspaceAPI;
