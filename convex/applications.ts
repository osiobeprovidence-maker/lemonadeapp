import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const now = () => new Date().toISOString();

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("creatorApplications").collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("none"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creatorApplications")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const submit = mutation({
  args: {
    userId: v.string(),
    firebaseUid: v.optional(v.string()),
    creatorName: v.string(),
    category: v.array(v.string()),
    location: v.string(),
    bio: v.string(),
    portfolioLink: v.string(),
    socialLinks: v.any(),
    dropsomethingUrl: v.optional(v.string()),
    storyIntent: v.string(),
    mainGenre: v.string(),
    hasStoryReady: v.boolean(),
    whyLemonade: v.string(),
  },
  handler: async (ctx, args) => {
    const { firebaseUid, ...application } = args;
    let user = firebaseUid
      ? await ctx.db
          .query("users")
          .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", firebaseUid))
          .unique()
      : null;

    if (!user) {
      try {
        user = await ctx.db.get(args.userId as Id<"users">);
      } catch {
        user = null;
      }
    }

    if (user) {
      await ctx.db.patch(user._id, {
        creatorAccessStatus: "pending",
        updatedAt: now(),
      });
    }

    return await ctx.db.insert("creatorApplications", {
      ...application,
      status: "pending",
      submittedAt: now(),
    });
  },
});

export const review = mutation({
  args: {
    applicationId: v.id("creatorApplications"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    adminEmail: v.string(),
    adminFeedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      adminFeedback: args.adminFeedback,
      reviewedAt: now(),
      reviewedBy: args.adminEmail,
    });

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", application.userId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        creatorAccessStatus: args.status,
        role: args.status === "approved" ? "creator" : user.role,
        updatedAt: now(),
      });
    }

    return args.applicationId;
  },
});
