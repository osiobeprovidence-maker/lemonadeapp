import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

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
        name: args.name,
        username: args.username,
        avatar: args.avatar,
        updatedAt: timestamp,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
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
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();
    if (!user) throw new Error("User not found");

    const { firebaseUid, ...updates } = args;
    await ctx.db.patch(user._id, {
      ...updates,
      updatedAt: now(),
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
