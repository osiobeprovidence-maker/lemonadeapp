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

export const creatorPayoutSummary = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) {
      throw new Error("User not found for payout summary.");
    }

    const creator = await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", user.username))
      .unique();

    const payoutAccount = creator?.profile?.payoutAccount || null;
    const transactions = await ctx.db.query("walletTransactions").collect();
    const creatorSupportTransactions = transactions.filter((transaction) => (
      transaction.type === "creator_support" &&
      transaction.status === "success" &&
      (
        transaction.metadata?.creatorUsername === user.username ||
        transaction.metadata?.username === user.username ||
        transaction.metadata?.creatorId === creator?._id ||
        transaction.metadata?.creatorId === creator?.externalId ||
        transaction.metadata?.creatorId === user.username
      )
    ));

    const lifetimeEarnings = creatorSupportTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

    return {
      availableToWithdraw: lifetimeEarnings,
      pendingClearance: 0,
      lifetimeEarnings,
      recentEarnings: creatorSupportTransactions
        .slice()
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 10)
        .map((transaction) => ({
          id: transaction._id,
          amount: Number(transaction.amount || 0),
          createdAt: transaction.createdAt,
          reference: transaction.reference,
          supporter: transaction.metadata?.supporterUsername || transaction.metadata?.username || transaction.userId,
        })),
      hasPayoutAccount: Boolean(
        payoutAccount?.bankName &&
        payoutAccount?.accountNumber &&
        payoutAccount?.accountName
      ),
      payoutAccount,
    };
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

export const creditWalletAfterPaystack = mutation({
  args: {
    firebaseUid: v.string(),
    userId: v.string(),
    coins: v.union(v.number(), v.string()),
    nairaAmount: v.union(v.number(), v.string()),
    reference: v.string(),
    providerPayload: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const coins = Number(args.coins);
    const nairaAmount = Number(args.nairaAmount);
    if (!Number.isFinite(coins) || coins <= 0) {
      throw new Error("Invalid coin amount from payment provider.");
    }
    if (!Number.isFinite(nairaAmount) || nairaAmount <= 0) {
      throw new Error("Invalid naira amount from payment provider.");
    }

    const existing = await ctx.db
      .query("walletTransactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();

    if (existing) {
      return { credited: false, transactionId: existing._id };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) {
      throw new Error("User not found for wallet credit.");
    }

    await ctx.db.patch(user._id, {
      walletBalance: user.walletBalance + coins,
      updatedAt: new Date().toISOString(),
    });

    const transactionId = await ctx.db.insert("walletTransactions", {
      userId: args.userId,
      type: "wallet_topup",
      amount: coins,
      currency: "NGN",
      status: "success",
      reference: args.reference,
      provider: "paystack",
      providerPayload: args.providerPayload,
      metadata: {
        nairaAmount,
      },
      createdAt: new Date().toISOString(),
    });

    return { credited: true, transactionId };
  },
});

export const activatePremiumAfterPaystack = mutation({
  args: {
    firebaseUid: v.optional(v.string()),
    userId: v.optional(v.string()),
    reference: v.string(),
    planType: v.union(v.literal("premium"), v.literal("patron")),
    billingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
    amount: v.union(v.number(), v.string()),
    providerPayload: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const amount = Number(args.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid premium payment amount.");
    }

    const providerMetadata = args.providerPayload?.metadata || {};
    const firebaseUid = args.firebaseUid || providerMetadata.firebaseUid;
    const userId = args.userId || providerMetadata.userId || providerMetadata.convexUserId;

    let user = firebaseUid
      ? await ctx.db
        .query("users")
        .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", firebaseUid))
        .unique()
      : null;

    if (!user && userId) {
      const normalizedUserId = ctx.db.normalizeId("users", userId);
      if (normalizedUserId) {
        user = await ctx.db.get(normalizedUserId);
      }
    }

    if (!user) {
      throw new Error("User not found for premium activation.");
    }

    const existing = await ctx.db
      .query("walletTransactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();

    const alreadyActivated = Boolean(
      existing && user.premiumStatus === "premium" && user.premiumReference === args.reference
    );

    if (alreadyActivated) {
      return { activated: false, transactionId: existing._id, renewsAt: user.premiumRenewsAt };
    }

    const now = new Date();
    const renewsAt = new Date(now);
    if (args.billingCycle === "yearly") {
      renewsAt.setFullYear(renewsAt.getFullYear() + 1);
    } else {
      renewsAt.setMonth(renewsAt.getMonth() + 1);
    }

    await ctx.db.patch(user._id, {
      premiumStatus: "premium",
      premiumPlan: args.planType,
      premiumBillingCycle: args.billingCycle,
      premiumStartedAt: user.premiumStartedAt || now.toISOString(),
      premiumRenewsAt: renewsAt.toISOString(),
      premiumCancelAtPeriodEnd: false,
      premiumProvider: "paystack",
      premiumReference: args.reference,
      updatedAt: now.toISOString(),
    });

    if (existing) {
      return { activated: true, transactionId: existing._id, renewsAt: renewsAt.toISOString() };
    }

    const transactionId = await ctx.db.insert("walletTransactions", {
      userId: user._id,
      type: "premium",
      amount,
      currency: "NGN",
      status: "success",
      reference: args.reference,
      provider: "paystack",
      providerPayload: args.providerPayload,
      metadata: {
        planType: args.planType,
        billingCycle: args.billingCycle,
      },
      createdAt: now.toISOString(),
    });

    return { activated: true, transactionId, renewsAt: renewsAt.toISOString() };
  },
});

export const cancelPremium = mutation({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) {
      throw new Error("User not found for premium cancellation.");
    }

    if (user.premiumStatus !== "premium") {
      return { cancelled: false, premiumStatus: user.premiumStatus };
    }

    const timestamp = new Date().toISOString();
    await ctx.db.patch(user._id, {
      premiumCancelAtPeriodEnd: true,
      premiumCancelledAt: timestamp,
      updatedAt: timestamp,
    });

    return { cancelled: true, premiumRenewsAt: user.premiumRenewsAt };
  },
});
