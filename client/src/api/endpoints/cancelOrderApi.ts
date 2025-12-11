import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

const cancelOrderApi = async (orderId: string) => {
  try {
    const response: AxiosResponse = await api.post("/payment/cancel-order", {
      orderId,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to cancel order");
    }

    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
  }
};

export default cancelOrderApi;
