import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const userRole = v.union(
  v.literal("guest"),
  v.literal("reader"),
  v.literal("creator"),
  v.literal("admin"),
);

const creatorAccessStatus = v.union(
  v.literal("none"),
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

const timestampFields = {
  createdAt: v.string(),
  updatedAt: v.string(),
};

export default defineSchema({
  users: defineTable({
    externalId: v.optional(v.string()),
    firebaseUid: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
    role: userRole,
    creatorAccessStatus,
    premiumStatus: v.union(
      v.literal("free"),
      v.literal("trial"),
      v.literal("premium"),
      v.literal("expired"),
    ),
    walletBalance: v.number(),
    followedCreators: v.array(v.string()),
    savedStories: v.array(v.string()),
    unlockedChapters: v.array(v.string()),
    badges: v.array(v.string()),
    settings: v.optional(v.any()),
    status: v.union(v.literal("active"), v.literal("suspended")),
    ...timestampFields,
  })
    .index("by_externalId", ["externalId"])
    .index("by_firebaseUid", ["firebaseUid"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_role", ["role"]),

  creators: defineTable({
    externalId: v.optional(v.string()),
    userId: v.optional(v.string()),
    name: v.string(),
    username: v.string(),
    avatar: v.string(),
    followers: v.number(),
    bio: v.string(),
    category: v.union(v.literal("Artist"), v.literal("Writer"), v.literal("Studio")),
    location: v.optional(v.string()),
    totalReads: v.number(),
    totalStories: v.number(),
    dropsomethingUrl: v.optional(v.string()),
    supportEnabled: v.boolean(),
    profile: v.optional(v.any()),
    ...timestampFields,
  })
    .index("by_externalId", ["externalId"])
    .index("by_userId", ["userId"])
    .index("by_username", ["username"]),

  stories: defineTable({
    externalId: v.optional(v.string()),
    creatorId: v.string(),
    creatorUsername: v.string(),
    title: v.string(),
    genre: v.string(),
    format: v.string(),
    rating: v.number(),
    views: v.number(),
    saves: v.number(),
    episodes: v.number(),
    synopsis: v.string(),
    coverImage: v.string(),
    bannerImage: v.string(),
    tags: v.array(v.string()),
    isOriginal: v.boolean(),
    isFeatured: v.boolean(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("hidden"),
      v.literal("archived"),
    ),
    media: v.optional(v.any()),
    ...timestampFields,
  })
    .index("by_externalId", ["externalId"])
    .index("by_creatorId", ["creatorId"])
    .index("by_creatorUsername", ["creatorUsername"])
    .index("by_status", ["status"])
    .index("by_featured", ["isFeatured"]),

  creatorApplications: defineTable({
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
    status: creatorAccessStatus,
    adminFeedback: v.optional(v.string()),
    submittedAt: v.string(),
    reviewedAt: v.optional(v.string()),
    reviewedBy: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  contentReports: defineTable({
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
    status: v.union(
      v.literal("open"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("dismissed"),
    ),
    createdAt: v.string(),
    resolvedAt: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_targetId", ["targetId"]),

  adminActivity: defineTable({
    action: v.string(),
    adminEmail: v.string(),
    timestamp: v.string(),
    metadata: v.optional(v.any()),
  }).index("by_adminEmail", ["adminEmail"]),

  moderators: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("super_admin"),
      v.literal("moderator"),
      v.literal("content_reviewer"),
      v.literal("payment_reviewer"),
    ),
    permissions: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("disabled")),
    lastActive: v.string(),
    ...timestampFields,
  }).index("by_email", ["email"]),

  walletTransactions: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("wallet_topup"),
      v.literal("chapter_unlock"),
      v.literal("creator_support"),
      v.literal("premium"),
      v.literal("refund"),
    ),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    reference: v.string(),
    provider: v.optional(v.string()),
    providerPayload: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_reference", ["reference"])
    .index("by_status", ["status"]),

  readingHistory: defineTable({
    userId: v.string(),
    storyId: v.string(),
    chapterId: v.string(),
    timestamp: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_story", ["userId", "storyId"]),
});
