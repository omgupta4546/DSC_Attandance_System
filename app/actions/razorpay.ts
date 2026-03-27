'use server';

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(amount: number) {
  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: "receipt_order_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return { success: false, error: "Failed to create order" };
  }
}
