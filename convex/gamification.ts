import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

const DEFAULT_MISSIONS = [
  {
    missionId: "read_5_chapters",
    name: "Read 5 Chapters",
    description: "Keep the reading momentum going by completing five chapters.",
    criteria: {
      kind: "mission",
      metric: "countedReads",
      target: 5,
      window: "week",
    },
    coinReward: 25,
    xpReward: 50,
    badgeId: "bookworm",
  },
  {
    missionId: "read_60_minutes",
    name: "Read for 60 Minutes",
    description: "Spend an hour immersed in stories this week.",
    criteria: {
      kind: "mission",
      metric: "readMinutes",
      target: 60,
      window: "week",
    },
    coinReward: 35,
    xpReward: 75,
    badgeId: "story_sage",
  },
  {
    missionId: "leave_3_meaningful_comments",
    name: "Leave 3 Meaningful Comments",
    description: "Join the discussion with thoughtful, quality comments.",
    criteria: {
      kind: "mission",
      metric: "meaningfulComments",
      target: 3,
      window: "week",
    },
    coinReward: 20,
    xpReward: 40,
    badgeId: "story_critic",
  },
  {
    missionId: "complete_1_story",
    name: "Complete a Story",
    description: "Finish a story, novel, manga, or comic chapter arc.",
    criteria: {
      kind: "mission",
      metric: "completedStories",
      target: 1,
      window: "week",
    },
    coinReward: 50,
    xpReward: 100,
    badgeId: "legend_reader",
  },
] as const;

const COMMENT_BLACKLIST = new Set([
  "nice",
  "first",
  "good chapter",
  "wow",
  "cool",
  "great",
  "loved it",
  "amazing",
  "awesome",
]);

const COMMENT_SIGNAL_WORDS = new Set([
  "character",
  "chapter",
  "plot",
  "story",
  "ending",
  "twist",
  "prediction",
  "theory",
  "analysis",
  "feedback",
  "because",
  "however",
  "relationship",
  "dialogue",
  "arc",
  "scene",
  "villain",
  "hero",
  "emotion",
  "theme",
  "development",
]);

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const COMMENT_LIKE_TIERS = [1, 3, 5, 10];

async function getUserByFirebaseUid(ctx: any, firebaseUid: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_firebaseUid", (q: any) => q.eq("firebaseUid", firebaseUid))
    .unique();
}

async function getCurrencies(ctx: any, userId: string) {
  return await ctx.db
    .query("userCurrencies")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique();
}

async function getStreak(ctx: any, userId: string) {
  return await ctx.db
    .query("userStreaks")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique();
}

function ensureDateString(value?: string | null) {
  return value ? new Date(value) : null;
}

function sameUtcDay(a: Date, b: Date) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function isYesterdayUTC(previous: Date, current: Date) {
  const prevDay = Date.UTC(
    previous.getUTCFullYear(),
    previous.getUTCMonth(),
    previous.getUTCDate(),
  );
  const currDay = Date.UTC(
    current.getUTCFullYear(),
    current.getUTCMonth(),
    current.getUTCDate(),
  );
  return currDay - prevDay === 24 * 60 * 60 * 1000;
}

function normalizeComment(message: string) {
  return message.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreComment(message: string) {
  const normalized = normalizeComment(message);
  if (!normalized || normalized.length < 20) {
    return { meaningful: false, score: 0, reason: "too_short" };
  }

  if (COMMENT_BLACKLIST.has(normalized)) {
    return { meaningful: false, score: 0, reason: "low_quality_phrase" };
  }

  const words = normalized
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const meaningfulWords = words.filter(
    (word) =>
      ![
        "the",
        "and",
        "a",
        "an",
        "to",
        "of",
        "is",
        "it",
        "this",
        "that",
        "i",
        "you",
        "they",
      ].includes(word),
  );
  const distinctWords = new Set(meaningfulWords);
  const signalWords = meaningfulWords.filter((word) =>
    COMMENT_SIGNAL_WORDS.has(word),
  );

  let score = 0;
  score += Math.min(30, meaningfulWords.length * 3);
  score += Math.min(20, distinctWords.size * 2);
  score += Math.min(20, signalWords.length * 8);
  if (normalized.includes("?") || normalized.includes("!")) score += 5;
  if (
    normalized.includes("because") ||
    normalized.includes("but") ||
    normalized.includes("however")
  )
    score += 10;
  if (normalized.length > 120) score += 10;

  const meaningful = score >= 35 && meaningfulWords.length >= 6;
  return {
    meaningful,
    score: Math.min(100, score),
    reason: meaningful ? "meaningful" : "low_signal",
  };
}

async function creditCoins(
  ctx: any,
  userId: string,
  amount: number,
  reason: string,
  source: string,
  metadata: Record<string, any> = {},
) {
  if (!amount || amount === 0)
    return { balance: (await getCurrencies(ctx, userId))?.lemonCoins || 0 };

  const currencies = await getCurrencies(ctx, userId);
  const updatedBalance = (currencies?.lemonCoins || 0) + amount;

  if (currencies) {
    await ctx.db.patch(currencies._id, {
      lemonCoins: updatedBalance,
      updatedAt: now(),
    });
  } else {
    await ctx.db.insert("userCurrencies", {
      userId,
      lemonCoins: updatedBalance,
      goldenInk: 0,
      updatedAt: now(),
    });
  }

  await ctx.db.insert("xpEvents", {
    userId,
    amount,
    reason,
    source,
    timestamp: now(),
    metadata: { currency: "lemonCoins", ...metadata },
  });

  return { balance: updatedBalance };
}

async function spendCoins(
  ctx: any,
  userId: string,
  amount: number,
  reason: string,
  source: string,
  metadata: Record<string, any> = {},
) {
  if (amount <= 0) throw new Error("Spend amount must be positive.");

  const currencies = await getCurrencies(ctx, userId);
  const currentBalance = currencies?.lemonCoins || 0;
  if (currentBalance < amount) {
    throw new Error("Insufficient Lemon Coins.");
  }

  const updatedBalance = currentBalance - amount;
  if (currencies) {
    await ctx.db.patch(currencies._id, {
      lemonCoins: updatedBalance,
      updatedAt: now(),
    });
  } else {
    await ctx.db.insert("userCurrencies", {
      userId,
      lemonCoins: updatedBalance,
      goldenInk: 0,
      updatedAt: now(),
    });
  }

  await ctx.db.insert("xpEvents", {
    userId,
    amount: -amount,
    reason,
    source,
    timestamp: now(),
    metadata: { currency: "lemonCoins", ...metadata },
  });

  return { balance: updatedBalance };
}

async function awardStreakBonus(ctx: any, userId: string, streakCount: number) {
  const bonus = STREAK_MILESTONES.includes(streakCount)
    ? streakCount >= 30
      ? 30
      : streakCount >= 14
        ? 20
        : streakCount >= 7
          ? 10
          : 5
    : 0;
  if (bonus <= 0) return null;
  const result = await creditCoins(
    ctx,
    userId,
    bonus,
    "streak_bonus",
    `streak:${streakCount}`,
    { streakCount },
  );
  return { amount: bonus, balance: result.balance };
}

async function updateStreak(ctx: any, userId: string, counted: boolean) {
  if (!counted) return { streak: await getStreak(ctx, userId), bonus: null };

  const streak = await getStreak(ctx, userId);
  const nowDate = new Date();

  if (!streak) {
    const created = await ctx.db.insert("userStreaks", {
      userId,
      currentStreak: 1,
      lastActiveAt: now(),
      longestStreak: 1,
      protectedUntil: undefined,
      insuranceUses: 0,
      updatedAt: now(),
    });
    return {
      streak: await ctx.db.get(created),
      bonus: await awardStreakBonus(ctx, userId, 1),
    };
  }

  const lastActive = ensureDateString(streak.lastActiveAt);
  if (lastActive && sameUtcDay(lastActive, nowDate)) {
    return { streak, bonus: null };
  }

  let currentStreak = streak.currentStreak || 0;
  if (!lastActive) {
    currentStreak = 1;
  } else if (isYesterdayUTC(lastActive, nowDate)) {
    currentStreak += 1;
  } else {
    const protectedUntil = ensureDateString(streak.protectedUntil);
    if (!protectedUntil || protectedUntil.getTime() < nowDate.getTime()) {
      currentStreak = 1;
    }
  }

  const longestStreak = Math.max(streak.longestStreak || 0, currentStreak);
  await ctx.db.patch(streak._id, {
    currentStreak,
    longestStreak,
    lastActiveAt: now(),
    updatedAt: now(),
  });

  return {
    streak: { ...streak, currentStreak, longestStreak },
    bonus: await awardStreakBonus(ctx, userId, currentStreak),
  };
}

async function maybeUnlockCatalogItems(
  ctx: any,
  userId: string,
  trigger: Record<string, any>,
) {
  const catalog = await ctx.db
    .query("achievementsCatalog")
    .withIndex("by_active", (q: any) => q.eq("active", true))
    .take(100);
  const already = await ctx.db
    .query("userAchievements")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .take(200);
  const unlockedIds = new Set(already.map((item: any) => item.achievementId));
  const newUnlocks: Array<{
    id: string;
    coinReward: number;
    xpReward: number;
    badgeId?: string;
    name: string;
  }> = [];

  for (const entry of catalog) {
    const criteria = entry.criteria || {};
    if ((criteria.kind || "achievement") !== trigger.kind) continue;
    if (!criteria.metric || criteria.metric !== trigger.metric) continue;
    const target = Number(criteria.target || 0);
    const progress = Number(trigger.progress || 0);
    if (target <= 0 || progress < target) continue;
    if (unlockedIds.has(entry.achievementId)) continue;
    newUnlocks.push({
      id: entry.achievementId,
      coinReward: Number(entry.coinReward || 0),
      xpReward: Number(entry.xpReward || 0),
      badgeId: entry.badgeId || undefined,
      name: entry.name,
    });
  }

  for (const unlock of newUnlocks) {
    await ctx.db.insert("userAchievements", {
      userId,
      achievementId: unlock.id,
      awardedAt: now(),
      metadata: { kind: "achievement", trigger },
    });
    if (unlock.coinReward > 0) {
      await creditCoins(
        ctx,
        userId,
        unlock.coinReward,
        "achievement_unlock",
        unlock.id,
        {
          achievementId: unlock.id,
          name: unlock.name,
        },
      );
    }
    if (unlock.xpReward > 0) {
      await ctx.db.insert("xpEvents", {
        userId,
        amount: unlock.xpReward,
        reason: "achievement_unlock",
        source: unlock.id,
        timestamp: now(),
        metadata: { kind: "achievement", ...trigger },
      });

      const user = await ctx.db.get(userId as any);
      if (user) {
        const currentXp = Number(user.xp || 0);
        const newXp = currentXp + unlock.xpReward;
        const currentLevel = Number(user.level || 1);
        let newLevel = currentLevel;
        const xpForNext = (lvl: number) => lvl * 1000;
        while (newXp >= xpForNext(newLevel + 1)) newLevel += 1;
        await ctx.db.patch(user._id, {
          xp: newXp,
          level: newLevel,
          updatedAt: now(),
        });
      }
    }

    if (unlock.badgeId) {
      const user = await ctx.db.get(userId as any);
      if (user && !(user.badges || []).includes(unlock.badgeId)) {
        await ctx.db.patch(user._id, {
          badges: [...(user.badges || []), unlock.badgeId],
          updatedAt: now(),
        });
      }
    }
  }

  return newUnlocks;
}

function getRewardPrice(reward: any) {
  return Number(
    reward?.metadata?.priceCoins ??
      reward?.metadata?.coinPrice ??
      reward?.metadata?.price ??
      reward?.amount ??
      0,
  );
}

function getRewardFulfillment(reward: any) {
  return (
    reward?.metadata?.fulfillmentMode ||
    reward?.metadata?.fulfillment ||
    "automatic"
  );
}

function isRewardActive(reward: any) {
  if (reward?.metadata?.active === false) return false;
  if (reward?.active === false) return false;
  return (reward?.quantity ?? 0) > 0;
}

function missionWindow(criterion: any) {
  const nowDate = new Date();
  const window = criterion?.window || "all_time";
  if (window === "week") {
    const start = new Date(nowDate);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    return {
      start: start.getTime(),
      end: start.getTime() + 7 * 24 * 60 * 60 * 1000,
    };
  }
  if (window === "day") {
    const start = new Date(nowDate);
    start.setUTCHours(0, 0, 0, 0);
    return {
      start: start.getTime(),
      end: start.getTime() + 24 * 60 * 60 * 1000,
    };
  }
  return { start: 0, end: Number.MAX_SAFE_INTEGER };
}

async function computeMissionProgress(ctx: any, userId: string, mission: any) {
  const criterion = mission.criteria || {};
  const window = missionWindow(criterion);
  const metric = criterion.metric;
  const target = Number(criterion.target || 0);

  if (!metric || target <= 0) {
    return { progress: 0, target };
  }

  if (
    metric === "countedReads" ||
    metric === "completedStories" ||
    metric === "readMinutes"
  ) {
    const events = await ctx.db
      .query("engagementEvents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .take(200);
    const filtered = events.filter((event: any) => {
      const ts = Date.parse(event.timestamp || "1970-01-01");
      return ts >= window.start && ts < window.end && event.counted;
    });

    if (metric === "countedReads") {
      return { progress: filtered.length, target };
    }
    if (metric === "completedStories") {
      return {
        progress: filtered.filter(
          (event: any) => Number(event.completionPct || 0) >= 95,
        ).length,
        target,
      };
    }
    if (metric === "readMinutes") {
      const minutes = filtered.reduce(
        (sum: number, event: any) =>
          sum + Number(event.durationMs || 0) / 60000,
        0,
      );
      return { progress: Math.floor(minutes), target };
    }
  }

  if (metric === "meaningfulComments") {
    const events = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .take(200);
    const filtered = events.filter((event: any) => {
      const ts = Date.parse(event.timestamp || "1970-01-01");
      return (
        ts >= window.start &&
        ts < window.end &&
        event.reason === "comment_reward" &&
        Boolean(event.metadata?.meaningful)
      );
    });
    return { progress: filtered.length, target };
  }

  if (metric === "commentLikes") {
    const events = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .take(200);
    const filtered = events.filter((event: any) => {
      const ts = Date.parse(event.timestamp || "1970-01-01");
      return (
        ts >= window.start &&
        ts < window.end &&
        event.reason === "comment_like_bonus"
      );
    });
    return { progress: filtered.length, target };
  }

  return { progress: 0, target };
}

async function claimMissionReward(ctx: any, userId: string, mission: any) {
  const progress = await computeMissionProgress(ctx, userId, mission);
  const achievementId = `mission:${mission.missionId || mission.achievementId}`;
  const existing = await ctx.db
    .query("userAchievements")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .take(200);
  const record = existing.find(
    (item: any) => item.achievementId === achievementId,
  );

  if (progress.progress < progress.target) {
    throw new Error("Mission not yet complete.");
  }

  if (record?.metadata?.claimed) {
    return { claimed: true, alreadyClaimed: true, progress };
  }

  if (record) {
    await ctx.db.patch(record._id, {
      metadata: {
        ...(record.metadata || {}),
        progress: progress.progress,
        target: progress.target,
        claimed: true,
        claimedAt: now(),
      },
    });
  } else {
    await ctx.db.insert("userAchievements", {
      userId,
      achievementId,
      awardedAt: now(),
      metadata: {
        kind: "mission",
        progress: progress.progress,
        target: progress.target,
        claimed: true,
        claimedAt: now(),
      },
    });
  }

  const reward = Number(mission.coinReward || mission.rewards?.coins || 0);
  if (reward > 0) {
    await creditCoins(ctx, userId, reward, "mission_reward", achievementId, {
      missionId: mission.missionId || mission.achievementId,
      name: mission.name,
    });
  }

  const xpReward = Number(mission.xpReward || mission.rewards?.xp || 0);
  if (xpReward > 0) {
    await ctx.db.insert("xpEvents", {
      userId,
      amount: xpReward,
      reason: "mission_reward",
      source: achievementId,
      timestamp: now(),
      metadata: { kind: "mission" },
    });
  }

  if (mission.badgeId) {
    const user = await ctx.db.get(userId as any);
    if (user && !(user.badges || []).includes(mission.badgeId)) {
      await ctx.db.patch(user._id, {
        badges: [...(user.badges || []), mission.badgeId],
        updatedAt: now(),
      });
    }
  }

  return { claimed: true, progress };
}

async function awardHiddenReward(ctx: any, userId: string, source: string) {
  const roll = Math.random();
  if (roll > 0.12) return null;
  const amount = roll > 0.095 ? 25 : roll > 0.05 ? 10 : 5;
  const result = await creditCoins(
    ctx,
    userId,
    amount,
    "hidden_reward",
    source,
    { hidden: true },
  );
  return { amount, balance: result.balance };
}

async function maybeAwardCommentLikeBonus(
  ctx: any,
  comment: any,
  likesCount: number,
) {
  if (!comment?.authorId || likesCount <= 0) return null;
  const tier = [...COMMENT_LIKE_TIERS]
    .reverse()
    .find((value) => likesCount >= value);
  if (!tier) return null;

  const events = await ctx.db
    .query("xpEvents")
    .withIndex("by_user", (q: any) => q.eq("userId", comment.authorId))
    .take(200);
  const alreadyAwarded = events.some(
    (event: any) =>
      event.reason === "comment_like_bonus" &&
      event.metadata?.commentId === String(comment._id) &&
      event.metadata?.tier === tier,
  );
  if (alreadyAwarded) return null;

  const reward = tier >= 10 ? 15 : tier >= 5 ? 8 : tier >= 3 ? 4 : 2;
  const result = await creditCoins(
    ctx,
    comment.authorId,
    reward,
    "comment_like_bonus",
    String(comment._id),
    {
      commentId: String(comment._id),
      likesCount,
      tier,
    },
  );
  return { amount: reward, balance: result.balance };
}

export const getSpinInventory = query({
  args: {},
  handler: async (ctx) => {
    const marketplace = await ctx.db.query("rewardInventory").take(100);
    const mysteryPool = await ctx.db
      .query("weeklySpinInventory")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(100);
    return {
      marketplace: marketplace
        .filter((reward: any) => (reward.quantity || 0) > 0)
        .map((reward: any) => ({
          ...reward,
          priceCoins: getRewardPrice(reward),
          fulfillmentMode: getRewardFulfillment(reward),
          isActive: isRewardActive(reward),
        })),
      mysteryPool,
      missions: DEFAULT_MISSIONS,
    };
  },
});

export const getRewardHub = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) return null;

    const [
      currencies,
      streak,
      marketplace,
      mysteryPool,
      missionCatalog,
      achievements,
      redemptions,
      commentEvents,
    ] = await Promise.all([
      getCurrencies(ctx, user._id),
      getStreak(ctx, user._id),
      ctx.db.query("rewardInventory").take(100),
      ctx.db
        .query("weeklySpinInventory")
        .withIndex("by_active", (q: any) => q.eq("active", true))
        .take(100),
      ctx.db
        .query("achievementsCatalog")
        .withIndex("by_active", (q: any) => q.eq("active", true))
        .take(100),
      ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q: any) => q.eq("userId", user._id))
        .take(200),
      ctx.db
        .query("spinResults")
        .withIndex("by_user_week", (q: any) => q.eq("userId", user._id))
        .take(25),
      ctx.db
        .query("xpEvents")
        .withIndex("by_user", (q: any) => q.eq("userId", user._id))
        .take(200),
    ]);

    const unlocked = new Set(
      achievements.map((entry: any) => entry.achievementId),
    );
    const missions = (
      missionCatalog.length > 0
        ? missionCatalog
        : DEFAULT_MISSIONS.map((mission) => ({ ...mission, active: true }))
    )
      .filter((entry: any) => (entry.criteria?.kind || "mission") === "mission")
      .map((entry: any) => {
        const achievementId = `mission:${entry.missionId || entry.achievementId}`;
        const claim = achievements.find(
          (item: any) => item.achievementId === achievementId,
        );
        return {
          ...entry,
          achievementId,
          progress: claim?.metadata?.progress ?? 0,
          claimed: Boolean(claim?.metadata?.claimed),
        };
      });

    const activeAchievements = (
      missionCatalog.length > 0
        ? missionCatalog
        : DEFAULT_MISSIONS.map((mission) => ({ ...mission, active: true }))
    )
      .filter(
        (entry: any) =>
          (entry.criteria?.kind || "achievement") === "achievement",
      )
      .map((entry: any) => ({
        ...entry,
        unlocked: unlocked.has(entry.achievementId),
      }));

    const coinEarned = commentEvents
      .filter(
        (event: any) =>
          event.metadata?.currency === "lemonCoins" &&
          Number(event.amount || 0) > 0,
      )
      .reduce((sum: number, event: any) => sum + Number(event.amount || 0), 0);
    const coinSpent = commentEvents
      .filter(
        (event: any) =>
          event.metadata?.currency === "lemonCoins" &&
          Number(event.amount || 0) < 0,
      )
      .reduce(
        (sum: number, event: any) => sum + Math.abs(Number(event.amount || 0)),
        0,
      );

    return {
      userId: user._id,
      balance: currencies?.lemonCoins || 0,
      streak: streak || {
        userId: user._id,
        currentStreak: 0,
        longestStreak: 0,
        protectedUntil: null,
        insuranceUses: 0,
      },
      marketplace: marketplace
        .filter((reward: any) => (reward.quantity || 0) > 0)
        .map((reward: any) => ({
          ...reward,
          priceCoins: getRewardPrice(reward),
          fulfillmentMode: getRewardFulfillment(reward),
          active: isRewardActive(reward),
        })),
      mysteryPool: mysteryPool.map((reward: any) => ({
        ...reward,
        priceCoins: getRewardPrice(reward),
        fulfillmentMode: getRewardFulfillment(reward),
      })),
      missions,
      achievements: activeAchievements,
      recentRedemptions: redemptions,
      totals: {
        earned: coinEarned,
        spent: coinSpent,
      },
    };
  },
});

export const recordEngagement = mutation({
  args: {
    firebaseUid: v.string(),
    sessionId: v.string(),
    storyId: v.optional(v.string()),
    chapterId: v.optional(v.string()),
    contentType: v.optional(
      v.union(v.literal("manga"), v.literal("novel"), v.literal("movie")),
    ),
    durationMs: v.number(),
    completionPct: v.number(),
    scrollCompletionPct: v.optional(v.number()),
    returningVisit: v.boolean(),
    timestamp: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) {
      throw new Error("User not found for engagement recording.");
    }

    const durationMins = args.durationMs / 60000;
    const counted =
      args.completionPct >= 80 ||
      (args.scrollCompletionPct ? args.scrollCompletionPct >= 80 : false) ||
      durationMins >= 1;

    const existing = await ctx.db
      .query("engagementEvents")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .take(1);

    const sessionQuality = Math.min(
      100,
      Math.round((args.completionPct + (args.scrollCompletionPct || 0)) / 2),
    );

    let eventId = existing[0]?._id;
    let previousCounted = Boolean(existing[0]?.counted);

    if (existing[0]) {
      await ctx.db.patch(existing[0]._id, {
        storyId: args.storyId,
        chapterId: args.chapterId,
        contentType: args.contentType,
        durationMs: args.durationMs,
        completionPct: args.completionPct,
        scrollCompletionPct: args.scrollCompletionPct,
        sessionQuality,
        returningVisit: args.returningVisit,
        counted,
        timestamp: args.timestamp,
        metadata: args.metadata,
      });
    } else {
      eventId = await ctx.db.insert("engagementEvents", {
        userId: user._id,
        sessionId: args.sessionId,
        storyId: args.storyId,
        chapterId: args.chapterId,
        contentType: args.contentType,
        durationMs: args.durationMs,
        completionPct: args.completionPct,
        scrollCompletionPct: args.scrollCompletionPct,
        sessionQuality,
        returningVisit: args.returningVisit,
        counted,
        timestamp: args.timestamp,
        metadata: args.metadata,
      });
    }

    let coinsAwarded = 0;
    let rewardMessage = "";
    const unlocks: string[] = [];

    if (counted && !previousCounted) {
      const baseCoins = Math.max(1, Math.min(10, Math.floor(durationMins)));
      const completionBonus =
        args.completionPct >= 95 ? 5 : args.completionPct >= 80 ? 2 : 0;
      const chapterBonus = args.chapterId ? 1 : 0;
      const totalCoins = baseCoins + completionBonus + chapterBonus;
      const coinResult = await creditCoins(
        ctx,
        user._id,
        totalCoins,
        "reading_reward",
        args.storyId || args.chapterId || args.sessionId,
        {
          storyId: args.storyId,
          chapterId: args.chapterId,
          sessionId: args.sessionId,
          completionPct: args.completionPct,
          durationMins,
        },
      );
      coinsAwarded += totalCoins;
      rewardMessage = `🍋 You discovered ${totalCoins} Lemon Coins.`;

      const streakResult = await updateStreak(ctx, user._id, true);
      if (streakResult.bonus?.amount) {
        coinsAwarded += streakResult.bonus.amount;
        rewardMessage = `🎉 Reading Streak Bonus: +${streakResult.bonus.amount} Lemon Coins`;
      }

      const hidden = await awardHiddenReward(
        ctx,
        user._id,
        args.storyId || args.chapterId || args.sessionId,
      );
      if (hidden?.amount) {
        coinsAwarded += hidden.amount;
        rewardMessage = `✨ Hidden reward found: +${hidden.amount} Lemon Coins`;
      }

      const readProgress = await maybeUnlockCatalogItems(ctx, user._id, {
        kind: "achievement",
        metric: "countedReads",
        progress: 1,
      });
      if (readProgress.length)
        unlocks.push(...readProgress.map((item) => item.id));

      if (args.completionPct >= 95) {
        const storyProgress = await maybeUnlockCatalogItems(ctx, user._id, {
          kind: "achievement",
          metric: "completedStories",
          progress: 1,
        });
        if (storyProgress.length)
          unlocks.push(...storyProgress.map((item) => item.id));
      }
    }

    if (counted && previousCounted) {
      const streakUpdate = await updateStreak(ctx, user._id, true);
      if (streakUpdate.bonus?.amount) {
        coinsAwarded += streakUpdate.bonus.amount;
        rewardMessage = `🎉 Reading Streak Bonus: +${streakUpdate.bonus.amount} Lemon Coins`;
      }
    }

    await maybeUnlockCatalogItems(ctx, user._id, {
      kind: "achievement",
      metric: "readMinutes",
      progress: Math.floor(durationMins),
    });

    return {
      recorded: true,
      eventId,
      counted,
      coinsAwarded,
      rewardMessage,
      unlocks,
      balance: (await getCurrencies(ctx, user._id))?.lemonCoins || 0,
      sessionQuality,
      previousCounted,
    };
  },
});

export const eligibleForWeeklySpin = query({
  args: {
    firebaseUid: v.string(),
    weekStart: v.string(),
    requiredReads: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) return { eligible: false, reason: "user_not_found" };

    const required = args.requiredReads || 5;
    const weekStartTs = Date.parse(args.weekStart);
    const weekEndTs = weekStartTs + 7 * 24 * 60 * 60 * 1000;

    const engagements = await ctx.db
      .query("engagementEvents")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .take(200);
    const counted = engagements.filter((event: any) => {
      const ts = Date.parse(event.timestamp || "1970-01-01");
      return event.counted && ts >= weekStartTs && ts < weekEndTs;
    });

    const commentEvents = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .take(200);
    const meaningfulComments = commentEvents.filter((event: any) => {
      const ts = Date.parse(event.timestamp || "1970-01-01");
      return (
        ts >= weekStartTs &&
        ts < weekEndTs &&
        event.reason === "comment_reward" &&
        Boolean(event.metadata?.meaningful)
      );
    }).length;

    const currentStreak = (await getStreak(ctx, user._id))?.currentStreak || 0;

    return {
      eligible: counted.length >= required,
      counted: counted.length,
      required,
      meaningfulComments,
      currentStreak,
      milestoneReached: STREAK_MILESTONES.includes(currentStreak),
    };
  },
});

export const performWeeklySpin = mutation({
  args: { firebaseUid: v.string(), weekStart: v.string() },
  handler: async (ctx, args) => {
    const result: any = await ctx.runMutation(api.gamification.openMysteryBox, {
      firebaseUid: args.firebaseUid,
      rewardId: undefined,
      quantity: 1,
      source: args.weekStart,
    });
    return result;
  },
});

export const openMysteryBox = mutation({
  args: {
    firebaseUid: v.string(),
    rewardId: v.optional(v.string()),
    quantity: v.optional(v.number()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) throw new Error("User not found.");

    const boxes = await ctx.db
      .query("weeklySpinInventory")
      .withIndex("by_active", (q: any) => q.eq("active", true))
      .take(100);
    if (!boxes.length)
      throw new Error("No mystery box prize pool is configured.");

    const box = args.rewardId
      ? boxes.find((entry: any) => entry.rewardId === args.rewardId)
      : null;
    const pool = box ? [box] : boxes;
    const totalWeight = pool.reduce(
      (sum: number, entry: any) => sum + Number(entry.weight || 1),
      0,
    );
    let cursor = Math.random() * totalWeight;
    let chosen = pool[0];
    for (const entry of pool) {
      cursor -= Number(entry.weight || 1);
      if (cursor <= 0) {
        chosen = entry;
        break;
      }
    }

    const costCoins = Number(chosen?.amount || 0);
    if (costCoins > 0) {
      await spendCoins(
        ctx,
        user._id,
        costCoins,
        "mystery_box",
        chosen.rewardId,
        {
          rewardId: chosen.rewardId,
          quantity: args.quantity || 1,
        },
      );
    }

    const redemptionId = await ctx.db.insert("spinResults", {
      userId: user._id,
      weekStart: args.source || now(),
      rewardId: chosen.rewardId,
      rewardType: chosen.type,
      rewardValue: chosen.amount || null,
      awardedAt: now(),
      claimedAt:
        chosen.type === "lemon_coins" ||
        chosen.type === "premium" ||
        chosen.type === "badge"
          ? now()
          : undefined,
      status:
        chosen.type === "airtime" ||
        chosen.type === "data" ||
        chosen.type === "cash" ||
        chosen.type === "gift_card"
          ? "awarded"
          : "claimed",
      metadata: {
        ...chosen.metadata,
        boxCostCoins: costCoins,
        source: args.source || null,
      },
    });

    if (chosen.type === "lemon_coins" && chosen.amount) {
      await creditCoins(
        ctx,
        user._id,
        Number(chosen.amount),
        "mystery_box_bonus",
        chosen.rewardId,
        { rewardId: chosen.rewardId },
      );
    }

    if (chosen.type === "premium") {
      const durationDays = Number(chosen.metadata?.durationDays || 30);
      const startedAt = now();
      const renewsAt = new Date(
        Date.now() + durationDays * 24 * 60 * 60 * 1000,
      ).toISOString();
      await ctx.db.patch(user._id, {
        premiumStatus: "premium",
        premiumPlan: "premium",
        premiumStartedAt: startedAt,
        premiumRenewsAt: renewsAt,
        premiumProvider: "lemon-coins",
        premiumReference: `box:${chosen.rewardId}`,
        updatedAt: now(),
      });
    }

    if (chosen.type === "badge" && chosen.metadata?.badgeId) {
      if (!(user.badges || []).includes(chosen.metadata.badgeId)) {
        await ctx.db.patch(user._id, {
          badges: [...(user.badges || []), chosen.metadata.badgeId],
          updatedAt: now(),
        });
      }
    }

    return {
      redemptionId,
      reward: {
        type: chosen.type,
        amount: chosen.amount,
        rewardId: chosen.rewardId,
        metadata: chosen.metadata,
      },
    };
  },
});

export const listMissionCatalog = query({
  args: {},
  handler: async (ctx) => {
    const missions = await ctx.db
      .query("achievementsCatalog")
      .withIndex("by_active", (q: any) => q.eq("active", true))
      .take(100);
    return missions.filter(
      (mission: any) => (mission.criteria?.kind || "mission") === "mission",
    );
  },
});

export const listAchievementCatalog = query({
  args: {},
  handler: async (ctx) => {
    const catalog = await ctx.db
      .query("achievementsCatalog")
      .withIndex("by_active", (q: any) => q.eq("active", true))
      .take(100);
    return catalog.filter(
      (item: any) => (item.criteria?.kind || "achievement") !== "mission",
    );
  },
});

export const claimMission = mutation({
  args: { firebaseUid: v.string(), missionId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) throw new Error("User not found.");

    const missionCatalog = await ctx.db
      .query("achievementsCatalog")
      .withIndex("by_active", (q: any) => q.eq("active", true))
      .take(100);
    const mission = missionCatalog.find(
      (entry: any) =>
        entry.achievementId === args.missionId ||
        entry.missionId === args.missionId,
    );
    const resolvedMission =
      mission ||
      DEFAULT_MISSIONS.find((entry) => entry.missionId === args.missionId);
    if (!resolvedMission) throw new Error("Mission not found.");

    const result = await claimMissionReward(ctx, user._id, resolvedMission);
    return { ...result, missionId: args.missionId };
  },
});

export const listRewardMarketplace = query({
  args: {},
  handler: async (ctx) => {
    const rewards = await ctx.db.query("rewardInventory").take(100);
    return rewards
      .filter((reward: any) => (reward.quantity || 0) > 0)
      .map((reward: any) => ({
        ...reward,
        priceCoins: getRewardPrice(reward),
        fulfillmentMode: getRewardFulfillment(reward),
        active: isRewardActive(reward),
      }));
  },
});

export const redeemMarketplaceReward = mutation({
  args: {
    firebaseUid: v.string(),
    rewardId: v.string(),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) throw new Error("User not found.");

    const reward = await ctx.db
      .query("rewardInventory")
      .withIndex("by_rewardId", (q: any) => q.eq("rewardId", args.rewardId))
      .unique();

    if (!reward) throw new Error("Reward not found.");

    const priceCoins = getRewardPrice(reward);
    const fulfillmentMode = getRewardFulfillment(reward);
    const quantity = Math.max(1, args.quantity || 1);

    if ((reward.quantity || 0) - (reward.reserved || 0) < quantity) {
      throw new Error("This reward is out of stock.");
    }

    await spendCoins(
      ctx,
      user._id,
      priceCoins * quantity,
      "marketplace_redemption",
      reward.rewardId,
      {
        rewardId: reward.rewardId,
        quantity,
        fulfillmentMode,
      },
    );

    const remaining = (reward.quantity || 0) - quantity;
    const reserved = (reward.reserved || 0) + quantity;
    await ctx.db.patch(reward._id, {
      quantity: remaining,
      reserved,
      updatedAt: now(),
    });

    const redemptionStatus =
      fulfillmentMode === "automatic" ? "claimed" : "awarded";
    const redemptionId = await ctx.db.insert("spinResults", {
      userId: user._id,
      weekStart: `redeem:${now()}`,
      rewardId: reward.rewardId,
      rewardType: reward.type,
      rewardValue: reward.metadata || null,
      awardedAt: now(),
      claimedAt: fulfillmentMode === "automatic" ? now() : undefined,
      status: redemptionStatus,
      metadata: {
        ...reward.metadata,
        quantity,
        priceCoins,
        fulfillmentMode,
        marketplace: true,
      },
    });

    if (fulfillmentMode === "automatic") {
      if (reward.type === "premium") {
        const durationDays = Number(reward.metadata?.durationDays || 30);
        const startedAt = now();
        const renewsAt = new Date(
          Date.now() + durationDays * 24 * 60 * 60 * 1000,
        ).toISOString();
        await ctx.db.patch(user._id, {
          premiumStatus: "premium",
          premiumPlan: reward.metadata?.planType || "premium",
          premiumStartedAt: startedAt,
          premiumRenewsAt: renewsAt,
          premiumProvider: "marketplace",
          premiumReference: reward.rewardId,
          updatedAt: now(),
        });
      }

      if (
        reward.type === "badge" &&
        reward.metadata?.badgeId &&
        !(user.badges || []).includes(reward.metadata.badgeId)
      ) {
        await ctx.db.patch(user._id, {
          badges: [...(user.badges || []), reward.metadata.badgeId],
          updatedAt: now(),
        });
      }

      const bonusCoins = Number(
        reward.metadata?.amount ||
          reward.metadata?.bonusCoins ||
          reward.metadata?.coinAmount ||
          0,
      );
      if (reward.type === "lemon_coins" && bonusCoins > 0) {
        await creditCoins(
          ctx,
          user._id,
          bonusCoins,
          "marketplace_bonus",
          reward.rewardId,
          { rewardId: reward.rewardId },
        );
      }
    }

    return {
      redemptionId,
      status: redemptionStatus,
      remainingBalance: (await getCurrencies(ctx, user._id))?.lemonCoins || 0,
      reward: {
        rewardId: reward.rewardId,
        type: reward.type,
        priceCoins,
        fulfillmentMode,
      },
    };
  },
});

export const listRedemptionHistory = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) return [];

    const redemptions = await ctx.db
      .query("spinResults")
      .withIndex("by_user_week", (q: any) => q.eq("userId", user._id))
      .take(100);
    return redemptions.sort((a: any, b: any) =>
      b.awardedAt.localeCompare(a.awardedAt),
    );
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
      claimedAt: now(),
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

    const reward = await ctx.db
      .query("rewardInventory")
      .withIndex("by_rewardId", (q: any) =>
        q.eq("rewardId", redemption.rewardId || ""),
      )
      .unique();

    if (reward) {
      await ctx.db.patch(reward._id, {
        quantity: (reward.quantity || 0) + 1,
        reserved: Math.max(0, (reward.reserved || 0) - 1),
        updatedAt: now(),
      });
    }

    await ctx.db.patch(redemption._id, {
      status: "expired",
      metadata: {
        ...(redemption.metadata || {}),
        rejectedBy: args.adminEmail || null,
        rejectionReason: args.reason || null,
      },
    });

    if (Number(redemption.metadata?.priceCoins || 0) > 0) {
      await creditCoins(
        ctx,
        redemption.userId,
        Number(redemption.metadata.priceCoins),
        "redemption_refund",
        String(redemption.rewardId),
        {
          redemptionId: String(redemption._id),
          reason: args.reason || "rejected",
        },
      );
    }

    return redemption._id;
  },
});

export const useStreakInsurance = mutation({
  args: { firebaseUid: v.string(), days: v.number() },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) throw new Error("User not found for streak insurance.");

    const currencies = await getCurrencies(ctx, user._id);
    const costPerDay = 5;
    const totalCost = costPerDay * args.days;

    if (!currencies || currencies.lemonCoins < totalCost) {
      throw new Error("Insufficient Lemon Coins for streak insurance.");
    }

    await spendCoins(
      ctx,
      user._id,
      totalCost,
      "streak_insurance",
      `streak:${args.days}`,
      { days: args.days },
    );

    const streak = await getStreak(ctx, user._id);
    const nowDate = new Date();
    const currentProtectedUntil = streak?.protectedUntil
      ? Date.parse(streak.protectedUntil)
      : 0;
    const extendUntil = new Date(
      Math.max(nowDate.getTime(), currentProtectedUntil) +
        args.days * 24 * 60 * 60 * 1000,
    ).toISOString();

    if (streak) {
      await ctx.db.patch(streak._id, {
        protectedUntil: extendUntil,
        updatedAt: now(),
      });
    } else {
      await ctx.db.insert("userStreaks", {
        userId: user._id,
        currentStreak: 0,
        lastActiveAt: now(),
        longestStreak: 0,
        protectedUntil: extendUntil,
        insuranceUses: 1,
        updatedAt: now(),
      });
    }

    return { success: true, protectedUntil: extendUntil };
  },
});

export const getUserStreak = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) return null;

    const streak = await getStreak(ctx, user._id);
    return (
      streak || {
        userId: user._id,
        currentStreak: 0,
        longestStreak: 0,
        protectedUntil: null,
      }
    );
  },
});

export const getUserCurrencies = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) return null;

    const currencies = await getCurrencies(ctx, user._id);
    return currencies || { userId: user._id, lemonCoins: 0, goldenInk: 0 };
  },
});

export const resetAllGamificationData = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "userCurrencies",
      "userStreaks",
      "spinResults",
      "engagementEvents",
      "xpEvents",
      "userAchievements",
    ];

    for (const table of tables) {
      const docs = await ctx.db.query(table).take(1000);
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    return { success: true, tablesCleared: tables };
  },
});
