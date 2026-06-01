import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();
const normalizeCategory = (category: string | string[]) => Array.isArray(category) ? category : [category];

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("creators").collect();
  },
});

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    const [creators, stories] = await Promise.all([
      ctx.db.query("creators").take(200),
      ctx.db.query("stories").take(2000),
    ]);

    const storyCounts = new Map<string, number>();
    for (const story of stories) {
      const key = story.creatorUsername || story.creatorId;
      if (key) {
        storyCounts.set(key, (storyCounts.get(key) || 0) + 1);
      }
    }

    return creators.map((c) => ({
      ...c,
      totalStories: storyCounts.get(c.username) || storyCounts.get(c._id) || 0,
    }));
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
    name: v.optional(v.string()),
    username: v.string(),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    category: v.union(
      v.array(v.string()),
      v.literal("Artist"),
      v.literal("Writer"),
      v.literal("Studio"),
    ),
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
    const creator = {
      username: args.username,
      name: args.name ?? args.username,
      avatar: args.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(args.username)}`,
      bio: args.bio ?? "",
      category: normalizeCategory(args.category),
      supportEnabled: args.supportEnabled,
      ...(args.location ? { location: args.location } : {}),
      ...(args.dropsomethingUrl ? { dropsomethingUrl: args.dropsomethingUrl } : {}),
      ...(args.profile ? { profile: args.profile } : {}),
    };

    if (existing) {
      await ctx.db.patch(existing._id, { ...creator, updatedAt: timestamp });
      return existing._id;
    }

    return await ctx.db.insert("creators", {
      ...creator,
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
