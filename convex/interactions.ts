import { v } from "convex/values";
import { mutation } from "./_generated/server";

const now = () => new Date().toISOString();

export const followCreator = mutation({
  args: { username: v.string(), creatorUsername: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user || user.followedCreators.includes(args.creatorUsername)) return null;

    await ctx.db.patch(user._id, {
      followedCreators: [...user.followedCreators, args.creatorUsername],
      updatedAt: now(),
    });
    return user._id;
  },
});

export const unfollowCreator = mutation({
  args: { username: v.string(), creatorUsername: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return null;

    await ctx.db.patch(user._id, {
      followedCreators: user.followedCreators.filter((value) => value !== args.creatorUsername),
      updatedAt: now(),
    });
    return user._id;
  },
});

export const saveStory = mutation({
  args: { username: v.string(), storyId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user || user.savedStories.includes(args.storyId)) return null;

    await ctx.db.patch(user._id, {
      savedStories: [...user.savedStories, args.storyId],
      updatedAt: now(),
    });
    return user._id;
  },
});

export const unsaveStory = mutation({
  args: { username: v.string(), storyId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return null;

    await ctx.db.patch(user._id, {
      savedStories: user.savedStories.filter((value) => value !== args.storyId),
      updatedAt: now(),
    });
    return user._id;
  },
});

export const trackReading = mutation({
  args: { userId: v.string(), storyId: v.string(), chapterId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("readingHistory", {
      ...args,
      timestamp: now(),
    });
  },
});
