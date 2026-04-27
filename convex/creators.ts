import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("creators").collect();
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    userId: v.optional(v.string()),
    name: v.string(),
    username: v.string(),
    avatar: v.string(),
    bio: v.string(),
    category: v.union(v.literal("Artist"), v.literal("Writer"), v.literal("Studio")),
    location: v.optional(v.string()),
    dropsomethingUrl: v.optional(v.string()),
    supportEnabled: v.boolean(),
    profile: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    const timestamp = now();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: timestamp });
      return existing._id;
    }

    return await ctx.db.insert("creators", {
      ...args,
      followers: 0,
      totalReads: 0,
      totalStories: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const adjustFollowerCount = mutation({
  args: {
    username: v.string(),
    delta: v.number(),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!creator) return null;
    await ctx.db.patch(creator._id, {
      followers: Math.max(0, creator.followers + args.delta),
      updatedAt: now(),
    });
    return creator._id;
  },
});
