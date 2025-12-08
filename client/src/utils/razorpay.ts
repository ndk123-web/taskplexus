// why because we can load the script only w
import { createOrderApi, verifyPaymentApi } from "../api/payment";

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
    });
    console.log("Razorpay order creation response:", response);

    if (response.success !== "true") {
      throw new Error(response?.Error || "Failed to create order");
    }

    if (response?.order_id === "" || response?.order_id === undefined) {
      throw new Error("Invalid order ID received");
    }

    order.id = response.order_id;
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount, // this doesnt matter the actual amount will be from order id
      currency: order.currency,
      order_id: order.id,

      handler: async (response: any) => {
        console.log("Payment successful", response);

        // Payment successful! Now verify
        await verifyPayment(response);
      },
      modal: {
        ondismiss: () => console.log("Payment cancelled"),
      },
    };

    // @ts-ignore (Razorpay is global)
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Error in opening Razorpay checkout:", error);
  }
}

const verifyPayment = async (data: any) => {
  try {
    const response = await verifyPaymentApi(data);

    console.log("Payment verification response:", response);

    if (response?.success !== "true") {
      throw new Error(response?.Error || "Payment verification failed");
    }

    console.log("Payment verified successfully:", response);
    return response;
  } catch (error) {
    console.error("Error verifying payment:", error);
  }
};
