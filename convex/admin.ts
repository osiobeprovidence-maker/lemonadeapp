import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();
const shortMonth = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short" });
};
const lastMonthKeys = (count: number) => {
  const nowDate = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(nowDate.getFullYear(), nowDate.getMonth() - (count - 1 - index), 1);
    return date.toISOString().slice(0, 7);
  });
};

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const [users, stories, applications, reports, creators, transactions, activity] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("stories").collect(),
      ctx.db.query("creatorApplications").collect(),
      ctx.db.query("contentReports").collect(),
      ctx.db.query("creators").collect(),
      ctx.db.query("walletTransactions").collect(),
      ctx.db.query("adminActivity").order("desc").collect(),
    ]);

    const totalCoinsEarned = await ctx.db
      .query("coinTransactions")
      .collect()
      .then((txns) => txns.filter((t) => t.type === "earn" || t.type === "bonus").reduce((sum, t) => sum + t.amount, 0));

    const totalCoinsSpent = await ctx.db
      .query("coinTransactions")
      .collect()
      .then((txns) => txns.filter((t) => t.type === "spend").reduce((sum, t) => sum + t.amount, 0));

    const totalRedemptions = await ctx.db.query("rewardRedemptions").collect().then((r) => r.length);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === "active").length,
      totalStories: stories.length,
      publishedStories: stories.filter((story) => story.status === "published").length,
      pendingApplications: applications.filter((application) => application.status === "pending").length,
      totalApplications: applications.length,
      openReports: reports.filter((report) => report.status === "open" || report.status === "reviewing").length,
      totalReports: reports.length,
      totalCreators: creators.length,
      totalCoinsEarned,
      totalCoinsSpent,
      totalRedemptions,
      recentActivity: activity.slice(0, 8),
    };
  },
});

export const analytics = query({
  args: {},
  handler: async (ctx) => {
    const [users, stories, readingHistory, transactions] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("stories").collect(),
      ctx.db.query("readingHistory").collect(),
      ctx.db.query("walletTransactions").collect(),
    ]);

    const premiumUsers = users.filter((user) => user.premiumStatus === "premium");

    const revenueNaira = transactions.reduce(
      (total, transaction) => total + successfulRevenueAmount(transaction),
      0,
    );

    const monthCounts = new Map<string, number>();
    for (const item of readingHistory) {
      const key = item.timestamp ? new Date(item.timestamp).toISOString().slice(0, 7) : "unknown";
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

    const coinTxns = await ctx.db.query("coinTransactions").collect();
    const coinsBySource = coinTxns.reduce<Record<string, number>>((acc, txn) => {
      acc[txn.source] = (acc[txn.source] || 0) + txn.amount;
      return acc;
    }, {});

    const redemptions = await ctx.db.query("rewardRedemptions").collect();
    const redemptionByStatus = redemptions.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    return {
      userGrowth: users.length,
      storyReads: readingHistory.length,
      premiumSubscribers: premiumUsers.length,
      totalRevenueNaira: revenueNaira,
      monthlyReads,
      topStories,
      coinsBySource,
      redemptionByStatus,
      totalRedemptions: redemptions.length,
      totalCoinsEarned: coinTxns.filter((t) => t.type !== "spend").reduce((sum, t) => sum + t.amount, 0),
      totalCoinsSpent: coinTxns.filter((t) => t.type === "spend").reduce((sum, t) => sum + t.amount, 0),
      conversionRate: users.length > 0 ? (premiumUsers.length / users.length) * 100 : 0,
    };
  },
});

export const redemptionAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const redemptions = await ctx.db.query("rewardRedemptions").order("desc").collect();
    const pending = redemptions.filter((r) => r.status === "pending");

    const rewards = await ctx.db.query("marketplaceRewards").collect();
    const utilization = rewards.map((reward) => ({
      rewardId: reward.rewardId,
      name: reward.name,
      type: reward.type,
      coinPrice: reward.coinPrice,
      stock: reward.stock,
      reserved: reward.reserved,
      available: reward.stock - reward.reserved,
    }));

    return {
      totalRedemptions: redemptions.length,
      pending,
      pendingCount: pending.length,
      rewards: utilization,
      recentActivity: redemptions.slice(0, 20),
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

export const scanEngagementForFraud = mutation({
  args: { minutes: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const lookbackMs = (args.minutes || 60) * 60 * 1000;
    const cutoff = Date.now() - lookbackMs;
    const events = await ctx.db.query("engagementEvents").collect();
    const suspects: any[] = [];

    for (const e of events) {
      const t = Date.parse(e.timestamp || '1970-01-01');
      if (t < cutoff) continue;
      if (e.durationMs < 10000 && e.completionPct >= 80) {
        suspects.push({ userId: e.userId, reason: 'very short duration with high completion', evidence: e });
      }
      if (e.sessionQuality <= 5 && e.returningVisit && e.durationMs < 5000) {
        suspects.push({ userId: e.userId, reason: 'low quality repeated short sessions', evidence: e });
      }
    }

    const created: any[] = [];
    for (const s of suspects) {
      const id = await ctx.db.insert('fraudEvents', {
        userId: s.userId || null,
        type: 'engagement_suspicious',
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
    return await ctx.db.query('fraudEvents').collect();
  },
});

export const resolveFraudEvent = mutation({
  args: { id: v.id('fraudEvents'), resolved: v.boolean(), reviewedBy: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { resolved: args.resolved, resolvedAt: new Date().toISOString(), reviewedBy: args.reviewedBy || null });
    return args.id;
  },
});

export const listSpinRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("weeklySpinInventory").collect();
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
    await ctx.db.patch(args.id, { ...args.updates, updatedAt: new Date().toISOString() });
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

function successfulRevenueAmount(transaction: any) {
  if (transaction.status !== "success") return 0;
  if (transaction.type === "wallet_topup") {
    return Number(transaction.metadata?.nairaAmount || 0);
  }
  if (transaction.type === "premium") {
    return Number(transaction.amount || 0);
  }
  return 0;
}
