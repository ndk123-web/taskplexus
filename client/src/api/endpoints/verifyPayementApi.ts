import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface VerifyPayementData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const verifyPaymentApi = async (data: VerifyPayementData) => {
  try {
    const response: AxiosResponse = await api.post(
      "/payment/verify-payment",
      data
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to verify payment");
    }

    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
  }
};

export default verifyPaymentApi;
