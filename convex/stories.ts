import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const now = () => new Date().toISOString();

const ensureCreatorProfile = async (
  ctx: MutationCtx,
  args: { creatorId: string; creatorUsername: string },
) => {
  const byUserId = await ctx.db
    .query("creators")
    .withIndex("by_userId", (q) => q.eq("userId", args.creatorId))
    .first();
  const creator = byUserId ?? await ctx.db
    .query("creators")
    .withIndex("by_username", (q) => q.eq("username", args.creatorUsername))
    .first();

  const timestamp = now();
  if (creator) {
    await ctx.db.patch(creator._id, {
      userId: creator.userId ?? args.creatorId,
      username: args.creatorUsername,
      totalStories: (creator.totalStories ?? 0) + 1,
      updatedAt: timestamp,
    });
    return creator._id;
  }

  return await ctx.db.insert("creators", {
    userId: args.creatorId,
    username: args.creatorUsername,
    name: args.creatorUsername,
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(args.creatorUsername)}`,
    followers: 0,
    bio: "Creator on Lemonade.",
    category: ["Original"],
    totalReads: 0,
    totalStories: 1,
    supportEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

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
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
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
    if (!args.creatorId || !args.creatorUsername) {
      throw new Error("Missing creator information.");
    }

    const timestamp = now();

    const existingStory = args.externalId
      ? await ctx.db
          .query("stories")
          .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId as string))
          .unique()
      : null;

    if (existingStory) {
      throw new Error("A story with this ID already exists. Use update instead.");
    }

    try {
      await ensureCreatorProfile(ctx, {
        creatorId: args.creatorId,
        creatorUsername: args.creatorUsername,
      });
    } catch (error) {
      console.error("Failed to ensure creator profile before story create", error);
    }

    const cleanCoverImage = args.coverImage && args.coverImage.trim() ? args.coverImage : undefined;
    const cleanBannerImage = args.bannerImage && args.bannerImage.trim() ? args.bannerImage : undefined;

    return await ctx.db.insert("stories", {
      creatorId: args.creatorId,
      creatorUsername: args.creatorUsername,
      title: args.title,
      genre: args.genre,
      format: args.format,
      synopsis: args.synopsis,
      tags: args.tags,
      isOriginal: args.isOriginal,
      rating: 0,
      ratingCount: 0,
      ratingSum: 0,
      views: 0,
      saves: 0,
      episodes: args.episodes ?? 0,
      isFeatured: false,
      status: args.status ?? "draft",
      ...(args.externalId ? { externalId: args.externalId } : {}),
      ...(cleanCoverImage ? { coverImage: cleanCoverImage } : {}),
      ...(cleanBannerImage ? { bannerImage: cleanBannerImage } : {}),
      ...(args.media ? { media: args.media } : {}),
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
    if (!story) throw new Error("Story not found. It may have been deleted.");

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
    if (!story) {
      throw new Error("Story not found.");
    }
    if (story.status === "published") {
      throw new Error("This story is already published.");
    }
    await ctx.db.patch(story._id, { status: "published", updatedAt: now() });
    return story._id;
  },
});
