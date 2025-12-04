import type { AxiosResponse } from "axios";
import { api } from "./globalApi";
import type { User } from "../../store/useUserInfo";
import useUserStore from "../../store/useUserInfo";

const refreshTokenApi = async (data: User) => {
  try {
    const response: AxiosResponse = await api.post(
      `/user/refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${data._refreshToken}`,
          skipAuth: true,
        },
      }
    );

    if (response.status === 401) {
      // refresh token expired - logout user
      useUserStore.getState().signOutUser();
      return null;
    }

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to refresh token");
    }

    return response.data;
  } catch (error) {
    // just logout if refresh token also expires
    console.error("Error refreshing token:", error);
    return null;
  }
};

export default refreshTokenApi;
