import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

export const createRequest = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    type: v.union(
      v.literal("manga"),
      v.literal("manhwa"),
      v.literal("manhua"),
      v.literal("webtoon"),
      v.literal("novel"),
      v.literal("light_novel"),
      v.literal("comic"),
      v.literal("other"),
    ),
    description: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if a similar request already exists
    const existing = await ctx.db
      .query("contentRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(500);

    const duplicate = existing.find(
      (r) =>
        r.title.toLowerCase().trim() === args.title.toLowerCase().trim() &&
        r.type === args.type,
    );

    if (duplicate) {
      // Auto-vote on the existing request instead
      if (!duplicate.votedBy.includes(args.userId)) {
        await ctx.db.patch(duplicate._id, {
          votes: duplicate.votes + 1,
          votedBy: [...duplicate.votedBy, args.userId],
          updatedAt: now(),
        });
      }
      return { requestId: duplicate._id, existing: true };
    }

    const requestId = await ctx.db.insert("contentRequests", {
      userId: args.userId,
      title: args.title.trim(),
      type: args.type,
      description: args.description?.trim() || undefined,
      sourceUrl: args.sourceUrl?.trim() || undefined,
      status: "pending",
      votes: 1,
      votedBy: [args.userId],
      createdAt: now(),
      updatedAt: now(),
    });

    return { requestId, existing: false };
  },
});

export const voteRequest = mutation({
  args: {
    requestId: v.id("contentRequests"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");

    if (request.votedBy.includes(args.userId)) {
      // Remove vote
      await ctx.db.patch(request._id, {
        votes: Math.max(0, request.votes - 1),
        votedBy: request.votedBy.filter((id) => id !== args.userId),
        updatedAt: now(),
      });
      return { voted: false };
    } else {
      // Add vote
      await ctx.db.patch(request._id, {
        votes: request.votes + 1,
        votedBy: [...request.votedBy, args.userId],
        updatedAt: now(),
      });
      return { voted: true };
    }
  },
});

export const listRequests = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("in_progress"),
        v.literal("added"),
        v.literal("rejected"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    if (args.status) {
      const requests = await ctx.db
        .query("contentRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(limit);
      return requests.sort((a, b) => b.votes - a.votes);
    }

    const requests = await ctx.db.query("contentRequests").take(limit);
    return requests.sort((a, b) => b.votes - a.votes);
  },
});

export const getUserRequests = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentRequests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(100);
  },
});

export const updateStatus = mutation({
  args: {
    requestId: v.id("contentRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("in_progress"),
      v.literal("added"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
      updatedAt: now(),
    });
  },
});
