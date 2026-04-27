import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

export const listReports = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contentReports").collect();
  },
});

export const createReport = mutation({
  args: {
    type: v.union(
      v.literal("story"),
      v.literal("chapter"),
      v.literal("user"),
      v.literal("comment"),
    ),
    targetId: v.string(),
    targetName: v.string(),
    reportedBy: v.string(),
    reason: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentReports", {
      ...args,
      status: "open",
      createdAt: now(),
    });
  },
});

export const resolveReport = mutation({
  args: {
    reportId: v.id("contentReports"),
    status: v.union(v.literal("resolved"), v.literal("dismissed")),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      status: args.status,
      resolvedAt: now(),
      resolvedBy: args.adminEmail,
    });
    return args.reportId;
  },
});

export const listActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("adminActivity").order("desc").collect();
  },
});

export const logActivity = mutation({
  args: {
    action: v.string(),
    adminEmail: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("adminActivity", {
      ...args,
      timestamp: now(),
    });
  },
});

export const listModerators = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("moderators").collect();
  },
});
