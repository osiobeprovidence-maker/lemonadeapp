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
    premiumBillingCycle: v.optional(
      v.union(v.literal("monthly"), v.literal("yearly")),
    ),
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
    // Accept any string or array of strings — strict literals break read
    // for documents seeded/upserted before the literal union was added.
    category: v.union(v.array(v.string()), v.string()),
    location: v.optional(v.string()),
    totalReads: v.number(),
    totalStories: v.number(),
    dropsomethingUrl: v.optional(v.string()),
    supportEnabled: v.boolean(),
    profile: v.optional(v.any()),
    studioMembers: v.optional(
      v.array(
        v.object({
          userId: v.string(),
          username: v.string(),
          name: v.string(),
          role: v.string(),
        }),
      ),
    ),
    parentStudioId: v.optional(v.string()),
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
    alternativeTitles: v.optional(v.array(v.string())),
    genre: v.string(),
    genres: v.optional(v.array(v.string())),
    tags: v.array(v.string()),
    contentType: v.optional(
      v.union(
        v.literal("manga"),
        v.literal("manhwa"),
        v.literal("manhua"),
        v.literal("comic"),
        v.literal("novel"),
        v.literal("light_novel"),
      ),
    ),
    format: v.optional(v.string()),
    rating: v.number(),
    ratingCount: v.optional(v.number()),
    ratingSum: v.optional(v.number()),
    views: v.number(),
    saves: v.number(),
    followers: v.optional(v.number()),
    episodes: v.number(),
    synopsis: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    author: v.optional(v.string()),
    artist: v.optional(v.string()),
    releaseYear: v.optional(v.number()),
    language: v.optional(v.string()),
    isOriginal: v.boolean(),
    isFeatured: v.boolean(),
    publicationStatus: v.optional(
      v.union(
        v.literal("ongoing"),
        v.literal("completed"),
        v.literal("hiatus"),
        v.literal("cancelled"),
      ),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("hidden"),
      v.literal("archived"),
    ),
    studioId: v.optional(v.string()),
    studioName: v.optional(v.string()),
    displayAs: v.optional(v.union(v.literal("personal"), v.literal("studio"))),
    credits: v.optional(
      v.array(
        v.object({
          role: v.string(),
          name: v.string(),
          userId: v.optional(v.string()),
          username: v.optional(v.string()),
        }),
      ),
    ),
    media: v.optional(v.any()),
    weeklyViews: v.optional(v.number()),
    lastChapterAt: v.optional(v.string()),
    ...timestampFields,
  })
    .index("by_externalId", ["externalId"])
    .index("by_creatorId", ["creatorId"])
    .index("by_creatorUsername", ["creatorUsername"])
    .index("by_status", ["status"])
    .index("by_featured", ["isFeatured"])
    .index("by_contentType", ["contentType"])
    .index("by_genre", ["genre"])
    .index("by_publicationStatus", ["publicationStatus"])
    .index("by_views", ["views"])
    .index("by_rating", ["rating"])
    .index("by_studioId", ["studioId"])
    .index("by_status_and_views", ["status", "views"])
    .index("by_status_and_rating", ["status", "rating"])
    .index("by_status_and_weeklyViews", ["status", "weeklyViews"])
    .index("by_featured_and_status", ["isFeatured", "status"]),

  storyRatings: defineTable({
    storyId: v.string(),
    userId: v.string(),
    rating: v.number(),
    ...timestampFields,
  })
    .index("by_storyId", ["storyId"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_storyId", ["userId", "storyId"]),

  creatorApplications: defineTable({
    userId: v.string(),
    creatorName: v.string(),
    category: v.array(v.string()),
    location: v.string(),
    bio: v.string(),
    portfolioLink: v.string(),
    socialLinks: v.any(),
    dropsomethingUrl: v.optional(v.string()),
    studioMode: v.optional(
      v.union(v.literal("solo"), v.literal("existing"), v.literal("new")),
    ),
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
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("disabled"),
    ),
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
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("paused"),
      v.literal("rejected"),
    ),
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
    contentType: v.union(
      v.literal("manga"),
      v.literal("manhwa"),
      v.literal("manhua"),
      v.literal("comic"),
      v.literal("novel"),
      v.literal("light_novel"),
      v.literal("movie"),
      v.literal("unknown"),
    ),
    chapterId: v.optional(v.string()),
    eventType: v.union(
      v.literal("impression"),
      v.literal("completed"),
      v.literal("skip"),
      v.literal("click"),
    ),
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
      v.literal("badge"),
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
    status: v.union(
      v.literal("awarded"),
      v.literal("claimed"),
      v.literal("expired"),
    ),
    metadata: v.optional(v.any()),
  }).index("by_user_week", ["userId", "weekStart"]),

  engagementEvents: defineTable({
    userId: v.string(),
    sessionId: v.string(),
    storyId: v.optional(v.string()),
    chapterId: v.optional(v.string()),
    contentType: v.optional(
      v.union(v.literal("manga"), v.literal("novel"), v.literal("movie")),
    ),
    durationMs: v.number(),
    completionPct: v.number(),
    scrollCompletionPct: v.optional(v.number()),
    sessionQuality: v.number(),
    returningVisit: v.boolean(),
    counted: v.boolean(),
    timestamp: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

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
  })
    .index("by_creator", ["creatorId"])
    .index("by_active", ["active"]),

  rewardInventory: defineTable({
    rewardId: v.string(),
    provider: v.optional(v.string()),
    type: v.string(),
    quantity: v.number(),
    reserved: v.number(),
    metadata: v.optional(v.any()),
    updatedAt: v.string(),
  }).index("by_rewardId", ["rewardId"]),

  subscriptions: defineTable({
    creatorId: v.optional(v.string()),
    userId: v.optional(v.string()),
    plan: v.optional(v.string()),
    amount: v.number(),
    billingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
    status: v.union(
      v.literal("trial"),
      v.literal("active"),
      v.literal("past_due"),
      v.literal("cancelled"),
      v.literal("suspended"),
    ),
    trialStart: v.optional(v.string()),
    trialEnd: v.optional(v.string()),
    nextBillingDate: v.optional(v.string()),
    paystackCustomerId: v.optional(v.string()),
    paystackAuthorizationCode: v.optional(v.string()),
    paymentMethodConnected: v.boolean(),
    metadata: v.optional(v.any()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_creatorId", ["creatorId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  payments: defineTable({
    creatorId: v.optional(v.string()),
    userId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed"),
    ),
    transactionReference: v.optional(v.string()),
    provider: v.optional(v.string()),
    providerPayload: v.optional(v.any()),
    paymentDate: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_creatorId", ["creatorId"])
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_status", ["status"]),

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

  contentRequests: defineTable({
    userId: v.string(),
    title: v.string(),
    type: v.union(
      v.literal("manga"),
      v.literal("manhwa"),
      v.literal("manhua"),
      v.literal("novel"),
      v.literal("light_novel"),
      v.literal("comic"),
      v.literal("other"),
    ),
    description: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("in_progress"),
      v.literal("added"),
      v.literal("rejected"),
    ),
    votes: v.number(),
    votedBy: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_votes", ["votes"])
    .index("by_user", ["userId"]),

  /* ═══════════════════════════════════════════
     External Content Import (AniList, etc.)
     ═══════════════════════════════════════════ */

  externalContent: defineTable({
    anilistId: v.optional(v.number()),
    malId: v.optional(v.number()),
    titleRomaji: v.string(),
    titleEnglish: v.optional(v.string()),
    titleNative: v.optional(v.string()),
    alternativeTitles: v.array(v.string()),
    description: v.string(),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    format: v.string(),
    status: v.string(),
    countryOfOrigin: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    genres: v.array(v.string()),
    tags: v.array(v.string()),
    themes: v.array(v.string()),
    averageScore: v.optional(v.number()),
    meanScore: v.optional(v.number()),
    popularity: v.optional(v.number()),
    favorites: v.optional(v.number()),
    rankings: v.optional(v.any()),
    author: v.optional(v.string()),
    artist: v.optional(v.string()),
    publisher: v.optional(v.string()),
    serialization: v.optional(v.string()),
    chapterCount: v.optional(v.number()),
    volumeCount: v.optional(v.number()),
    source: v.optional(v.string()),
    contentDetection: v.string(),
    mappingVersion: v.number(),
    externalUrl: v.optional(v.string()),
    isAdult: v.boolean(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    urlSlug: v.string(),
    ogImage: v.optional(v.string()),
    structuredData: v.optional(v.any()),
    importedAt: v.string(),
    lastSyncedAt: v.optional(v.string()),
    importMethod: v.optional(v.string()),
    provider: v.string(),
    published: v.optional(v.boolean()),
    ...timestampFields,
  })
    .index("by_anilistId", ["anilistId"])
    .index("by_malId", ["malId"])
    .index("by_urlSlug", ["urlSlug"])
    .index("by_contentDetection", ["contentDetection"])
    .index("by_format", ["format"])
    .index("by_status_field", ["status"])
    .index("by_genres", ["genres"])
    .index("by_popularity", ["popularity"])
    .index("by_averageScore", ["averageScore"])
    .index("by_provider", ["provider"])
    .index("by_published", ["published"])
    .index("by_published_and_type", ["published", "contentDetection"])
    .index("by_published_and_popularity", ["published", "popularity"])
    .index("by_published_and_score", ["published", "averageScore"])
    .index("by_content_and_popularity", ["contentDetection", "popularity"])
    .index("by_content_and_score", ["contentDetection", "averageScore"])
    .index("by_content_and_format", ["contentDetection", "format"]),

  anilistCache: defineTable({
    cacheKey: v.string(),
    response: v.any(),
    expiresAt: v.string(),
    ...timestampFields,
  })
    .index("by_cacheKey", ["cacheKey"])
    .index("by_expiresAt", ["expiresAt"]),

  importLogs: defineTable({
    anilistId: v.optional(v.number()),
    title: v.optional(v.string()),
    action: v.string(),
    status: v.string(),
    message: v.string(),
    details: v.optional(v.any()),
    provider: v.string(),
    ...timestampFields,
  })
    .index("by_anilistId", ["anilistId"])
    .index("by_action", ["action"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  syncHistory: defineTable({
    syncType: v.string(),
    status: v.string(),
    itemsProcessed: v.number(),
    itemsSucceeded: v.number(),
    itemsFailed: v.number(),
    startedAt: v.string(),
    completedAt: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    ...timestampFields,
  })
    .index("by_status", ["status"])
    .index("by_syncType", ["syncType"]),

  manga: defineTable({
    title: v.string(),
    alternativeTitle: v.optional(v.string()),
    slug: v.string(),
    synopsis: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    genres: v.array(v.string()),
    themes: v.array(v.string()),
    author: v.optional(v.string()),
    artist: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    releaseYear: v.optional(v.float64()),
    chapters: v.optional(v.float64()),
    volumes: v.optional(v.float64()),
    rating: v.optional(v.float64()),
    popularityScore: v.optional(v.float64()),
    countryOfOrigin: v.optional(v.string()),
    language: v.optional(v.string()),
    source: v.string(),
    externalId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    importedAt: v.optional(v.string()),
    lastSyncedAt: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_externalId", ["externalId", "source"])
    .index("by_source", ["source"])
    .index("by_status_and_rating", ["status", "rating"])
    .index("by_status_and_popularity", ["status", "popularityScore"])
    .index("by_status_and_created", ["status", "createdAt"]),
});
