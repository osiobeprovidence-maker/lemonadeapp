import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSpinInventory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("weeklySpinInventory")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
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
    // Simple heuristics to determine whether a read/view counts
    const counted =
      args.completionPct >= 80 ||
      (args.scrollCompletionPct && args.scrollCompletionPct >= 80) ||
      durationMins >= 1; // at least 1 minute

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

    // If counted, award a small XP and optional coins
    if (counted) {
      const xp = Math.max(1, Math.floor(durationMins) + Math.floor(args.completionPct / 20));

      await ctx.db.insert("xpEvents", {
        userId: user._id,
        amount: xp,
        reason: "engagement",
        source: args.storyId || args.chapterId || "session",
        timestamp: new Date().toISOString(),
      });

      // patch user xp and level using simple threshold (level * 1000)
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

      // Award a small amount of Lemon Coins periodically (e.g., short sessions)
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
      }
    }

    return { recorded: true, eventId };
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

    // count events within the weekStart (ISO string) and counted true
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

    // Check eligibility by manually checking engagement events
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

    // weighted random selection
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

    // immediate small application for coin rewards
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

      // mark claimed immediately for coin types
      await ctx.db.patch(spinId, { status: "claimed", claimedAt: new Date().toISOString() });
    }

    return { spinId, reward: { type: chosen.type, amount: chosen.amount, metadata: chosen.metadata } };
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

    const costPerDay = 5; // Lemon Coins per day of protection
    const totalCost = costPerDay * args.days;

    if (!currencies || currencies.lemonCoins < totalCost) {
      throw new Error("Insufficient Lemon Coins for streak insurance.");
    }

    // deduct coins and extend protection
    await ctx.db.patch(currencies._id, {
      lemonCoins: currencies.lemonCoins - totalCost,
      updatedAt: new Date().toISOString(),
    });

    const streak = await ctx.db
      .query("userStreaks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const now = new Date();
    const currentProtectedUntil = streak?.protectedUntil ? Date.parse(streak.protectedUntil) : 0;
    const extendUntil = new Date(Math.max(now.getTime(), currentProtectedUntil) + args.days * 24 * 60 * 60 * 1000).toISOString();

    if (streak) {
      await ctx.db.patch(streak._id, { protectedUntil: extendUntil, updatedAt: new Date().toISOString() });
    } else {
      await ctx.db.insert("userStreaks", {
        userId: user._id,
        currentStreak: 0,
        lastActiveAt: new Date().toISOString(),
        longestStreak: 0,
        protectedUntil: extendUntil,
        insuranceUses: 1,
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true, protectedUntil: extendUntil };
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
