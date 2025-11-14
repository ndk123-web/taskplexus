import { api } from "./globalApi";
import type { deleteWorkspaceReqType } from "../types/deleteWorkspaceType";

const deleteWorkspaceAPI = async (
  data: deleteWorkspaceReqType
): Promise<string> => {

  const response = await api.delete(`workspaces/delete-workspace`, {
    data: {
      workspaceName: data.workspaceName,
      userId: data.userId,
    },
  });
  console.log("Response Delete Workspace: ", response);

  if (response.status < 200 || response.status > 299) {
    alert("Error While Deleting Workspace: " + JSON.stringify(response.data));
    return response.data; // ya throw error
  }

  return response.data;
};

export default deleteWorkspaceAPI;
