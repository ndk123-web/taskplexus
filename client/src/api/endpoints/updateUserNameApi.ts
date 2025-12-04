import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface UpdateUserNameRequest {
  userId: string;
  newName: string;
}

const updateUserNameApi = async (data: UpdateUserNameRequest) => {
  try {
    const response: AxiosResponse = await api.put(
      `/users/update-name/${data.userId}`,
      {
        newName: data.newName,
      }
    );

    console.log("Response from updateUserNameApi:", response);

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to update user name");
    }

    return response.data;
  } catch (error) {
    console.error("Error in updateUserNameApi:", error);
  }
};

export default updateUserNameApi;
