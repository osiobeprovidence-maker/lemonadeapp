import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
export const trackReadingByFirebaseUid = mutation({
  args: { firebaseUid: v.string(), storyId: v.string(), chapterId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
    if (!user) throw new Error("User not found");

    // Try to find existing history for this story and user to update/replace
    const existing = await ctx.db
      .query("readingHistory")
      .withIndex("by_user_story", (q) => q.eq("userId", user._id).eq("storyId", args.storyId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return await ctx.db.insert("readingHistory", {
      userId: user._id,
      storyId: args.storyId,
      chapterId: args.chapterId,
      timestamp: now(),
    });
  },
});

export const createComment = mutation({
  args: {
    storyId: v.string(),
    chapterId: v.optional(v.string()),
    parentCommentId: v.optional(v.string()),
    authorId: v.string(),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = {
      storyId: args.storyId,
      chapterId: args.chapterId ?? null,
      parentCommentId: args.parentCommentId ?? null,
      authorId: args.authorId,
      authorName: args.authorName,
      authorAvatar: args.authorAvatar ?? null,
      message: args.message,
      likesCount: 0,
      likedBy: [],
      dislikesCount: 0,
      dislikedBy: [],
      createdAt: now(),
    };
    return await ctx.db.insert("comments", comment);
  },
});

export const listComments = query({
  args: {
    storyId: v.string(),
    chapterId: v.optional(v.string()),
    parentCommentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.parentCommentId) {
      return await ctx.db.query("comments").withIndex("by_parentCommentId", (q) => q.eq("parentCommentId", args.parentCommentId)).collect();
    }
    let rows;
    if (args.chapterId) {
      rows = await ctx.db.query("comments").withIndex("by_story_chapter", (q) => q.eq("storyId", args.storyId).eq("chapterId", args.chapterId)).collect();
    } else {
      rows = await ctx.db.query("comments").withIndex("by_story", (q) => q.eq("storyId", args.storyId)).collect();
    }
    return rows.filter((r: any) => !r.parentCommentId);
  },
});

export const listCommentsPaged = query({
  args: {
    storyId: v.string(),
    chapterId: v.optional(v.string()),
    parentCommentId: v.optional(v.string()),
    limit: v.optional(v.number()),
    before: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rows;
    if (args.parentCommentId) {
      rows = await ctx.db.query("comments").withIndex("by_parentCommentId", (q) => q.eq("parentCommentId", args.parentCommentId)).collect();
    } else if (args.chapterId) {
      rows = await ctx.db.query("comments").withIndex("by_story_chapter", (q) => q.eq("storyId", args.storyId).eq("chapterId", args.chapterId)).collect();
    } else {
      rows = await ctx.db.query("comments").withIndex("by_story", (q) => q.eq("storyId", args.storyId)).collect();
    }

    // Filter to only root comments when no parent is provided
    if (!args.parentCommentId) {
      rows = rows.filter((r: any) => !r.parentCommentId);
    }

    // Sort descending by createdAt
    rows.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));

    const before = args.before;
    if (before) {
      rows = rows.filter((r: any) => r.createdAt < before);
    }

    const limit = args.limit ?? 10;
    return rows.slice(0, limit);
  },
});

export const toggleLikeComment = mutation({
  args: { commentId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db.query("comments").collect();
    const comment = comments.find(c => c._id === args.commentId as any);
    if (!comment) return null;
    const already = (comment.likedBy || []).includes(args.userId);
    const likedBy = already ? comment.likedBy.filter((u: string) => u !== args.userId) : [...(comment.likedBy || []), args.userId];
    const likesCount = likedBy.length;
    // Remove from dislikedBy if present
    const dislikedBy = (comment.dislikedBy || []).filter((u: string) => u !== args.userId);
    const dislikesCount = dislikedBy.length;
    await ctx.db.patch(comment._id, { likedBy, likesCount, dislikedBy, dislikesCount, updatedAt: now() });
    return { likesCount, dislikesCount };
  },
});

export const toggleDislikeComment = mutation({
  args: { commentId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db.query("comments").collect();
    const comment = comments.find(c => c._id === args.commentId as any);
    if (!comment) return null;
    const already = (comment.dislikedBy || []).includes(args.userId);
    const dislikedBy = already ? comment.dislikedBy.filter((u: string) => u !== args.userId) : [...(comment.dislikedBy || []), args.userId];
    const dislikesCount = dislikedBy.length;
    // Remove from likedBy if present
    const likedBy = (comment.likedBy || []).filter((u: string) => u !== args.userId);
    const likesCount = likedBy.length;
    await ctx.db.patch(comment._id, { dislikedBy, dislikesCount, likedBy, likesCount, updatedAt: now() });
    return { likesCount, dislikesCount };
  },
});

export const deleteComment = mutation({
  args: { commentId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db.query("comments").collect();
    const comment = comments.find(c => c._id === args.commentId as any);
    if (!comment) return null;
    // Allow delete if user is the author
    if (comment.authorId !== args.userId) {
      // Or check if user is admin
      const user = await ctx.db.query("users").withIndex("by_id", (q) => q.eq("_id", args.userId as any)).unique();
      if (!user || user.role !== "admin") {
        throw new Error("Not authorized to delete this comment");
      }
    }
    // Delete all replies first
    const replies = await ctx.db.query("comments").withIndex("by_parentCommentId", (q) => q.eq("parentCommentId", args.commentId)).collect();
    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }
    await ctx.db.delete(comment._id);
    return { success: true };
  },
});

export const getCommentCount = query({
  args: { storyId: v.string(), chapterId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let rows;
    if (args.chapterId) {
      rows = await ctx.db.query("comments").withIndex("by_story_chapter", (q) => q.eq("storyId", args.storyId).eq("chapterId", args.chapterId)).collect();
    } else {
      rows = await ctx.db.query("comments").withIndex("by_story", (q) => q.eq("storyId", args.storyId)).collect();
    }
    // Only count root comments (not replies)
    return rows.filter((r: any) => !r.parentCommentId).length;
  },
});
