import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("walletTransactions").order("desc").collect();
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("walletTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const record = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("wallet_topup"),
      v.literal("chapter_unlock"),
      v.literal("creator_support"),
      v.literal("premium"),
      v.literal("refund"),
    ),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    reference: v.string(),
    provider: v.optional(v.string()),
    providerPayload: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("walletTransactions", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});
