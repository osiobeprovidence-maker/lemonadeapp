import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Payment Management Functions
 */

// Create payment intent
export const createPaymentIntent = mutation({
  args: {
    userId: v.string(),
    amount: v.number(), // in kobo (1/100th of naira)
    paymentType: v.union(
      v.literal("premium_subscription"),
      v.literal("story_unlock"),
      v.literal("creator_support"),
      v.literal("wallet_topup")
    ),
    storyId: v.optional(v.string()),
    creatorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      externalId: undefined,
      userId: args.userId,
      amount: args.amount,
      currency: "NGN",
      paymentType: args.paymentType,
      status: "pending",
      reference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      storyId: args.storyId,
      creatorId: args.creatorId,
      transactionId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const payment = await ctx.db.get(paymentId);
    return payment;
  },
});

// Verify payment (called after Paystack webhook)
export const verifyPayment = mutation({
  args: {
    reference: v.string(),
    transactionId: v.string(),
    status: v.union(v.literal("success"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    // Find payment by reference
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("reference"), args.reference))
      .first();

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment status
    await ctx.db.patch(payment._id, {
      status: args.status,
      transactionId: args.transactionId,
      updatedAt: new Date().toISOString(),
    });

    // If successful, update user based on payment type
    if (args.status === "success") {
      const user = await ctx.db.get(payment.userId as any);
      
      if (payment.paymentType === "premium_subscription") {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        await ctx.db.patch(user._id, {
          premiumStatus: "premium",
          premiumExpiry: expiryDate.toISOString(),
        });
      } else if (payment.paymentType === "wallet_topup") {
        await ctx.db.patch(user._id, {
          walletBalance: (user.walletBalance || 0) + payment.amount / 100,
        });
      } else if (payment.paymentType === "story_unlock" && payment.storyId) {
        const unlockedChapters = user.unlockedChapters || [];
        if (!unlockedChapters.includes(payment.storyId)) {
          unlockedChapters.push(payment.storyId);
        }
        
        await ctx.db.patch(user._id, {
          unlockedChapters,
        });
      }
    }

    return await ctx.db.get(payment._id);
  },
});

// Get user payment history
export const getPaymentHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Get payment by reference
export const getPaymentByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("reference"), args.reference))
      .first();
  },
});

// Create wallet transaction
export const createWalletTransaction = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    type: v.union(
      v.literal("topup"),
      v.literal("withdrawal"),
      v.literal("payment"),
      v.literal("referral")
    ),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const transactionId = await ctx.db.insert("walletTransactions", {
      externalId: undefined,
      userId: args.userId,
      amount: args.amount,
      type: args.type,
      description: args.description,
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(transactionId);
  },
});

// Get wallet balance
export const getWalletBalance = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("firebaseUid"), args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return {
      userId: args.userId,
      balance: user.walletBalance || 0,
      currency: "NGN",
    };
  },
});
