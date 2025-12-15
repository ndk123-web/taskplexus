// why because we can load the script only w
import {
  createOrderApi,
  verifyPaymentApi,
  cancelOrderApi,
  checkPaymentStatusApi,
} from "../api/payment";
import useUserStore from "../store/useUserInfo";

export function dynamicRazorPayLoad() {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

// In your razorpay.ts utility
export async function openRazorpayCheckout(order: any) {
  try {
    // This is where the loading happens - waiting for backend response
    const response: any = await createOrderApi({
      amount: order.amount,
      currency: order.currency,
      userId: "",
    });
    console.log("Razorpay order creation response:", response);

    if (response.success !== "true") {
      throw new Error(response?.Error || "Failed to create order");
    }

    if (response?.order_id === "" || response?.order_id === undefined) {
      throw new Error("Invalid order ID received");
    }

    order.id = response.order_id;

    return new Promise((resolve) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount, // this doesnt matter the actual amount will be from order id
        currency: order.currency,
        order_id: order.id,

        handler: async (response: any) => {
          console.log("Payment successful", response);

          // Payment successful! Now verify
          const res: any = await verifyPayment(response);
          if (res?.success === "true") {
            console.log("Payment verified and order completed.");
            resolve(true);
            return;
          }

          resolve(false);
        },

        // it means if user closes the form without payment
        modal: {
          ondismiss: async () => {
            console.log("Razorpay checkout form closed");

            // api call so that order can be marked as cancelled or failed
            const response = await cancelOrderApi(order.id);
            console.log("Order cancellation response:", response);

            if (response?.success !== "true") {
              console.error(
                "Order cancellation failed:",
                response?.Error || "Unknown error"
              );
            }
            resolve(false);
          },
        },
      };

      // @ts-ignore (Razorpay is global)
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  } catch (error) {
    console.error("Error in opening Razorpay checkout:", error);
    return false;
  }
}

const checkPaymentStatus = async (paymentId: string) => {
  const pollId = setInterval(async () => {
    try {
      const response = await checkPaymentStatusApi({ paymentId: paymentId });
      console.log("Payment status response:", response);

      if (response?.response?.success !== "true") {
        throw new Error(response?.Error || "Failed to check payment status");
      }

      if (
        response?.response?.success === "true" &&
        response?.response?.status === "payment.failed"
      ) {
        console.error("payment failed users needs to be notified");
        clearInterval(pollId);
      }

      if (
        response?.response?.success === "true" &&
        response?.response?.status === "payment.captured"
      ) {
        useUserStore.getState().signinUser({
          ...useUserStore.getState().userInfo!,
          plan: "PRO_MONTHLY",
        });
        console.log("payment captured successfully");
        clearInterval(pollId);
      }

      return true;
    } catch (error) {
      console.error("Error checking payment status:", error);
      return false;
    }
  }, 5 * 1000);
};

const verifyPayment = async (data: any) => {
  try {
    const response = await verifyPaymentApi(data);

    console.log("Payment verification response:", response);

    if (response?.success !== "true") {
      throw new Error(response?.Error || "Payment verification failed");
    }

    console.log("Payment verified successfully:", response);

    // poll 5 seconds to check payment status after verification
    await checkPaymentStatus(data.razorpay_payment_id);

    return response;
  } catch (error) {
    console.error("Error verifying payment:", error);
  }
};
