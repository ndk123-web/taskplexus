import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface resetPasswordApiProps {
  email: string;
  token: string;
  newPassword: string;
}

const resetPasswordApi = async (data: resetPasswordApiProps) => {
  try {
    const response: AxiosResponse = await api.post(
      "/users/reset-password",
      data
    );
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error in resetPasswordApi:", error);
  }
};

export default resetPasswordApi;
