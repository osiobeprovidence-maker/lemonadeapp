import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Story Management Functions
 */

// Get story by ID
export const getStoryById = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");
    return story;
  },
});

// Get stories by creator
export const getStoriesByCreator = query({
  args: { creatorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("creatorId"), args.creatorId))
      .collect();
  },
});

// Search stories
export const searchStories = query({
  args: { 
    query: v.string(),
    genre: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("stories").collect();

    // Filter by search query
    results = results.filter(
      (story) =>
        story.title.toLowerCase().includes(args.query.toLowerCase()) ||
        story.description.toLowerCase().includes(args.query.toLowerCase())
    );

    // Filter by genre if provided
    if (args.genre) {
      results = results.filter((story) => story.genre === args.genre);
    }

    return results.slice(0, args.limit || 20);
  },
});

// Get trending stories
export const getTrendingStories = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const stories = await ctx.db.query("stories").collect();
    return stories
      .sort((a, b) => (b.reads || 0) - (a.reads || 0))
      .slice(0, args.limit || 10);
  },
});

// Create story
export const createStory = mutation({
  args: {
    creatorId: v.string(),
    creatorUsername: v.string(),
    title: v.string(),
    description: v.string(),
    genre: v.string(),
    coverImage: v.optional(v.string()),
    isExplicit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const storyId = await ctx.db.insert("stories", {
      externalId: undefined,
      creatorId: args.creatorId,
      creatorUsername: args.creatorUsername,
      title: args.title,
      description: args.description,
      genre: args.genre,
      coverImage: args.coverImage || "",
      isExplicit: args.isExplicit || false,
      chapters: [],
      reads: 0,
      likes: 0,
      comments: 0,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return storyId;
  },
});

// Update story
export const updateStory = mutation({
  args: {
    storyId: v.id("stories"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    genre: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { storyId, ...updates } = args;
    
    await ctx.db.patch(storyId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(storyId);
  },
});

// Publish story
export const publishStory = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.storyId, {
      status: "published",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(args.storyId);
  },
});

// Increment story views
export const incrementStoryViews = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    await ctx.db.patch(args.storyId, {
      reads: (story.reads || 0) + 1,
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(args.storyId);
  },
});

// Like story
export const likeStory = mutation({
  args: { storyId: v.id("stories"), userId: v.string() },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    // Check if user already liked
    const likes = story.likedBy || [];
    if (!likes.includes(args.userId)) {
      likes.push(args.userId);
    }

    await ctx.db.patch(args.storyId, {
      likes: likes.length,
      likedBy: likes,
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(args.storyId);
  },
});

// Delete story
export const deleteStory = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.storyId);
    return { success: true };
  },
});
