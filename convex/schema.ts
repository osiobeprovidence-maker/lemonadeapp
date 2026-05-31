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
  v.literal("needs_info"),
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
    usernameUpdatedAt: v.optional(v.string()),
    usernameChangeLockedAt: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    role: userRole,
    creatorAccessStatus,
    premiumStatus: v.union(
      v.literal("free"),
      v.literal("trial"),
      v.literal("premium"),
      v.literal("expired"),
    ),
    premiumPlan: v.optional(v.union(v.literal("premium"), v.literal("patron"))),
    premiumBillingCycle: v.optional(v.union(v.literal("monthly"), v.literal("yearly"))),
    premiumStartedAt: v.optional(v.string()),
    premiumRenewsAt: v.optional(v.string()),
    premiumCancelledAt: v.optional(v.string()),
    premiumCancelAtPeriodEnd: v.optional(v.boolean()),
    premiumProvider: v.optional(v.string()),
    premiumReference: v.optional(v.string()),
    walletBalance: v.number(),
    xp: v.optional(v.number()),
    level: v.optional(v.number()),
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
    category: v.union(
      v.array(v.string()),
      v.literal("Artist"),
      v.literal("Writer"),
      v.literal("Studio"),
    ),
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
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
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

  notifications: defineTable({
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
    timestamp: v.string(),
    read: v.boolean(),
    link: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  comments: defineTable({
    storyId: v.string(),
    chapterId: v.optional(v.string()),
    parentCommentId: v.optional(v.string()),
    authorId: v.string(),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    message: v.string(),
    likesCount: v.number(),
    likedBy: v.array(v.string()),
    dislikesCount: v.number(),
    dislikedBy: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_story", ["storyId"])
    .index("by_story_chapter", ["storyId", "chapterId"])
    .index("by_parentCommentId", ["parentCommentId"]),

  platformSettings: defineTable({
    showMockData: v.boolean(),
    maintenanceMode: v.boolean(),
    announcement: v.optional(v.string()),
    updatedAt: v.string(),
  }),

  advertisers: defineTable({
    name: v.string(),
    contactEmail: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("disabled")),
    budgetNaira: v.number(),
    spentNaira: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_status", ["status"]),

  adCampaigns: defineTable({
    advertiserId: v.optional(v.id("advertisers")),
    title: v.string(),
    type: v.union(v.literal("video"), v.literal("image"), v.literal("banner")),
    placement: v.union(
      v.literal("chapter_preroll"),
      v.literal("movie_preroll"),
      v.literal("novel_midroll"),
      v.literal("sponsored_banner"),
    ),
    status: v.union(v.literal("draft"), v.literal("pending"), v.literal("approved"), v.literal("paused"), v.literal("rejected")),
    mediaUrl: v.string(),
    clickUrl: v.optional(v.string()),
    brandName: v.string(),
    headline: v.string(),
    description: v.optional(v.string()),
    cpmNaira: v.number(),
    targetGenres: v.array(v.string()),
    frequencyCapHours: v.number(),
    priority: v.number(),
    startsAt: v.optional(v.string()),
    endsAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_placement", ["placement"])
    .index("by_status_and_placement", ["status", "placement"]),

  adEvents: defineTable({
    adId: v.id("adCampaigns"),
    advertiserId: v.optional(v.id("advertisers")),
    userId: v.optional(v.string()),
    storyId: v.optional(v.string()),
    creatorUsername: v.optional(v.string()),
    contentType: v.union(v.literal("manga"), v.literal("manhwa"), v.literal("novel"), v.literal("movie"), v.literal("unknown")),
    chapterId: v.optional(v.string()),
    eventType: v.union(v.literal("impression"), v.literal("completed"), v.literal("skip"), v.literal("click")),
    watchTimeMs: v.number(),
    revenueNaira: v.number(),
    creatorShareNaira: v.number(),
    platformShareNaira: v.number(),
    createdAt: v.string(),
  })
    .index("by_adId", ["adId"])
    .index("by_creatorUsername", ["creatorUsername"])
    .index("by_storyId", ["storyId"])
    .index("by_eventType", ["eventType"]),

  creatorAdRevenue: defineTable({
    creatorUsername: v.string(),
    storyId: v.optional(v.string()),
    period: v.string(),
    impressions: v.number(),
    completedViews: v.number(),
    skips: v.number(),
    clicks: v.number(),
    watchTimeMs: v.number(),
    grossRevenueNaira: v.number(),
    creatorRevenueNaira: v.number(),
    platformRevenueNaira: v.number(),
    updatedAt: v.string(),
  })
    .index("by_creatorUsername", ["creatorUsername"])
    .index("by_creator_and_period", ["creatorUsername", "period"]),

  /* === Gamification / Rewards === */

  userCurrencies: defineTable({
    userId: v.string(),
    lemonCoins: v.number(),
    goldenInk: v.number(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

  userStreaks: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    lastActiveAt: v.optional(v.string()),
    longestStreak: v.number(),
    protectedUntil: v.optional(v.string()),
    insuranceUses: v.number(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

  weeklySpinInventory: defineTable({
    rewardId: v.string(),
    type: v.union(
      v.literal("airtime"),
      v.literal("data"),
      v.literal("cash"),
      v.literal("gift_card"),
      v.literal("premium"),
      v.literal("bonus_spin"),
      v.literal("lemon_coins"),
      v.literal("cosmetic"),
      v.literal("badge")
    ),
    amount: v.optional(v.number()),
    metadata: v.optional(v.any()),
    weight: v.number(),
    active: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_active", ["active"]),

  spinResults: defineTable({
    userId: v.string(),
    weekStart: v.string(),
    rewardId: v.optional(v.string()),
    rewardType: v.string(),
    rewardValue: v.optional(v.any()),
    awardedAt: v.string(),
    claimedAt: v.optional(v.string()),
    status: v.union(v.literal("awarded"), v.literal("claimed"), v.literal("expired")),
    metadata: v.optional(v.any()),
  }).index("by_user_week", ["userId", "weekStart"]),

  engagementEvents: defineTable({
    userId: v.string(),
    sessionId: v.string(),
    storyId: v.optional(v.string()),
    chapterId: v.optional(v.string()),
    contentType: v.optional(v.union(v.literal("manga"), v.literal("novel"), v.literal("movie"))),
    durationMs: v.number(),
    completionPct: v.number(),
    scrollCompletionPct: v.optional(v.number()),
    sessionQuality: v.number(),
    returningVisit: v.boolean(),
    counted: v.boolean(),
    timestamp: v.string(),
    metadata: v.optional(v.any()),
  }).index("by_user", ["userId"]).index("by_session", ["sessionId"]),

  xpEvents: defineTable({
    userId: v.string(),
    amount: v.number(),
    reason: v.string(),
    source: v.optional(v.string()),
    timestamp: v.string(),
    metadata: v.optional(v.any()),
  }).index("by_user", ["userId"]),

  achievementsCatalog: defineTable({
    achievementId: v.string(),
    name: v.string(),
    description: v.string(),
    criteria: v.any(),
    xpReward: v.number(),
    coinReward: v.number(),
    badgeId: v.optional(v.string()),
    icon: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_active", ["active"]),

  userAchievements: defineTable({
    userId: v.string(),
    achievementId: v.string(),
    awardedAt: v.string(),
    metadata: v.optional(v.any()),
  }).index("by_user", ["userId"]),

  leaderboardsSnapshots: defineTable({
    period: v.string(),
    type: v.union(v.literal("xp"), v.literal("streak"), v.literal("coins")),
    entries: v.array(v.any()),
    createdAt: v.string(),
  }).index("by_period_and_type", ["period", "type"]),

  creatorQuests: defineTable({
    questId: v.string(),
    creatorId: v.string(),
    title: v.string(),
    description: v.string(),
    requirements: v.any(),
    rewards: v.any(),
    startsAt: v.string(),
    endsAt: v.string(),
    active: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_creator", ["creatorId"]).index("by_active", ["active"]),

  rewardInventory: defineTable({
    rewardId: v.string(),
    provider: v.optional(v.string()),
    type: v.string(),
    quantity: v.number(),
    reserved: v.number(),
    metadata: v.optional(v.any()),
    updatedAt: v.string(),
  }).index("by_rewardId", ["rewardId"]),

  fraudEvents: defineTable({
    userId: v.optional(v.string()),
    type: v.string(),
    description: v.string(),
    evidence: v.optional(v.any()),
    score: v.optional(v.number()),
    resolved: v.boolean(),
    createdAt: v.string(),
    resolvedAt: v.optional(v.string()),
    reviewedBy: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  marketplaceRewards: defineTable({
    rewardId: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("airtime"),
      v.literal("data"),
      v.literal("gift_card"),
      v.literal("cash"),
      v.literal("premium"),
      v.literal("subscription"),
      v.literal("merchandise"),
      v.literal("lemon_coins"),
      v.literal("golden_ink"),
      v.literal("badge"),
      v.literal("mystery_box")
    ),
    coinPrice: v.number(),
    stock: v.number(),
    reserved: v.number(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    metadata: v.optional(v.any()),
    active: v.boolean(),
    requiresApproval: v.boolean(),
    ...timestampFields,
  })
    .index("by_active", ["active"])
    .index("by_rewardId", ["rewardId"]),

  rewardRedemptions: defineTable({
    userId: v.string(),
    username: v.string(),
    rewardId: v.string(),
    redemptionId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("fulfilled"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
    coinsSpent: v.number(),
    userData: v.optional(v.any()),
    adminNotes: v.optional(v.string()),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    fulfilledAt: v.optional(v.string()),
    ...timestampFields,
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_redemptionId", ["redemptionId"]),

  missionsCatalog: defineTable({
    missionId: v.string(),
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("read_chapters"),
      v.literal("read_minutes"),
      v.literal("complete_stories"),
      v.literal("leave_comments"),
      v.literal("write_reviews"),
      v.literal("daily_login"),
      v.literal("comment_likes")
    ),
    target: v.number(),
    coinReward: v.number(),
    xpReward: v.number(),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("once"), v.literal("event")),
    active: v.boolean(),
    ...timestampFields,
  }).index("by_active", ["active"]),

  userMissions: defineTable({
    userId: v.string(),
    missionId: v.string(),
    progress: v.number(),
    target: v.number(),
    periodKey: v.string(),
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("claimed")
    ),
    claimedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user_period", ["userId", "periodKey"])
    .index("by_user", ["userId"]),

  hiddenRewards: defineTable({
    rewardId: v.string(),
    contentType: v.union(v.literal("chapter"), v.literal("story")),
    contentId: v.string(),
    rewardType: v.union(
      v.literal("lemon_coins"),
      v.literal("golden_ink"),
      v.literal("xp"),
      v.literal("badge"),
      v.literal("mystery_box_key")
    ),
    amount: v.optional(v.number()),
    metadata: v.optional(v.any()),
    weight: v.number(),
    active: v.boolean(),
    ...timestampFields,
  }).index("by_content", ["contentType", "contentId"]),

  coinTransactions: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("earn"),
      v.literal("spend"),
      v.literal("bonus"),
      v.literal("admin_adjustment")
    ),
    source: v.union(
      v.literal("reading"),
      v.literal("comment"),
      v.literal("achievement"),
      v.literal("mission"),
      v.literal("redemption"),
      v.literal("streak"),
      v.literal("daily_login"),
      v.literal("mystery_box"),
      v.literal("referral"),
      v.literal("admin")
    ),
    amount: v.number(),
    description: v.string(),
    metadata: v.optional(v.any()),
    timestamp: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  mysteryBoxes: defineTable({
    boxId: v.string(),
    name: v.string(),
    description: v.string(),
    coinPrice: v.number(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    active: v.boolean(),
    ...timestampFields,
  })
    .index("by_active", ["active"])
    .index("by_boxId", ["boxId"]),

  mysteryBoxPrizes: defineTable({
    boxId: v.string(),
    prizeId: v.string(),
    type: v.union(
      v.literal("airtime"),
      v.literal("data"),
      v.literal("gift_card"),
      v.literal("premium"),
      v.literal("merchandise"),
      v.literal("lemon_coins"),
      v.literal("golden_ink"),
      v.literal("badge")
    ),
    amount: v.optional(v.number()),
    metadata: v.optional(v.any()),
    weight: v.number(),
    active: v.boolean(),
    ...timestampFields,
  }).index("by_boxId", ["boxId"]),

  mysteryBoxResults: defineTable({
    userId: v.string(),
    boxId: v.string(),
    prizeId: v.string(),
    prizeType: v.string(),
    prizeValue: v.optional(v.any()),
    openedAt: v.string(),
  }).index("by_user", ["userId"]),
});
