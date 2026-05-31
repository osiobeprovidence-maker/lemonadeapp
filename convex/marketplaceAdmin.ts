import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const now = () => new Date().toISOString();

export const listRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("marketplaceRewards").collect();
  },
});

export const getActiveRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const createReward = mutation({
  args: {
    rewardId: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("airtime"),
      v.literal("data"),
      v.literal("gift_card"),
      v.literal("cash"),
      v.literal("premium"),
      v.literal("subscription"),
      v.literal("merchandise"),
      v.literal("lemon_coins"),
      v.literal("golden_ink"),
      v.literal("badge"),
      v.literal("mystery_box")
    ),
    coinPrice: v.number(),
    stock: v.number(),
    metadata: v.optional(v.any()),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
    requiresApproval: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("marketplaceRewards", {
      rewardId: args.rewardId,
      name: args.name,
      description: args.description,
      type: args.type,
      coinPrice: args.coinPrice,
      stock: args.stock,
      reserved: 0,
      metadata: args.metadata ?? {},
      imageUrl: args.imageUrl,
      active: args.active,
      requiresApproval: args.requiresApproval ?? false,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const updateReward = mutation({
  args: {
    rewardId: v.string(),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    const reward = await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_rewardId", (q) => q.eq("rewardId", args.rewardId))
      .unique();

    if (!reward) {
      const fallback = await ctx.db.query("marketplaceRewards").collect();
      const fallbackReward = fallback.find((r) => r.rewardId === args.rewardId);
      if (!fallbackReward) throw new Error("Reward not found");
    }

    await ctx.db.patch(reward._id, { ...args.updates, updatedAt: now() });
    return reward._id;
  },
});

export const deleteReward = mutation({
  args: { rewardId: v.string() },
  handler: async (ctx, args) => {
    const reward = await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_rewardId", (q) => q.eq("rewardId", args.rewardId))
      .unique();

    if (!reward) {
      const fallback = await ctx.db.query("marketplaceRewards").collect();
      const fallbackReward = fallback.find((r) => r.rewardId === args.rewardId);
      if (!fallbackReward) throw new Error("Reward not found");
    }

    await ctx.db.delete(reward._id);
    return reward._id;
  },
});

export const syncRewardIdDelete = mutation({
  args: { rewardId: v.string() },
  handler: async (ctx, args) => {
    const reward = await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_rewardId", (q) => q.eq("rewardId", args.rewardId))
      .unique();

    if (!reward) return { deleted: false };
    await ctx.db.delete(reward._id);
    return { deleted: true, rewardId: args.rewardId };
  },
});

export const redeemReward = mutation({
  args: {
    userId: v.string(),
    username: v.string(),
    rewardId: v.string(),
    redemptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const reward = await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_rewardId", (q) => q.eq("rewardId", args.rewardId))
      .unique();

    if (!reward) {
      const fallback = await ctx.db.query("marketplaceRewards").collect();
      const fallbackReward = fallback.find((r) => r.rewardId === args.rewardId);
      if (!fallbackReward) throw new Error("Reward not found or inactive");
    }

    if (!reward.active) throw new Error("Reward is not active");

    const availableStock = reward.stock - (reward.reserved || 0);
    if (availableStock <= 0) throw new Error("Reward is out of stock");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const currency = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const balance = currency?.lemonCoins || 0;
    if (balance < reward.coinPrice) throw new Error("Insufficient Lemon Coins");

    const initialStatus = reward.requiresApproval ? "pending" : "approved";

    const redemptionId = await ctx.db.insert("rewardRedemptions", {
      userId: args.userId,
      username: args.username,
      rewardId: args.rewardId,
      redemptionId: args.redemptionId,
      coinsSpent: reward.coinPrice,
      status: initialStatus,
      createdAt: now(),
      updatedAt: now(),
    });

    if (initialStatus === "fulfilled") {
      await ctx.db.patch(redemptionId, { status: "fulfilled", fulfilledAt: now() });
    }

    await ctx.db.patch(reward._id, {
      reserved: (reward.reserved || 0) + 1,
      updatedAt: now(),
    });

    await ctx.db.patch(currency._id, {
      lemonCoins: balance - reward.coinPrice,
      updatedAt: now(),
    });

    await ctx.db.insert("coinTransactions", {
      userId: args.userId,
      type: "spend",
      source: "redemption",
      amount: reward.coinPrice,
      description: `Redeemed ${reward.name}`,
      metadata: { rewardId: args.rewardId, redemptionId: args.redemptionId },
      timestamp: now(),
    });

    return { redemptionId, status: initialStatus };
  },
});

export const approveRedemption = mutation({
  args: { redemptionId: v.id("rewardRedemptions"), adminEmail: v.string() },
  handler: async (ctx, args) => {
    const redemption = await ctx.db.get(args.redemptionId);
    if (!redemption) throw new Error("Redemption not found");

    const reward = await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_rewardId", (q) => q.eq("rewardId", redemption.rewardId))
      .unique();

    if (!reward) {
      const fallback = await ctx.db.query("marketplaceRewards").collect();
      const fallbackReward = fallback.find((r) => r.rewardId === redemption.rewardId);
      if (!fallbackReward) throw new Error("Reward not found");
    }

    await ctx.db.patch(args.redemptionId, {
      status: "approved",
      reviewedBy: args.adminEmail,
      reviewedAt: now(),
      updatedAt: now(),
    });

    await ctx.db.logActivity("redemption_approved", args.adminEmail, { redemptionId: args.redemptionId });

    return { success: true };
  },
});

export const fulfillRedemption = mutation({
  args: { redemptionId: v.id("rewardRedemptions"), adminEmail: v.string() },
  handler: async (ctx, args) => {
    const redemption = await ctx.db.get(args.redemptionId);
    if (!redemption) throw new Error("Redemption not found");

    const reward = await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_rewardId", (q) => q.eq("rewardId", redemption.rewardId))
      .unique();

    if (!reward) {
      const fallback = await ctx.db.query("marketplaceRewards").collect();
      const fallbackReward = fallback.find((r) => r.rewardId === redemption.rewardId);
      if (!fallbackReward) throw new Error("Reward not found");
    }

    await ctx.db.patch(args.redemptionId, {
      status: "fulfilled",
      reviewedBy: args.adminEmail,
      reviewedAt: now(),
      fulfilledAt: now(),
      updatedAt: now(),
    });

    if (reward) {
      await ctx.db.patch(reward._id, {
        reserved: Math.max(0, (reward.reserved || 0) - 1),
        updatedAt: now(),
      });
    }

    await ctx.db.logActivity("redemption_fulfilled", args.adminEmail, { redemptionId: args.redemptionId, rewardId: redemption.rewardId });

    return { success: true };
  },
});

export const rejectRedemption = mutation({
  args: { redemptionId: v.id("rewardRedemptions"), adminEmail: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const redemption = await ctx.db.get(args.redemptionId);
    if (!redemption) throw new Error("Redemption not found");

    const reward = await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_rewardId", (q) => q.eq("rewardId", redemption.rewardId))
      .unique();

    if (!reward) {
      const fallback = await ctx.db.query("marketplaceRewards").collect();
      const fallbackReward = fallback.find((r) => r.rewardId === redemption.rewardId);
      if (!fallbackReward) throw new Error("Reward not found");
    }

    await ctx.db.patch(args.redemptionId, {
      status: "rejected",
      adminNotes: args.reason,
      reviewedBy: args.adminEmail,
      reviewedAt: now(),
      updatedAt: now(),
    });

    if (reward && reward.type !== "lemon_coins" && reward.type !== "golden_ink") {
      const existing = await ctx.db
        .query("userCurrencies")
        .withIndex("by_userId", (q) => q.eq("userId", redemption.userId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          lemonCoins: existing.lemonCoins + redemption.coinsSpent,
          updatedAt: now(),
        });
      }
    }

    if (reward) {
      await ctx.db.patch(reward._id, {
        reserved: Math.max(0, (reward.reserved || 0) - 1),
        updatedAt: now(),
      });
    }

    await ctx.db.logActivity("redemption_rejected", args.adminEmail, { redemptionId: args.redemptionId, reason: args.reason });

    return { success: true };
  },
});

export const createMission = mutation({
  args: {
    missionId: v.string(),
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("read_chapters"),
      v.literal("read_minutes"),
      v.literal("complete_stories"),
      v.literal("leave_comments"),
      v.literal("write_reviews"),
      v.literal("daily_login"),
      v.literal("comment_likes")
    ),
    target: v.number(),
    coinReward: v.number(),
    xpReward: v.number(),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("once"), v.literal("event")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("missionsCatalog", {
      ...args,
      active: true,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const updateMission = mutation({
  args: { missionId: v.string(), updates: v.any() },
  handler: async (ctx, args) => {
    const mission = await ctx.db
      .query("missionsCatalog")
      .collect()
      .then((arr) => arr.find((m) => m.missionId === args.missionId));

    if (!mission) {
      const fallback = await ctx.db.query("missionsCatalog").collect();
      const fallbackMission = fallback.find((m) => m.missionId === args.missionId);
      if (!fallbackMission) throw new Error("Mission not found");
    }

    await ctx.db.patch(mission._id, { ...args.updates, updatedAt: now() });
    return mission._id;
  },
});

export const deleteMission = mutation({
  args: { missionId: v.string() },
  handler: async (ctx, args) => {
    const mission = await ctx.db
      .query("missionsCatalog")
      .collect()
      .then((arr) => arr.find((m) => m.missionId === args.missionId));

    if (mission) await ctx.db.delete(mission._id);
    return { success: true };
  },
});

export const createAchievement = mutation({
  args: {
    achievementId: v.string(),
    name: v.string(),
    description: v.string(),
    criteria: v.any(),
    xpReward: v.number(),
    coinReward: v.number(),
    badgeId: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("achievementsCatalog", {
      ...args,
      active: true,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const updateAchievement = mutation({
  args: { achievementId: v.string(), updates: v.any() },
  handler: async (ctx, args) => {
    const achievement = await ctx.db
      .query("achievementsCatalog")
      .collect()
      .then((arr) => arr.find((a) => a.achievementId === args.achievementId));

    if (!achievement) {
      const fallback = await ctx.db.query("achievementsCatalog").collect();
      const fallbackAchievement = fallback.find((a) => a.achievementId === args.achievementId);
      if (!fallbackAchievement) throw new Error("Achievement not found");
    }

    await ctx.db.patch(achievement._id, { ...args.updates, updatedAt: now() });
    return achievement._id;
  },
});

export const deleteAchievement = mutation({
  args: { achievementId: v.string() },
  handler: async (ctx, args) => {
    const achievement = await ctx.db
      .query("achievementsCatalog")
      .collect()
      .then((arr) => arr.find((a) => a.achievementId === args.achievementId));

    if (achievement) await ctx.db.delete(achievement._id);
    return { success: true };
  },
});

export const createMysteryBox = mutation({
  args: {
    boxId: v.string(),
    name: v.string(),
    description: v.string(),
    coinPrice: v.number(),
    active: v.boolean(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mysteryBoxes", {
      boxId: args.boxId,
      name: args.name,
      description: args.description,
      coinPrice: args.coinPrice,
      imageUrl: args.imageUrl,
      active: args.active ?? true,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const createMysteryBoxPrize = mutation({
  args: {
    boxId: v.string(),
    prizeId: v.string(),
    type: v.union(
      v.literal("airtime"),
      v.literal("data"),
      v.literal("gift_card"),
      v.literal("premium"),
      v.literal("merchandise"),
      v.literal("lemon_coins"),
      v.literal("golden_ink"),
      v.literal("badge")
    ),
    amount: v.optional(v.number()),
    metadata: v.optional(v.any()),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mysteryBoxPrizes", {
      ...args,
      active: true,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const listMysteryBoxes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mysteryBoxes").collect();
  },
});

export const listActiveMysteryBoxes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("mysteryBoxes")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const logActivity = mutation({
  args: {
    action: v.string(),
    adminEmail: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("adminActivity", {
      ...args,
      timestamp: now(),
    });
  },
});
