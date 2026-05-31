import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAILY_LOGIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const LOW_QUALITY_PATTERNS = [
  /^\s*(nice|cool|nice\s*one|first|wow|good\s*chapter|great\s*chap|thanks|tnx|lol|omg)\s*$/i,
];
const MIN_COMMENT_LENGTH = 20;

const classifyCommentQuality = (message: string) => {
  const trimmed = message.trim();
  if (trimmed.length < MIN_COMMENT_LENGTH) return "low";
  if (LOW_QUALITY_PATTERNS.some((pattern) => pattern.test(trimmed))) return "low";
  return "high";
};

const getBaseReward = (type: string) => {
  const map: Record<string, number> = {
    chapter_read: 2,
    chapter_finish: 3,
    story_complete: 15,
    daily_login: 5,
    comment_high: 5,
    comment_like: 1,
    achievement_unlock: 10,
  };
  return map[type] ?? 0;
};

const deltaForType = (type: string) => {
  switch (type) {
    case "earn":
      return 1;
    case "spend":
      return -1;
    case "bonus":
      return 1;
    case "admin_adjustment":
      return 0;
    default:
      return 0;
  }
};

// ---- Reading Rewards ----

export const recordChapterRead = mutation({
  args: {
    firebaseUid: v.string(),
    storyId: v.string(),
    chapterId: v.string(),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) throw new Error("User not found");

    const key = `${args.storyId}-${args.chapterId}`;
    const already = (user.unlockedChapters || []).includes(key);
    await ctx.db.patch(user._id, {
      unlockedChapters: [...(user.unlockedChapters || []), key],
      updatedAt: now(),
    });

    const amount = getBaseReward("chapter_read");
    const existingCurrency = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existingCurrency) {
      await ctx.db.patch(existingCurrency._id, {
        lemonCoins: existingCurrency.lemonCoins + amount,
        updatedAt: now(),
      });
    } else {
      await ctx.db.insert("userCurrencies", {
        userId: user._id,
        lemonCoins: amount,
        goldenInk: 0,
        updatedAt: now(),
      });
    }

    await ctx.db.insert("coinTransactions", {
      userId: user._id,
      type: "earn",
      source: "reading",
      amount,
      description: `Read chapter ${args.title}`,
      metadata: { storyId: args.storyId, chapterId: args.chapterId, title: args.title },
      timestamp: now(),
    });

    await ctx.runMutation(internal.gamification.checkAndAwardAchievement, {
      userId: user._id,
      firebaseUid: args.firebaseUid,
      achievementId: "new_reader",
    });

    await ctx.runMutation(internal.gamification.checkAndAwardAchievement, {
      userId: user._id,
      firebaseUid: args.firebaseUid,
      achievementId: "bookworm",
    });

    return { awarded: true, amount };
  },
});

export const tryUnlockHiddenReward = mutation({
  args: {
    firebaseUid: v.string(),
    contentId: v.string(),
    contentType: v.union(v.literal("chapter"), v.literal("story")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) throw new Error("User not found");

    const candidates = await ctx.db
      .query("hiddenRewards")
      .withIndex("by_content", (q) => q.eq("contentType", args.contentType).eq("contentId", args.contentId))
      .collect();

    const active = candidates.filter((c) => c.active && c.rewardType !== "mystery_box_key");
    if (active.length === 0) return { found: false };

    const totalWeight = active.reduce((sum, item) => sum + (item.weight || 1), 0);
    const roll = Math.random() * totalWeight;
    let chosen = active[0];
    let accum = 0;
    for (const item of active) {
      accum += item.weight || 1;
      if (roll <= accum) {
        chosen = item;
        break;
      }
    }

    const existingCurrency = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (chosen.rewardType === "lemon_coins") {
      const amount = Number(chosen.amount || 1);
      const delta = deltaForType("earn");
      if (existingCurrency) {
        await ctx.db.patch(existingCurrency._id, {
          lemonCoins: existingCurrency.lemonCoins + amount,
          updatedAt: now(),
        });
      } else {
        await ctx.db.insert("userCurrencies", {
          userId: user._id,
          lemonCoins: amount,
          goldenInk: 0,
          updatedAt: now(),
        });
      }
      await ctx.db.insert("coinTransactions", {
        userId: user._id,
        type: "bonus",
        source: "reading",
        amount,
        description: `Hidden reward: ${chosen.rewardId}`,
        metadata: { contentId: args.contentId, contentType: args.contentType },
        timestamp: now(),
      });
      return { found: true, type: "lemon_coins", amount };
    }

    if (chosen.rewardType === "golden_ink") {
      const amount = Number(chosen.amount || 1);
      if (existingCurrency) {
        await ctx.db.patch(existingCurrency._id, {
          goldenInk: existingCurrency.goldenInk + amount,
          updatedAt: now(),
        });
      } else {
        await ctx.db.insert("userCurrencies", {
          userId: user._id,
          lemonCoins: 0,
          goldenInk: amount,
          updatedAt: now(),
        });
      }
      return { found: true, type: "golden_in", amount };
    }

    if (chosen.rewardType === "xp") {
      const amount = Number(chosen.amount || 1);
      const currentXp = Number(user.xp || 0);
      await ctx.db.patch(user._id, { xp: currentXp + amount, updatedAt: now() });
      return { found: true, type: "xp", amount };
    }

    if (chosen.rewardType === "badge" && chosen.metadata?.badgeId) {
      const newBadges = [...(user.badges || []), chosen.metadata.badgeId];
      await ctx.db.patch(user._id, { badges: newBadges, updatedAt: now() });
      return { found: true, type: "badge", badgeId: chosen.metadata.badgeId };
    }

    return { found: false };
  },
});

// ---- Comment Rewards ----

export const rewardComment = mutation({
  args: {
    commentId: v.string(),
    message: v.string(),
    authorId: v.string(),
    storyId: v.string(),
    chapterId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const quality = classifyCommentQuality(args.message);
    if (quality === "low") return { awarded: false, reason: "low_quality" };

    const user = await ctx.db.get(args.authorId);
    if (!user || !args.authorId) return { awarded: false, reason: "author_not_found" };

    const existing = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", args.authorId))
      .unique();

    const amount = getBaseReward("comment_high");
    if (existing) {
      await ctx.db.patch(existing._id, {
        lemonCoins: existing.lemonCoins + amount,
        updatedAt: now(),
      });
    } else {
      await ctx.db.insert("userCurrencies", {
        userId: args.authorId,
        lemonCoins: amount,
        goldenInk: 0,
        updatedAt: now(),
      });
    }

    await ctx.db.insert("coinTransactions", {
      userId: args.authorId,
      type: "earn",
      source: "comment",
      amount,
      description: "High-quality comment",
      metadata: { commentId: args.commentId, storyId: args.storyId, chapterId: args.chapterId },
      timestamp: now(),
    });

    return { awarded: true, amount };
  },
});

export const rewardCommentLikes = mutation({
  args: {
    commentId: v.string(),
    authorId: v.string(),
    likesCount: v.number(),
  },
  handler: async (ctx, args) => {
    const milestone = [1, 5, 10, 25, 50].includes(args.likesCount);
    if (!milestone) return { awarded: false };

    const existing = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", args.authorId))
      .unique();

    const amount = getBaseReward("comment_like");
    if (existing) {
      await ctx.db.patch(existing._id, {
        lemonCoins: existing.lemonCoins + amount,
        updatedAt: now(),
      });
    } else {
      await ctx.db.insert("userCurrencies", {
        userId: args.authorId,
        lemonCoins: amount,
        goldenInk: 0,
        updatedAt: now(),
      });
    }

    await ctx.db.insert("coinTransactions", {
      userId: args.authorId,
      type: "earn",
      source: "comment",
      amount,
      description: "Comment received engagement",
      metadata: { commentId: args.commentId, likesCount: args.likesCount },
      timestamp: now(),
    });

    return { awarded: true, amount };
  },
});

// ---- Daily Login / Streak ----

export const recordDailyLogin = mutation({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("userStreaks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const today = new Date();
    const todayISO = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const lastActiveISO = existing?.lastActiveAt
      ? new Date(new Date(existing.lastActiveAt).getFullYear(), new Date(existing.lastActiveAt).getMonth(), new Date(existing.lastActiveAt).getDate()).toISOString()
      : null;

    if (lastActiveISO === todayISO) return { alreadyLoggedIn: true };

    let currentStreak = existing?.currentStreak || 0;
    let longestStreak = existing?.longestStreak || 0;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();

    if (lastActiveISO === yesterdayISO) {
      currentStreak += 1;
    } else if (lastActiveISO !== todayISO) {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;

    const bonus = 5;
    const streakBonus = [3, 7, 14, 30].includes(currentStreak) ? 10 : 0;
    const totalReward = bonus + streakBonus;

    const currency = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (currency) {
      await ctx.db.patch(currency._id, {
        lemonCoins: currency.lemonCoins + totalReward,
        updatedAt: now(),
      });
    } else {
      await ctx.db.insert("userCurrencies", {
        userId: user._id,
        lemonCoins: totalReward,
        goldenInk: 0,
        updatedAt: now(),
      });
    }

    await ctx.db.insert("coinTransactions", {
      userId: user._id,
      type: streakBonus > 0 ? "bonus" : "earn",
      source: "daily_login",
      amount: totalReward,
      description: streakBonus > 0 ? `Day ${currentStreak} streak bonus` : "Daily login",
      timestamp: now(),
    });

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentStreak,
        longestStreak,
        lastActiveAt: todayISO,
        updatedAt: now(),
      });
    } else {
      await ctx.db.insert("userStreaks", {
        userId: user._id,
        currentStreak,
        lastActiveAt: todayISO,
        longestStreak,
        updatedAt: now(),
      });
    }

    await ctx.runMutation(internal.gamification.checkAndAwardAchievement, {
      userId: user._id,
      firebaseUid: args.firebaseUid,
      achievementId: "new_reader",
    });

    await ctx.runMutation(internal.gamification.checkAndAwardAchievement, {
      userId: user._id,
      firebaseUid: args.firebaseUid,
      achievementId: "bookworm",
    });

    return { currentStreak, totalReward, streakBonus };
  },
});

export const useStreakInsurance = mutation({
  args: { firebaseUid: v.string(), days: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) throw new Error("User not found for streak insurance.");

    const currencies = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const costPerDay = 5;
    const totalCost = costPerDay * args.days;

    if (!currencies || currencies.lemonCoins < totalCost) {
      throw new Error("Insufficient Lemon Coins for streak insurance.");
    }

    await ctx.db.patch(currencies._id, {
      lemonCoins: currencies.lemonCoins - totalCost,
      updatedAt: now(),
    });

    await ctx.db.insert("coinTransactions", {
      userId: user._id,
      type: "spend",
      source: "streak",
      amount: totalCost,
      description: "Streak insurance purchase",
      metadata: { days: args.days },
      timestamp: now(),
    });

    const streak = await ctx.db
      .query("userStreaks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const nowDate = new Date();
    const currentProtectedUntil = streak?.protectedUntil ? Date.parse(streak.protectedUntil) : 0;
    const extendUntil = new Date(Math.max(nowDate.getTime(), currentProtectedUntil) + args.days * 24 * 60 * 60 * 1000).toISOString();

    if (streak) {
      await ctx.db.patch(streak._id, { protectedUntil: extendUntil, updatedAt: now() });
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

// ---- Achievements ----

export const checkAndAwardAchievement = internalMutation({
  args: { userId: v.string(), firebaseUid: v.string(), achievementId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
      .then((arr) => arr.find((a) => a.achievementId === args.achievementId));

    if (existing) return { alreadyAwarded: true };

    const achievement = await ctx.db
      .query("achievementsCatalog")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect()
      .then((arr) => arr.find((a) => a.achievementId === args.achievementId));

    if (!achievement) return { notFound: true };

    await ctx.db.insert("userAchievements", {
      userId: args.userId,
      achievementId: args.achievementId,
      awardedAt: now(),
      metadata: { name: achievement.name },
    });

    const user = await ctx.db.get(args.userId);
    if (!user) return { awarded: true };

    const currency = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (achievement.coinReward) {
      if (currency) {
        await ctx.db.patch(currency._id, {
          lemonCoins: currency.lemonCoins + achievement.coinReward,
          updatedAt: now(),
        });
      } else {
        await ctx.db.insert("userCurrencies", {
          userId: args.userId,
          lemonCoins: achievement.coinReward,
          goldenInk: 0,
          updatedAt: now(),
        });
      }
      await ctx.db.insert("coinTransactions", {
        userId: args.userId,
        type: "earn",
        source: "achievement",
        amount: achievement.coinReward,
        description: `Achievement: ${achievement.name}`,
        metadata: { achievementId: args.achievementId },
        timestamp: now(),
      });
    }

    if (achievement.xpReward) {
      const currentXp = Number(user.xp || 0);
      await ctx.db.patch(args.userId, { xp: currentXp + achievement.xpReward, updatedAt: now() });
    }

    if (achievement.badgeId && !(user.badges || []).includes(achievement.badgeId)) {
      await ctx.db.patch(args.userId, {
        badges: [...(user.badges || []), achievement.badgeId],
        updatedAt: now(),
      });
    }

    return { awarded: true };
  },
});

// ---- Queries ----

export const getUserCurrencies = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) return null;

    const currencies = await ctx.db
      .query("userCurrencies")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return currencies || { userId: user._id, lemonCoins: 0, goldenInk: 0 };
  },
});

export const getUserStreak = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) return null;

    const streak = await ctx.db
      .query("userStreaks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return streak || {
      userId: user._id,
      currentStreak: 0,
      longestStreak: 0,
      protectedUntil: null,
    };
  },
});

export const getActiveMarketplaceRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("marketplaceRewards")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const listMarketplaceRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("marketplaceRewards").collect();
  },
});

export const listUserRedemptions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rewardRedemptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const listAllRedemptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rewardRedemptions").order("desc").collect();
  },
});

export const getUserActiveMissions = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) return [];

    const allUserMissions = await ctx.db
      .query("userMissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const active = allUserMissions.filter((m) => m.status === "in_progress");
    if (active.length > 0) return active;

    const activeCatalog = await ctx.db
      .query("missionsCatalog")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    return activeCatalog.map((mission) => ({
      missionId: mission.missionId,
      title: mission.title,
      description: mission.description,
      target: mission.target,
      coinReward: mission.coinReward,
      period: mission.period,
      progress: 0,
      status: "in_progress" as const,
      periodKey: mission.period === "daily" ? new Date().toISOString().slice(0, 10) : "",
    }));
  },
});

export const getUserCompletedMissions = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("userMissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()
      .then((missions) => missions.filter((m) => m.status === "completed" || m.status === "claimed"));
  },
});

export const getUserAchievements = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) return [];

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const result = [];
    for (const ua of userAchievements) {
      const catalog = await ctx.db.get(ua._id);
      if (!catalog) {
        const full = await ctx.db.get(ua._id);
        if (full) {
          result.push({ ...full, userAchievementId: ua._id, awardedAt: ua.awardedAt });
        }
      }
    }

    return result;
  },
});

export const getActiveAchievements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("achievementsCatalog")
      .withIndex("by_active", (q) => q.eq("active, true"))
      .collect();
  },
});

export const getActiveMissions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("missionsCatalog")
      .withIndex("by_active", (q) => q.eq("active, true"))
      .collect();
  },
});

export const getActiveHiddenRewards = query({
  args: { contentType: v.optional(v.string()), contentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.contentType && args.contentId) {
      return await ctx.db
        .query("hiddenRewards")
        .withIndex("by_content", (q) => q.eq("contentType", args.contentType as any).eq("contentId", args.contentId as any))
        .collect()
        .then((items) => items.filter((i) => i.active));
    }
    return await ctx.db
      .query("hiddenRewards")
      .collect()
      .then((items) => items.filter((i) => i.active));
  },
});

export const getSpinInventory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("weeklySpinInventory")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const getUserStreakLegacy = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) return null;

    const streak = await ctx.db
      .query("userStreaks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return streak || {
      userId: user._id,
      currentStreak: 0,
      longestStreak: 0,
      protectedUntil: null,
    };
  },
});

export const eligibleForWeeklySpin = query({
  args: { firebaseUid: v.string(), weekStart: v.string(), requiredReads: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const required = args.requiredReads || 10;
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) return { eligible: false, reason: "user_not_found" };

    const events = await ctx.db
      .query("engagementEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const weekStartTs = Date.parse(args.weekStart);
    const weekEndTs = weekStartTs + 7 * 24 * 60 * 60 * 1000;
    const counted = events.filter((e) => {
      const t = Date.parse(e.timestamp);
      return e.counted && t >= weekStartTs && t < weekEndTs;
    }).length;

    return { eligible: counted >= required, counted, required };
  },
});

export const performWeeklySpin = mutation({
  args: { firebaseUid: v.string(), weekStart: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) throw new Error("User not found for spin.");

    const events = await ctx.db
      .query("engagementEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const required = 10;
    const weekStartTs = Date.parse(args.weekStart);
    const weekEndTs = weekStartTs + 7 * 24 * 60 * 60 * 1000;
    const counted = events.filter((e) => {
      const t = Date.parse(e.timestamp);
      return e.counted && t >= weekStartTs && t < weekEndTs;
    }).length;

    if (counted < required) {
      throw new Error(`Not eligible for weekly spin: ${counted}/${required}`);
    }

    const inventory = await ctx.db
      .query("weeklySpinInventory")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    if (!inventory.length) throw new Error("No active spin inventory configured.");

    const totalWeight = inventory.reduce((s, it) => s + (it.weight || 1), 0);
    let r = Math.random() * totalWeight;
    let chosen = inventory[0];
    for (const it of inventory) {
      r -= it.weight || 1;
      if (r <= 0) {
        chosen = it;
        break;
      }
    }

    const spinId = await ctx.db.insert("spinResults", {
      userId: user._id,
      weekStart: args.weekStart,
      rewardId: chosen.rewardId,
      rewardType: chosen.type,
      rewardValue: chosen.amount || null,
      awardedAt: new Date().toISOString(),
      status: "awarded",
      metadata: chosen.metadata || {},
    });

    if (chosen.type === "lemon_coins" && chosen.amount) {
      const existing = await ctx.db
        .query("userCurrencies")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          lemonCoins: existing.lemonCoins + Number(chosen.amount),
          updatedAt: new Date().toISOString(),
        });
      } else {
        await ctx.db.insert("userCurrencies", {
          userId: user._id,
          lemonCoins: Number(chosen.amount),
          goldenInk: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      await ctx.db.insert("coinTransactions", {
        userId: user._id,
        type: "bonus",
        source: "reading",
        amount: Number(chosen.amount),
        description: "Weekly spin reward",
        metadata: { spinId },
        timestamp: new Date().toISOString(),
      });

      await ctx.db.patch(spinId, { status: "claimed", claimedAt: new Date().toISOString() });
    }

    return { spinId, reward: { type: chosen.type, amount: chosen.amount, metadata: chosen.metadata } };
  },
});

export const recordEngagement = mutation({
  args: {
    firebaseUid: v.string(),
    sessionId: v.string(),
    storyId: v.optional(v.string()),
    chapterId: v.optional(v.string()),
    contentType: v.optional(v.union(v.literal("manga"), v.literal("novel"), v.literal("movie"))),
    durationMs: v.number(),
    completionPct: v.number(),
    scrollCompletionPct: v.optional(v.number()),
    returningVisit: v.boolean(),
    timestamp: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) {
      throw new Error("User not found for engagement recording.");
    }

    const durationMins = args.durationMs / 60000;
    const counted =
      args.completionPct >= 80 ||
      (args.scrollCompletionPct && args.scrollCompletionPct >= 80) ||
      durationMins >= 1;

    const sessionQuality = Math.min(100, Math.round((args.completionPct + (args.scrollCompletionPct || 0)) / 2));

    const eventId = await ctx.db.insert("engagementEvents", {
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

    if (counted) {
      const xp = Math.max(1, Math.floor(durationMins) + Math.floor(args.completionPct / 20));

      await ctx.db.insert("xpEvents", {
        userId: user._id,
        amount: xp,
        reason: "engagement",
        source: args.storyId || args.chapterId || "session",
        timestamp: new Date().toISOString(),
      });

      const currentXp = Number(user.xp || 0);
      const currentLevel = Number(user.level || 1);
      const newXp = currentXp + xp;
      let newLevel = currentLevel;
      const xpForNext = (lvl: number) => lvl * 1000;
      while (newXp >= xpForNext(newLevel + 1)) {
        newLevel += 1;
      }

      await ctx.db.patch(user._id, {
        xp: newXp,
        level: newLevel,
        updatedAt: new Date().toISOString(),
      });

      if (durationMins >= 2) {
        const amount = Math.min(10, Math.floor(durationMins));
        const existing = await ctx.db
          .query("userCurrencies")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique();

        if (existing) {
          await ctx.db.patch(existing._id, {
            lemonCoins: existing.lemonCoins + amount,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await ctx.db.insert("userCurrencies", {
            userId: user._id,
            lemonCoins: amount,
            goldenInk: 0,
            updatedAt: new Date().toISOString(),
          });
        }

        await ctx.db.insert("coinTransactions", {
          userId: user._id,
          type: "earn",
          source: "reading",
          amount,
          description: "Reading session reward",
          metadata: { eventId, storyId: args.storyId },
          timestamp: new Date().toISOString(),
        });
      }
    }

    return { recorded: true, eventId };
  },
});

export const getInactiveStreakUsers = internalQuery({
  args: { daysInactive: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.daysInactive * 24 * 60 * 60 * 1000;
    const allStreaks = await ctx.db.query("userStreaks").collect();
    const expired: { userId: string; streak: number }[] = [];

    for (const streak of allStreaks) {
      if (!streak.protectedUntil && streak.lastActiveAt && Date.parse(streak.lastActiveAt) < cutoff && streak.currentStreak > 1) {
        expired.push({ userId: streak.userId, streak: streak.currentStreak });
      }
    }

    return expired;
  },
});

export const decayUserStreak = internalMutation({
  args: { userId: v.string(), protectedUntil: v.optional(v.string()), lastActiveAt: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const nowTime = Date.now();
    const protectedUntil = args.protectedUntil ? Date.parse(args.protectedUntil) : 0;
    const lastActiveAt = args.lastActiveAt ? Date.parse(args.lastActiveAt) : 0;

    if (protectedUntil > nowTime || lastActiveAt === 0) return { decayed: false };

    const streak = await ctx.db
      .query("userStreaks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!streak || streak.currentStreak <= 1) return { decayed: false };

    await ctx.db.patch(streak._id, { currentStreak: 1, updatedAt: now() });
    return { decayed: true };
  },
});
