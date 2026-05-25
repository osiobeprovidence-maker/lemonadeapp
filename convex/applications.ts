import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    creatorName: v.string(),
    category: v.string(),
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
    const inserted = await ctx.db.insert("creatorApplications", {
      ...args,
      status: "pending",
      submittedAt: now(),
    });

    // Attempt to mark the user's creatorAccessStatus as 'pending' if the user exists
    try {
      const user = await ctx.db.get(args.userId as any);
      if (user) {
        await ctx.db.patch(args.userId as any, {
          creatorAccessStatus: 'pending',
          updatedAt: now(),
        });
      }
    } catch (e) {
      // ignore if user not found or patch fails
      console.warn('Failed to patch user creatorAccessStatus', e);
    }

    return inserted;
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

    // Try to find user by externalId index first, fall back to _id lookup
    let user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", application.userId))
      .unique();

    if (!user) {
      try {
        user = await ctx.db.get(application.userId as any);
      } catch (e) {
        user = null as any;
      }
    }

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
