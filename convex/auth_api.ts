import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Authentication & User API Functions
 */

// Register/Create user from Firebase
export const registerUser = mutation({
  args: {
    firebaseUid: v.string(),
    email: v.string(),
    name: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("firebaseUid"), args.firebaseUid))
      .first();

    if (existing) {
      return existing;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      externalId: undefined,
      firebaseUid: args.firebaseUid,
      email: args.email,
      name: args.name,
      username: args.username,
      avatar: args.avatar,
      role: "reader",
      creatorAccessStatus: "none",
      premiumStatus: "free",
      walletBalance: 0,
      followedCreators: [],
      savedStories: [],
      unlockedChapters: [],
      badges: [],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(userId);
  },
});

// Get current user
export const getCurrentUser = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("firebaseUid"), args.firebaseUid))
      .first();
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    firebaseUid: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("firebaseUid"), args.firebaseUid))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates = Object.fromEntries(
      Object.entries(args).filter(([key, value]) => key !== "firebaseUid" && value !== undefined)
    );

    await ctx.db.patch(user._id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(user._id);
  },
});

// Follow creator
export const followCreator = mutation({
  args: {
    userId: v.string(),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");

    const followedCreators = user.followedCreators || [];
    if (!followedCreators.includes(args.creatorId)) {
      followedCreators.push(args.creatorId);
    }

    await ctx.db.patch(args.userId as any, {
      followedCreators,
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(args.userId as any);
  },
});

// Unfollow creator
export const unfollowCreator = mutation({
  args: {
    userId: v.string(),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");

    const followedCreators = user.followedCreators || [];
    const index = followedCreators.indexOf(args.creatorId);
    if (index > -1) {
      followedCreators.splice(index, 1);
    }

    await ctx.db.patch(args.userId as any, {
      followedCreators,
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(args.userId as any);
  },
});

// Save story
export const saveStory = mutation({
  args: {
    userId: v.string(),
    storyId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");

    const savedStories = user.savedStories || [];
    if (!savedStories.includes(args.storyId)) {
      savedStories.push(args.storyId);
    }

    await ctx.db.patch(args.userId as any, {
      savedStories,
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(args.userId as any);
  },
});

// Unsave story
export const unsaveStory = mutation({
  args: {
    userId: v.string(),
    storyId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");

    const savedStories = user.savedStories || [];
    const index = savedStories.indexOf(args.storyId);
    if (index > -1) {
      savedStories.splice(index, 1);
    }

    await ctx.db.patch(args.userId as any, {
      savedStories,
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(args.userId as any);
  },
});

// Apply for creator access
export const applyForCreatorAccess = mutation({
  args: {
    userId: v.string(),
    bio: v.string(),
    portfolio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      creatorAccessStatus: "pending",
      updatedAt: new Date().toISOString(),
    });

    // Create application record
    const appId = await ctx.db.insert("applications", {
      externalId: undefined,
      userId: args.userId,
      status: "pending",
      bio: args.bio,
      portfolio: args.portfolio,
      submittedAt: new Date().toISOString(),
      reviewedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return await ctx.db.get(appId);
  },
});

// Get user's saved stories
export const getSavedStories = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");

    const savedStories = user.savedStories || [];
    const stories = await Promise.all(
      savedStories.map((id: string) => ctx.db.get(id as any))
    );

    return stories.filter((s) => s !== null);
  },
});

// Get user's followed creators
export const getFollowedCreators = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");

    const followedCreators = user.followedCreators || [];
    const creators = await Promise.all(
      followedCreators.map((id: string) => ctx.db.get(id as any))
    );

    return creators.filter((c) => c !== null);
  },
});
