import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

interface CheckPaymentStatusReq {
  paymentId: string;
}

const CheckPaymentStatusApi = async (data: CheckPaymentStatusReq) => {
  try {
    if (!data.paymentId) {
      throw new Error("Payment ID is required");
    }

    const response: AxiosResponse = await api.get(
      `/payment/check-payment-status/${data.paymentId}`
    );

    console.log("CheckPaymentStatusApi response:", response);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error in CheckPaymentStatusApi:", error);
  }
};

export default CheckPaymentStatusApi;
