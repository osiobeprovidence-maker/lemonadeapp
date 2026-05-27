import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const now = () => new Date().toISOString();

const getApplicationUser = async (ctx: QueryCtx | MutationCtx, userId: string) => {
  try {
    const user = await ctx.db.get(userId as Id<"users">);
    if (user) return user;
  } catch {
    // Fall back to legacy external ids below.
  }

  return await ctx.db
    .query("users")
    .withIndex("by_externalId", (q) => q.eq("externalId", userId))
    .unique();
};

const enrichApplication = async (ctx: QueryCtx, application: any) => {
  const user = await getApplicationUser(ctx, application.userId);
  return {
    ...application,
    email: user?.email,
    applicantName: user?.name,
    username: user?.username,
  };
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const applications = await ctx.db.query("creatorApplications").collect();
    return await Promise.all(applications.map((application) => enrichApplication(ctx, application)));
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("none"),
      v.literal("pending"),
      v.literal("needs_info"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("creatorApplications")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return await Promise.all(applications.map((application) => enrichApplication(ctx, application)));
  },
});

export const getById = query({
  args: {
    applicationId: v.id("creatorApplications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;
    return await enrichApplication(ctx, application);
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
    studioMode: v.optional(v.union(v.literal("solo"), v.literal("existing"), v.literal("new"))),
    studioName: v.optional(v.string()),
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
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("needs_info")),
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

    const user = await getApplicationUser(ctx, application.userId);

    if (user) {
      await ctx.db.patch(user._id, {
        creatorAccessStatus: args.status,
        role: args.status === "approved" ? "creator" : user.role,
        updatedAt: now(),
      });

      if (args.status === "approved") {
        const existingCreator = await ctx.db
          .query("creators")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique();

        const creatorProfile = {
          userId: user._id,
          name: application.creatorName || user.name,
          username: user.username,
          avatar: user.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
          bio: application.bio,
          category: application.category,
          location: application.location,
          dropsomethingUrl: application.dropsomethingUrl,
          supportEnabled: true,
          profile: {
            portfolioLink: application.portfolioLink,
            socialLinks: application.socialLinks,
            studioMode: application.studioMode || "solo",
            studioName: application.studioName,
            storyIntent: application.storyIntent,
            mainGenre: application.mainGenre,
            hasStoryReady: application.hasStoryReady,
            whyLemonade: application.whyLemonade,
          },
          updatedAt: now(),
        };

        if (existingCreator) {
          await ctx.db.patch(existingCreator._id, creatorProfile);
        } else {
          await ctx.db.insert("creators", {
            ...creatorProfile,
            followers: 0,
            totalReads: 0,
            totalStories: 0,
            createdAt: now(),
          });
        }
      }
    }

    await ctx.db.insert("adminActivity", {
      action: `Creator application ${args.status}`,
      adminEmail: args.adminEmail,
      timestamp: now(),
      metadata: {
        applicationId: args.applicationId,
        creatorName: application.creatorName,
        feedback: args.adminFeedback,
      },
    });

    return args.applicationId;
  },
});
