import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const now = () => new Date().toISOString();

const ensureCreatorProfile = async (
  ctx: MutationCtx,
  args: { creatorId: string; creatorUsername: string },
) => {
  const byUserId = await ctx.db
    .query("creators")
    .withIndex("by_userId", (q) => q.eq("userId", args.creatorId))
    .first();
  const creator = byUserId ?? await ctx.db
    .query("creators")
    .withIndex("by_username", (q) => q.eq("username", args.creatorUsername))
    .first();

  const timestamp = now();
  if (creator) {
    await ctx.db.patch(creator._id, {
      userId: creator.userId ?? args.creatorId,
      username: args.creatorUsername,
      totalStories: (creator.totalStories ?? 0) + 1,
      updatedAt: timestamp,
    });
    return creator._id;
  }

  return await ctx.db.insert("creators", {
    userId: args.creatorId,
    username: args.creatorUsername,
    name: args.creatorUsername,
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(args.creatorUsername)}`,
    followers: 0,
    bio: "Creator on OWUUU.",
    category: ["Original"],
    totalReads: 0,
    totalStories: 1,
    supportEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
  },
});

export const listFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();
  },
});

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();
  },
});

export const listByCreator = query({
  args: { creatorUsername: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_creatorUsername", (q) => q.eq("creatorUsername", args.creatorUsername))
      .collect();
  },
});

/* ───────── Discovery Queries ───────── */

export const listByContentType = query({
  args: {
    contentType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return stories
      .filter((s) => s.contentType === args.contentType || s.format?.toLowerCase() === args.contentType.toLowerCase())
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  },
});

export const listByGenre = query({
  args: {
    genre: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return stories
      .filter(
        (s) =>
          s.genre === args.genre ||
          (s.genres && s.genres.includes(args.genre)) ||
          (s.tags && s.tags.includes(args.genre))
      )
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  },
});

export const listTrending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return stories
      .sort((a, b) => ((b.weeklyViews || b.views || 0)) - ((a.weeklyViews || a.views || 0)))
      .slice(0, limit);
  },
});

export const listPopularThisWeek = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return stories
      .sort((a, b) => (b.weeklyViews || 0) - (a.weeklyViews || 0))
      .slice(0, limit);
  },
});

export const listNewReleases = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return stories
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  },
});

export const listRecentlyUpdated = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return stories
      .sort((a, b) => {
        const aDate = new Date(a.lastChapterAt || a.updatedAt || 0).getTime();
        const bDate = new Date(b.lastChapterAt || b.updatedAt || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, limit);
  },
});

export const listTopRated = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return stories
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  },
});

export const listOriginals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();
    const originals = stories.filter((s) => s.isOriginal && s.status === "published");
    return originals.slice(0, limit);
  },
});

// Fuzzy search helper — Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
      );
    }
  }
  return dp[m][n];
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return true;
  if (t.includes(q)) return true;
  // Check each word in query
  const words = q.split(/\s+/);
  return words.some((word) => {
    if (t.includes(word)) return true;
    // Allow 1-2 char typo tolerance based on word length
    const tWords = t.split(/\s+/);
    const maxDist = word.length <= 3 ? 1 : word.length <= 6 ? 2 : 3;
    return tWords.some((tw) => levenshtein(word, tw) <= maxDist);
  });
}

export const search = query({
  args: {
    query: v.string(),
    contentType: v.optional(v.string()),
    genre: v.optional(v.string()),
    status: v.optional(v.string()),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const q = args.query.trim().toLowerCase();

    let stories = await ctx.db
      .query("stories")
      .withIndex("by_status", (q2) => q2.eq("status", "published"))
      .collect();

    // Text matching
    if (q) {
      stories = stories.filter((s) => {
        const titleMatch = fuzzyMatch(q, s.title);
        const authorMatch = s.author && fuzzyMatch(q, s.author);
        const artistMatch = s.artist && fuzzyMatch(q, s.artist);
        const creatorMatch = fuzzyMatch(q, s.creatorUsername);
        const genreMatch =
          fuzzyMatch(q, s.genre) ||
          (s.genres && s.genres.some((g) => fuzzyMatch(q, g))) ||
          (s.tags && s.tags.some((t) => fuzzyMatch(q, t)));
        const altMatch = s.alternativeTitles?.some((alt) => fuzzyMatch(q, alt));
        return titleMatch || authorMatch || artistMatch || creatorMatch || genreMatch || altMatch;
      });
    }

    // Filter by content type
    if (args.contentType) {
      const ct = args.contentType.toLowerCase();
      stories = stories.filter(
        (s) => s.contentType === ct || s.format?.toLowerCase() === ct
      );
    }

    // Filter by genre
    if (args.genre) {
      const g = args.genre;
      stories = stories.filter(
        (s) =>
          s.genre === g ||
          (s.genres && s.genres.includes(g)) ||
          (s.tags && s.tags.includes(g))
      );
    }

    // Filter by publication status
    if (args.status) {
      stories = stories.filter((s) => s.publicationStatus === args.status);
    }

    // Sort
    switch (args.sort) {
      case "newest":
        stories.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "most_read":
        stories.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "highest_rated":
        stories.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "trending":
      default:
        stories.sort((a, b) => (b.weeklyViews || b.views || 0) - (a.weeklyViews || a.views || 0));
        break;
    }

    return stories.slice(0, limit);
  },
});

/* ───────── CRUD ───────── */

export const create = mutation({
  args: {
    externalId: v.optional(v.string()),
    creatorId: v.string(),
    creatorUsername: v.string(),
    title: v.string(),
    alternativeTitles: v.optional(v.array(v.string())),
    genre: v.string(),
    genres: v.optional(v.array(v.string())),
    contentType: v.optional(v.string()),
    format: v.optional(v.string()),
    synopsis: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    author: v.optional(v.string()),
    artist: v.optional(v.string()),
    releaseYear: v.optional(v.number()),
    language: v.optional(v.string()),
    tags: v.array(v.string()),
    isOriginal: v.boolean(),
    publicationStatus: v.optional(v.string()),
    episodes: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("hidden"),
      v.literal("archived"),
    )),
    media: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (!args.creatorId || !args.creatorUsername) {
      throw new Error("Missing creator information.");
    }

    const timestamp = now();

    const existingStory = args.externalId
      ? await ctx.db
          .query("stories")
          .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId as string))
          .unique()
      : null;

    if (existingStory) {
      throw new Error("A story with this ID already exists. Use update instead.");
    }

    try {
      await ensureCreatorProfile(ctx, {
        creatorId: args.creatorId,
        creatorUsername: args.creatorUsername,
      });
    } catch (error) {
      console.error("Failed to ensure creator profile before story create", error);
    }

    const cleanCoverImage = args.coverImage && args.coverImage.trim() ? args.coverImage : undefined;
    const cleanBannerImage = args.bannerImage && args.bannerImage.trim() ? args.bannerImage : undefined;

    return await ctx.db.insert("stories", {
      creatorId: args.creatorId,
      creatorUsername: args.creatorUsername,
      title: args.title,
      ...(args.alternativeTitles ? { alternativeTitles: args.alternativeTitles } : {}),
      genre: args.genre,
      ...(args.genres ? { genres: args.genres } : {}),
      ...(args.contentType ? { contentType: args.contentType as any } : {}),
      format: args.format || args.contentType || "Manga",
      synopsis: args.synopsis,
      ...(args.description ? { description: args.description } : {}),
      tags: args.tags,
      isOriginal: args.isOriginal,
      rating: 0,
      ratingCount: 0,
      ratingSum: 0,
      views: 0,
      saves: 0,
      followers: 0,
      episodes: args.episodes ?? 0,
      isFeatured: false,
      status: args.status ?? "draft",
      ...(args.author ? { author: args.author } : {}),
      ...(args.artist ? { artist: args.artist } : {}),
      ...(args.releaseYear ? { releaseYear: args.releaseYear } : {}),
      ...(args.language ? { language: args.language } : {}),
      ...(args.publicationStatus ? { publicationStatus: args.publicationStatus as any } : { publicationStatus: "ongoing" }),
      weeklyViews: 0,
      ...(args.externalId ? { externalId: args.externalId } : {}),
      ...(cleanCoverImage ? { coverImage: cleanCoverImage } : {}),
      ...(cleanBannerImage ? { bannerImage: cleanBannerImage } : {}),
      ...(args.media ? { media: args.media } : {}),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    externalId: v.string(),
    title: v.optional(v.string()),
    alternativeTitles: v.optional(v.array(v.string())),
    genre: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    contentType: v.optional(v.string()),
    format: v.optional(v.string()),
    rating: v.optional(v.number()),
    views: v.optional(v.number()),
    saves: v.optional(v.number()),
    followers: v.optional(v.number()),
    episodes: v.optional(v.number()),
    synopsis: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    author: v.optional(v.string()),
    artist: v.optional(v.string()),
    releaseYear: v.optional(v.number()),
    language: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isOriginal: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    publicationStatus: v.optional(v.string()),
    weeklyViews: v.optional(v.number()),
    lastChapterAt: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("hidden"),
      v.literal("archived"),
    )),
    media: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const story = await ctx.db
      .query("stories")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();
    if (!story) throw new Error("Story not found. It may have been deleted.");

    const { externalId, ...updates } = args;
    await ctx.db.patch(story._id, {
      ...updates,
      updatedAt: now(),
    });
    return story._id;
  },
});

export const incrementViews = mutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const story = await ctx.db
      .query("stories")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();
    if (!story) return null;

    await ctx.db.patch(story._id, {
      views: story.views + 1,
      weeklyViews: (story.weeklyViews || 0) + 1,
      updatedAt: now(),
    });
    return story.views + 1;
  },
});

export const publish = mutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const story = await ctx.db
      .query("stories")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();
    if (!story) {
      throw new Error("Story not found.");
    }
    if (story.status === "published") {
      throw new Error("This story is already published.");
    }
    await ctx.db.patch(story._id, { status: "published", updatedAt: now() });
    return story._id;
  },
});
