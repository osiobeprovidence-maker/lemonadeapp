import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const now = () => new Date().toISOString();
const normalizeCategory = (category: string | string[]) => Array.isArray(category) ? category : [category];

const findCreatorForUpsert = async (
  ctx: MutationCtx,
  args: { userId?: string; username: string },
) => {
  if (args.userId) {
    const byUserId = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId as string))
      .first();
    if (byUserId) return byUserId;
  }

  return await ctx.db
    .query("creators")
    .withIndex("by_username", (q) => q.eq("username", args.username))
    .first();
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("creators").collect();
  },
});

export const listStudios = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("creators").collect();
    return all.filter((c) => {
      const cat = Array.isArray(c.category) ? c.category : [c.category];
      return cat.includes("Studio");
    });
  },
});

export const getByStudioId = query({
  args: { studioId: v.string() },
  handler: async (ctx, args) => {
    // Try by externalId first (seed data uses externalId like "c5")
    const byExternalId = await ctx.db
      .query("creators")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.studioId))
      .first();
    if (byExternalId) return byExternalId;

    // Try by username
    const byUsername = await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", args.studioId))
      .first();
    if (byUsername) return byUsername;

    // Fallback: try as internal _id
    try {
      const byId = await ctx.db.get(args.studioId as any);
      if (byId) return byId;
    } catch { /* invalid id format */ }

    return null;
  },
});

export const listByParentStudio = query({
  args: { parentStudioId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("creators").collect();
    return all.filter((c) => c.parentStudioId === args.parentStudioId);
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
    const matches = await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .take(2);
    if (matches.length === 0) return null;
    if (matches.length > 1) {
      throw new Error("Creator username is not unique.");
    }
    return matches[0];
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
    studioMembers: v.optional(
      v.array(
        v.object({
          userId: v.string(),
          username: v.string(),
          name: v.string(),
          role: v.string(),
        }),
      ),
    ),
    parentStudioId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await findCreatorForUpsert(ctx, args);
    const timestamp = now();
    const creator = {
      ...(args.userId ? { userId: args.userId } : {}),
      username: args.username,
      name: args.name ?? args.username,
      avatar: args.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(args.username)}`,
      bio: args.bio ?? "",
      category: normalizeCategory(args.category),
      supportEnabled: args.supportEnabled,
      ...(args.location ? { location: args.location } : {}),
      ...(args.dropsomethingUrl ? { dropsomethingUrl: args.dropsomethingUrl } : {}),
      ...(args.profile ? { profile: args.profile } : {}),
      ...(args.studioMembers !== undefined ? { studioMembers: args.studioMembers } : {}),
      ...(args.parentStudioId !== undefined ? { parentStudioId: args.parentStudioId } : {}),
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
