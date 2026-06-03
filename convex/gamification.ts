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
  // robust day-difference using UTC day starts to avoid edge cases
  const msPerDay = 24 * 60 * 60 * 1000;
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
  const diff = Math.round((currDay - prevDay) / msPerDay);
  return diff === 1;
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