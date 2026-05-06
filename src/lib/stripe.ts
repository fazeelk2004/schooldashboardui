import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY is not set; Stripe features will fail at runtime.");
}

export const stripe = new Stripe(secretKey ?? "", {
  apiVersion: "2024-06-20" as any,
  typescript: true,
});
