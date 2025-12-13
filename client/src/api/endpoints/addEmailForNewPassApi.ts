import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface addEmailForNewPassApiProps {
  email: string;
  userId: string;
}

const addEmailForNewPassApi = async (data: addEmailForNewPassApiProps) => {
  try {
    const response: AxiosResponse = await api.post(
      "/users/send-forget-password-email",
      data
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error in addEmailForNewPassApi:", error);
  }
};

export default addEmailForNewPassApi;
