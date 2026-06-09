import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

export const createQuest = mutation({
  args: {
    questId: v.string(),
    creatorId: v.string(),
    title: v.string(),
    description: v.string(),
    requirements: v.any(),
    rewards: v.any(),
    startsAt: v.string(),
    endsAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("creatorQuests", {
      questId: args.questId,
      creatorId: args.creatorId,
      title: args.title,
      description: args.description,
      requirements: args.requirements,
      rewards: args.rewards,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      active: true,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const listActiveQuests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("creatorQuests")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(200);
  },
});

export const claimQuest = mutation({
  args: {
    firebaseUid: v.string(),
    questId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) throw new Error("User not found");

    const quest = await ctx.db
      .query("creatorQuests")
      .take(200)
      .then((arr) => arr.find((q) => q.questId === args.questId));

    if (!quest) throw new Error("Quest not found");

    // Basic eligibility: check if not already claimed
    const already = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(200)
      .then((arr) => arr.find((a) => a.achievementId === `quest:${args.questId}`));

    if (already) throw new Error("Quest already claimed");

    // Award rewards (simple support for coins/xp)
    const rewards = quest.rewards || {};
    if (rewards.coins) {
      const cur = await ctx.db.query("userCurrencies").withIndex("by_userId", (q) => q.eq("userId", user._id)).unique();
      if (cur) {
        await ctx.db.patch(cur._id, { lemonCoins: cur.lemonCoins + Number(rewards.coins), updatedAt: now() });
      } else {
        await ctx.db.insert("userCurrencies", { userId: user._id, lemonCoins: Number(rewards.coins), goldenInk: 0, updatedAt: now() });
      }
    }

    if (rewards.xp) {
      await ctx.db.insert("xpEvents", { userId: user._id, amount: Number(rewards.xp), reason: "quest", source: quest.questId, timestamp: now() });
      const current = Number(user.xp || 0);
      const newXp = current + Number(rewards.xp);
      await ctx.db.patch(user._id, { xp: newXp, updatedAt: now() });
    }

    // mark as achievement
    await ctx.db.insert("userAchievements", { userId: user._id, achievementId: `quest:${quest.questId}`, awardedAt: now() });

    return { claimed: true };
  },
});
