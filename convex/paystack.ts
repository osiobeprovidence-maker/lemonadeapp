import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const initialize = action({
  args: {
    email: v.string(),
    amount: v.number(),
    reference: v.string(),
    plan: v.optional(v.string()),
    metadata: v.optional(v.any()),
    callbackUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY not set in Convex environment variables.");
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: args.email,
        amount: args.plan ? undefined : args.amount,
        reference: args.reference,
        plan: args.plan,
        metadata: args.metadata,
        callback_url: args.callbackUrl,
        channels: ["card", "bank", "ussd", "bank_transfer"],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Paystack initialization failed");
    }

    return data.data; // { authorization_url, access_code, reference }
  },
});

export const verify = action({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY not set in Convex environment variables.");
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(args.reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Paystack verification failed");
    }

    return data;
  },
});
