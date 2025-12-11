import type { AxiosResponse } from "axios";
import { api } from "./globalApi";
import useUserStore from "../../store/useUserInfo";

interface CreateOrderData {
  amount: number;
  currency: string;
  userId: string;
}
const createOrderApi = async (data: CreateOrderData) => {
  try {
    const userId = useUserStore.getState().userInfo?.userId;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    data.userId = userId;

    const response: AxiosResponse = await api.post(
      "/payment/create-order",
      data
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to create order");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
  }
};

export default createOrderApi;
