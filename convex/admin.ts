import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

const getRewardPrice = (reward: any) =>
  Number(
    reward?.metadata?.priceCoins ??
      reward?.metadata?.coinPrice ??
      reward?.metadata?.price ??
      reward?.amount ??
      0,
  );
const getRewardFulfillment = (reward: any) =>
  reward?.metadata?.fulfillmentMode ||
  reward?.metadata?.fulfillment ||
  "automatic";

const successfulRevenueAmount = (transaction: any) => {
  if (transaction.status !== "success") return 0;
  if (transaction.type === "wallet_topup") {
    return Number(transaction.metadata?.nairaAmount || 0);
  }
  if (transaction.type === "premium") {
    return Number(transaction.amount || 0);
  }
  return 0;
};

const monthKey = (timestamp: string) =>
  new Date(timestamp).toISOString().slice(0, 7);
const shortMonth = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "short",
  });
};

const lastMonthKeys = (count: number) => {
  const nowDate = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth() - (count - 1 - index),
      1,
    );
    return date.toISOString().slice(0, 7);
  });
};

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const [
      users,
      stories,
      applications,
      reports,
      creators,
      transactions,
      activity,
    ] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("stories").collect(),
      ctx.db.query("creatorApplications").collect(),
      ctx.db.query("contentReports").collect(),
      ctx.db.query("creators").collect(),
      ctx.db.query("walletTransactions").collect(),
      ctx.db.query("adminActivity").order("desc").collect(),
    ]);

    const revenueNaira = transactions.reduce(
      (total, transaction) => total + successfulRevenueAmount(transaction),
      0,
    );

    return {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === "active").length,
      totalStories: stories.length,
      publishedStories: stories.filter((story) => story.status === "published")
        .length,
      pendingApplications: applications.filter(
        (application) => application.status === "pending",
      ).length,
      totalApplications: applications.length,
      openReports: reports.filter(
        (report) => report.status === "open" || report.status === "reviewing",
      ).length,
      totalReports: reports.length,
      totalCreators: creators.length,
      revenueNaira,
      successfulPayments: transactions.filter(
        (transaction) => transaction.status === "success",
      ).length,
      recentActivity: activity.slice(0, 8),
    };
  },
});

export const analytics = query({
  args: {},
  handler: async (ctx) => {
    const [
      users,
      stories,
      readingHistory,
      transactions,
      engagementEvents,
      xpEvents,
      rewardCatalog,
      redemptions,
    ] = await Promise.all([
      ctx.db.query("users").take(500),
      ctx.db.query("stories").take(500),
      ctx.db.query("readingHistory").take(1000),
      ctx.db.query("walletTransactions").take(1000),
      ctx.db.query("engagementEvents").take(1000),
      ctx.db.query("xpEvents").take(1000),
      ctx.db.query("rewardInventory").take(200),
      ctx.db.query("spinResults").take(500),
    ]);

    const premiumUsers = users.filter(
      (user) => user.premiumStatus === "premium",
    );
    const revenueNaira = transactions.reduce(
      (total, transaction) => total + successfulRevenueAmount(transaction),
      0,
    );
    const premiumRevenue = transactions
      .filter(
        (transaction) =>
          transaction.type === "premium" && transaction.status === "success",
      )
      .reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );
    const walletRevenue = transactions
      .filter(
        (transaction) =>
          transaction.type === "wallet_topup" &&
          transaction.status === "success",
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.metadata?.nairaAmount || 0),
        0,
      );

    const monthCounts = new Map<string, number>();
    for (const item of readingHistory) {
      const key = monthKey(item.timestamp);
      monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
    }

    const monthlyReads = lastMonthKeys(12).map((key) => ({
      month: shortMonth(key),
      reads: monthCounts.get(key) || 0,
    }));

    const topStories = stories
      .slice()
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((story) => ({
        id: story._id,
        title: story.title,
        reads: story.views,
        saves: story.saves,
      }));

    const coinEvents = xpEvents.filter(
      (event) => event.metadata?.currency === "lemonCoins",
    );
    const totalCoinsEarned = coinEvents
      .filter((event) => Number(event.amount || 0) > 0)
      .reduce((total, event) => total + Number(event.amount || 0), 0);
    const totalCoinsSpent = coinEvents
      .filter((event) => Number(event.amount || 0) < 0)
      .reduce((total, event) => total + Math.abs(Number(event.amount || 0)), 0);

    const readerCounts = new Map<string, number>();
    for (const event of engagementEvents) {
      if (!event.counted) continue;
      readerCounts.set(event.userId, (readerCounts.get(event.userId) || 0) + 1);
    }

    const commenterCounts = new Map<string, number>();
    for (const event of xpEvents) {
      if (event.reason !== "comment_reward") continue;
      commenterCounts.set(
        event.userId,
        (commenterCounts.get(event.userId) || 0) + 1,
      );
    }

    const topReaders = Array.from(readerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, reads]) => {
        const user = users.find((item) => item._id === userId);
        return {
          userId,
          name: user?.name || "Unknown",
          username: user?.username || "unknown",
          reads,
        };
      });

    const topCommenters = Array.from(commenterCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, comments]) => {
        const user = users.find((item) => item._id === userId);
        return {
          userId,
          name: user?.name || "Unknown",
          username: user?.username || "unknown",
          comments,
        };
      });

    const redemptionCounts = new Map<string, number>();
    for (const redemption of redemptions) {
      const key = redemption.rewardId || redemption.rewardType || "unknown";
      redemptionCounts.set(key, (redemptionCounts.get(key) || 0) + 1);
    }

    const mostRedeemedRewards = Array.from(redemptionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([rewardId, count]) => ({ rewardId, count }));

    const activeUsers = users.filter((user) =>
      engagementEvents.some(
        (event) =>
          event.userId === user._id &&
          Date.parse(event.timestamp || "1970-01-01") >
            Date.now() - 30 * 24 * 60 * 60 * 1000,
      ),
    ).length;

    const redemptionTrendCounts = new Map<string, number>();
    for (const redemption of redemptions) {
      const key = (redemption.awardedAt || now()).slice(0, 10);
      redemptionTrendCounts.set(key, (redemptionTrendCounts.get(key) || 0) + 1);
    }

    return {
      userGrowth: users.length,
      activeUsers,
      storyReads: readingHistory.length,
      premiumSubscribers: premiumUsers.length,
      totalRevenueNaira: revenueNaira,
      monthlyReads,
      topStories,
      totalCoinsEarned,
      totalCoinsSpent,
      topReaders,
      topCommenters,
      mostRedeemedRewards,
      redemptionTrends: Array.from(redemptionTrendCounts.entries()).map(
        ([date, count]) => ({ date, count }),
      ),
      marketplaceInventory: rewardCatalog.map((reward) => ({
        id: reward._id,
        rewardId: reward.rewardId,
        type: reward.type,
        quantity: reward.quantity,
        reserved: reward.reserved,
        priceCoins: getRewardPrice(reward),
        fulfillmentMode: getRewardFulfillment(reward),
        metadata: reward.metadata,
      })),
      rewardSummary: {
        premium: premiumRevenue,
        wallet: walletRevenue,
        support: transactions
          .filter(
            (transaction) =>
              transaction.type === "creator_support" &&
              transaction.status === "success",
          )
          .reduce(
            (total, transaction) => total + Number(transaction.amount || 0),
            0,
          ),
      },
      supportClicks: transactions.filter(
        (transaction) => transaction.type === "creator_support",
      ).length,
      conversionRate:
        users.length > 0 ? (premiumUsers.length / users.length) * 100 : 0,
    };
  },
});

export const premium = query({
  args: {},
  handler: async (ctx) => {
    const [users, transactions] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("walletTransactions").collect(),
    ]);

    const premiumUsers = users.filter(
      (user) => user.premiumStatus === "premium",
    );
    const trialUsers = users.filter((user) => user.premiumStatus === "trial");
    const cancelledUsers = premiumUsers.filter(
      (user) => user.premiumCancelAtPeriodEnd,
    );
    const premiumTransactions = transactions.filter(
      (transaction) =>
        transaction.type === "premium" && transaction.status === "success",
    );
    const premiumRevenue = premiumTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );
    const monthlyRevenue = premiumTransactions
      .filter((transaction) => transaction.metadata?.billingCycle !== "yearly")
      .reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );
    const yearlyRevenue = premiumTransactions
      .filter((transaction) => transaction.metadata?.billingCycle === "yearly")
      .reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );

    return {
      activeSubscribers: premiumUsers.length,
      trialMembers: trialUsers.length,
      conversionRate:
        users.length > 0 ? (premiumUsers.length / users.length) * 100 : 0,
      churnRate:
        premiumUsers.length > 0
          ? (cancelledUsers.length / premiumUsers.length) * 100
          : 0,
      monthlyMrr: monthlyRevenue,
      yearlyArr: yearlyRevenue,
      totalPremiumRevenue: premiumRevenue,
      subscribers: premiumUsers.map((user) => ({
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        premiumPlan: user.premiumPlan,
        premiumBillingCycle: user.premiumBillingCycle,
        premiumStartedAt: user.premiumStartedAt,
        premiumRenewsAt: user.premiumRenewsAt,
        premiumCancelAtPeriodEnd: user.premiumCancelAtPeriodEnd,
      })),
    };
  },
});

export const listReports = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contentReports").collect();
  },
});

export const createReport = mutation({
  args: {
    type: v.union(
      v.literal("story"),
      v.literal("chapter"),
      v.literal("user"),
      v.literal("comment"),
    ),
    targetId: v.string(),
    targetName: v.string(),
    reportedBy: v.string(),
    reason: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentReports", {
      ...args,
      status: "open",
      createdAt: now(),
    });
  },
});

export const resolveReport = mutation({
  args: {
    reportId: v.id("contentReports"),
    status: v.union(v.literal("resolved"), v.literal("dismissed")),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      status: args.status,
      resolvedAt: now(),
      resolvedBy: args.adminEmail,
    });
    return args.reportId;
  },
});

export const listActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("adminActivity").order("desc").collect();
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

export const listModerators = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("moderators").collect();
  },
});

export const listSpinRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("weeklySpinInventory").take(100);
  },
});

export const createSpinReward = mutation({
  args: {
    rewardId: v.string(),
    type: v.union(
      v.literal("airtime"),
      v.literal("data"),
      v.literal("cash"),
      v.literal("gift_card"),
      v.literal("bonus_spin"),
      v.literal("lemon_coins"),
      v.literal("cosmetic"),
      v.literal("premium"),
      v.literal("badge"),
    ),
    amount: v.optional(v.number()),
    metadata: v.optional(v.any()),
    weight: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("weeklySpinInventory", {
      rewardId: args.rewardId,
      type: args.type,
      amount: args.amount ?? null,
      metadata: args.metadata ?? {},
      weight: args.weight,
      active: args.active,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateSpinReward = mutation({
  args: {
    id: v.id("weeklySpinInventory"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: new Date().toISOString(),
    });
    return args.id;
  },
});

export const deleteSpinReward = mutation({
  args: { id: v.id("weeklySpinInventory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const listMarketplaceRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rewardInventory").take(200);
  },
});

export const createMarketplaceReward = mutation({
  args: {
    rewardId: v.string(),
    type: v.union(
      v.literal("airtime"),
      v.literal("data"),
      v.literal("cash"),
      v.literal("gift_card"),
      v.literal("premium"),
      v.literal("mystery_box"),
      v.literal("merchandise"),
      v.literal("subscription"),
      v.literal("bonus_coins"),
      v.literal("badge"),
    ),
    quantity: v.number(),
    reserved: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rewardInventory", {
      rewardId: args.rewardId,
      provider: args.metadata?.provider,
      type: args.type,
      quantity: args.quantity,
      reserved: args.reserved ?? 0,
      metadata: args.metadata ?? {},
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateMarketplaceReward = mutation({
  args: {
    id: v.id("rewardInventory"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: new Date().toISOString(),
    });
    return args.id;
  },
});

export const deleteMarketplaceReward = mutation({
  args: { id: v.id("rewardInventory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const listRedemptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("spinResults").take(200);
  },
});

export const approveRedemption = mutation({
  args: {
    redemptionId: v.id("spinResults"),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const redemption = await ctx.db.get(args.redemptionId);
    if (!redemption) throw new Error("Redemption not found.");
    await ctx.db.patch(redemption._id, {
      status: "claimed",
      claimedAt: new Date().toISOString(),
      metadata: {
        ...(redemption.metadata || {}),
        reviewedBy: args.adminEmail || null,
      },
    });
    return redemption._id;
  },
});

export const rejectRedemption = mutation({
  args: {
    redemptionId: v.id("spinResults"),
    adminEmail: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const redemption = await ctx.db.get(args.redemptionId);
    if (!redemption) throw new Error("Redemption not found.");
    await ctx.db.patch(redemption._id, {
      status: "expired",
      metadata: {
        ...(redemption.metadata || {}),
        rejectedBy: args.adminEmail || null,
        rejectionReason: args.reason || null,
      },
    });
    return redemption._id;
  },
});

export const listMissionCatalog = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("achievementsCatalog")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(100);
  },
});

export const upsertMission = mutation({
  args: {
    id: v.optional(v.id("achievementsCatalog")),
    achievementId: v.string(),
    name: v.string(),
    description: v.string(),
    criteria: v.any(),
    xpReward: v.number(),
    coinReward: v.number(),
    badgeId: v.optional(v.string()),
    icon: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const payload = {
      achievementId: args.achievementId,
      name: args.name,
      description: args.description,
      criteria: args.criteria,
      xpReward: args.xpReward,
      coinReward: args.coinReward,
      badgeId: args.badgeId,
      icon: args.icon,
      active: args.active,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return args.id;
    }
    return await ctx.db.insert("achievementsCatalog", payload);
  },
});

export const deleteMission = mutation({
  args: { id: v.id("achievementsCatalog") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const scanEngagementForFraud = mutation({
  args: { minutes: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const lookbackMs = (args.minutes || 60) * 60 * 1000;
    const cutoff = Date.now() - lookbackMs;
    const events = await ctx.db.query("engagementEvents").collect();
    const suspects: any[] = [];

    for (const e of events) {
      const t = Date.parse(e.timestamp || "1970-01-01");
      if (t < cutoff) continue;
      // simple heuristics
      if (e.durationMs < 10000 && e.completionPct >= 80) {
        suspects.push({
          userId: e.userId,
          reason: "very short duration with high completion",
          evidence: e,
        });
      }
      if (e.sessionQuality <= 5 && e.returningVisit && e.durationMs < 5000) {
        suspects.push({
          userId: e.userId,
          reason: "low quality repeated short sessions",
          evidence: e,
        });
      }
    }

    const created: any[] = [];
    for (const s of suspects) {
      const id = await ctx.db.insert("fraudEvents", {
        userId: s.userId || null,
        type: "engagement_suspicious",
        description: s.reason,
        evidence: s.evidence,
        score: 50,
        resolved: false,
        createdAt: new Date().toISOString(),
      });
      created.push(id);
    }

    return { created: created.length };
  },
});

export const listFraudEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fraudEvents").collect();
  },
});

export const resolveFraudEvent = mutation({
  args: {
    id: v.id("fraudEvents"),
    resolved: v.boolean(),
    reviewedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      resolved: args.resolved,
      resolvedAt: new Date().toISOString(),
      reviewedBy: args.reviewedBy || null,
    });
    return args.id;
  },
});
