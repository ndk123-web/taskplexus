import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface CreateOrderData {
  amount: number;
  currency: string;
}
const createOrderApi = async (data: CreateOrderData) => {
  try {
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
