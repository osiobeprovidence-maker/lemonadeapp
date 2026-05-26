import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();
const USERNAME_CHANGE_INTERVAL_MS = 90 * 24 * 60 * 60 * 1000;

const normalizeUsername = (username: string) => username.trim().toLowerCase().replace(/^@+/, "");

const assertValidUsername = (username: string) => {
  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    throw new Error("Username must be 3-24 characters and can only contain letters, numbers, and underscores.");
  }
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

export const getByFirebaseUid = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
  },
});

export const upsertFromAuth = mutation({
  args: {
    firebaseUid: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    const timestamp = now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: existing.name || args.name,
        username: existing.username || normalizeUsername(args.username),
        avatar: existing.avatar || args.avatar,
        updatedAt: timestamp,
      });
      return existing._id;
    }

    const username = normalizeUsername(args.username);
    assertValidUsername(username);

    return await ctx.db.insert("users", {
      firebaseUid: args.firebaseUid,
      email: args.email,
      name: args.name,
      username,
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
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const updateRole = mutation({
  args: {
    username: v.string(),
    role: v.union(
      v.literal("guest"),
      v.literal("reader"),
      v.literal("creator"),
      v.literal("admin"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return null;
    await ctx.db.patch(user._id, { role: args.role, updatedAt: now() });
    return user._id;
  },
});

export const setStatus = mutation({
  args: {
    username: v.string(),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return null;
    await ctx.db.patch(user._id, { status: args.status, updatedAt: now() });
    return user._id;
  },
});

export const addWalletBalance = mutation({
  args: {
    firebaseUid: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
    if (!user) return null;

    await ctx.db.patch(user._id, {
      walletBalance: user.walletBalance + args.amount,
      updatedAt: now(),
    });
    return user._id;
  },
});

export const getFullProfile = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (!user) return null;

    const [readingHistory, notifications, transactions] = await Promise.all([
      ctx.db
        .query("readingHistory")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("notifications")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("walletTransactions")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
    ]);

    return {
      ...user,
      readingHistory,
      notifications,
      walletTransactions: transactions,
    };
  },
});

export const updateProfile = mutation({
  args: {
    firebaseUid: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
    if (!user) throw new Error("User not found");

    const timestamp = now();
    const { firebaseUid, username, name, bio, avatar, banner, settings } = args;
    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar !== undefined) updates.avatar = avatar;
    if (banner !== undefined) updates.banner = banner;
    if (settings !== undefined) updates.settings = settings;

    if (username !== undefined) {
      const normalizedUsername = normalizeUsername(username);
      assertValidUsername(normalizedUsername);

      if (normalizedUsername !== user.username) {
        const lastUsernameChange = user.usernameChangeLockedAt ? Date.parse(user.usernameChangeLockedAt) : 0;
        const nextAllowedChange = lastUsernameChange + USERNAME_CHANGE_INTERVAL_MS;

        if (lastUsernameChange > 0 && Date.now() < nextAllowedChange) {
          throw new Error(`Username can only be changed once every 90 days. Try again after ${new Date(nextAllowedChange).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`);
        }

        const usernameOwner = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", normalizedUsername))
          .unique();

        if (usernameOwner && usernameOwner._id !== user._id) {
          throw new Error("That username is already taken.");
        }

        updates.username = normalizedUsername;
        updates.usernameUpdatedAt = timestamp;
        updates.usernameChangeLockedAt = timestamp;
      }
    }

    await ctx.db.patch(user._id, {
      ...updates,
      updatedAt: timestamp,
    });
    return user._id;
  },
});

export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("follow"),
      v.literal("save"),
      v.literal("unlock"),
      v.literal("premium"),
      v.literal("support"),
      v.literal("update"),
      v.literal("wallet"),
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      timestamp: now(),
      read: false,
    });
  },
});
export const unlockChapter = mutation({
  args: {
    firebaseUid: v.string(),
    storyId: v.string(),
    chapterId: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
    if (!user) throw new Error("User not found");
    if (user.walletBalance < args.price) throw new Error("Insufficient balance");

    const chapterKey = `${args.storyId}-${args.chapterId}`;
    if (user.unlockedChapters.includes(chapterKey)) return user._id;

    const timestamp = now();
    
    // Update user balance and unlocked chapters
    await ctx.db.patch(user._id, {
      walletBalance: user.walletBalance - args.price,
      unlockedChapters: [...user.unlockedChapters, chapterKey],
      updatedAt: timestamp,
    });

    // Record transaction
    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      type: "chapter_unlock",
      amount: args.price,
      currency: "NGN",
      status: "success",
      reference: `unlock_${Date.now()}`,
      metadata: { storyId: args.storyId, chapterId: args.chapterId },
      createdAt: timestamp,
    });

    return user._id;
  },
});
export const toggleSave = mutation({
  args: { firebaseUid: v.string(), storyId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
    if (!user) throw new Error("User not found");

    const savedStories = user.savedStories || [];
    const isSaved = savedStories.includes(args.storyId);
    
    const newSavedStories = isSaved 
      ? savedStories.filter(id => id !== args.storyId)
      : [...savedStories, args.storyId];

    await ctx.db.patch(user._id, {
      savedStories: newSavedStories,
      updatedAt: now(),
    });

    return { isSaved: !isSaved };
  },
});

export const toggleFollow = mutation({
  args: { firebaseUid: v.string(), creatorUsername: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
    if (!user) throw new Error("User not found");

    const followedCreators = user.followedCreators || [];
    const isFollowed = followedCreators.includes(args.creatorUsername);
    
    const newFollowedCreators = isFollowed 
      ? followedCreators.filter(u => u !== args.creatorUsername)
      : [...followedCreators, args.creatorUsername];

    await ctx.db.patch(user._id, {
      followedCreators: newFollowedCreators,
      updatedAt: now(),
    });

    return { isFollowed: !isFollowed };
  },
});
