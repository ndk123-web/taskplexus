// why because we can load the script only when we need it

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
export function openRazorpayCheckout(order: any) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY,
    amount: "100.00",
    currency: "INR",
    order_id: "order_Rp5DGODXvNCTey",

    handler: async (response: any) => {
      // Payment successful! Now verify
      // await verifyPayment(response);
      console.log("Payment successful", response);
    },
    modal: {
      ondismiss: () => console.log("Payment cancelled"),
    },
  };

  // @ts-ignore (Razorpay is global)
  const rzp = new window.Razorpay(options);
  rzp.open();
}
