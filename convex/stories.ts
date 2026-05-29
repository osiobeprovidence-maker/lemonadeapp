import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
  },
});

export const listFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();
  },
});

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();
  },
});

export const listByCreator = query({
  args: { creatorUsername: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_creatorUsername", (q) => q.eq("creatorUsername", args.creatorUsername))
      .collect();
  },
});

export const create = mutation({
  args: {
    externalId: v.optional(v.string()),
    creatorId: v.string(),
    creatorUsername: v.string(),
    title: v.string(),
    genre: v.string(),
    format: v.string(),
    synopsis: v.string(),
    coverImage: v.string(),
    bannerImage: v.string(),
    tags: v.array(v.string()),
    isOriginal: v.boolean(),
    episodes: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("hidden"),
      v.literal("archived"),
    )),
    media: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    const { status, ...story } = args;
    return await ctx.db.insert("stories", {
      ...story,
      rating: 0,
      views: 0,
      saves: 0,
      episodes: args.episodes ?? 0,
      isFeatured: false,
      status: status ?? "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    externalId: v.string(),
    title: v.optional(v.string()),
    genre: v.optional(v.string()),
    format: v.optional(v.string()),
    rating: v.optional(v.number()),
    views: v.optional(v.number()),
    saves: v.optional(v.number()),
    episodes: v.optional(v.number()),
    synopsis: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isOriginal: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("hidden"),
      v.literal("archived"),
    )),
    media: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const story = await ctx.db
      .query("stories")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();
    if (!story) return null;

    const { externalId, ...updates } = args;
    await ctx.db.patch(story._id, {
      ...updates,
      updatedAt: now(),
    });
    return story._id;
  },
});

export const incrementViews = mutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const story = await ctx.db
      .query("stories")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();
    if (!story) return null;

    await ctx.db.patch(story._id, {
      views: story.views + 1,
      updatedAt: now(),
    });
    return story.views + 1;
  },
});

export const publish = mutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const story = await ctx.db
      .query("stories")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();
    if (!story) return null;
    await ctx.db.patch(story._id, { status: "published", updatedAt: now() });
    return story._id;
  },
});
