import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

export const list = query({
  args: {
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;

    if (args.contentType) {
      return await ctx.db
        .query("externalContent")
        .withIndex("by_contentDetection", (q) => q.eq("contentDetection", args.contentType!))
        .order("desc")
        .take(limit + offset);
    }

    return await ctx.db.query("externalContent").order("desc").take(limit + offset);
  },
});

export const listByPopularity = query({
  args: {
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.contentType) {
      return await ctx.db
        .query("externalContent")
        .withIndex("by_content_and_popularity", (q) => q.eq("contentDetection", args.contentType!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db.query("externalContent").withIndex("by_popularity").order("desc").take(limit);
  },
});

export const listByScore = query({
  args: {
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.contentType) {
      return await ctx.db
        .query("externalContent")
        .withIndex("by_content_and_score", (q) => q.eq("contentDetection", args.contentType!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db.query("externalContent").withIndex("by_averageScore").order("desc").take(limit);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("externalContent")
      .withIndex("by_urlSlug", (q) => q.eq("urlSlug", args.slug))
      .first();
  },
});

export const getByAnilistId = query({
  args: { anilistId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("externalContent")
      .withIndex("by_anilistId", (q) => q.eq("anilistId", args.anilistId))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("externalContent") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: {
    query: v.string(),
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;
    const q = args.query.toLowerCase().trim();

    // Use content type filtered query if specified
    const base = args.contentType
      ? await ctx.db
          .query("externalContent")
          .withIndex("by_contentDetection", (q) => q.eq("contentDetection", args.contentType!))
          .take(500)
      : await ctx.db.query("externalContent").take(500);

    return base.filter(
      (s) =>
        s.titleRomaji.toLowerCase().includes(q) ||
        (s.titleEnglish && s.titleEnglish.toLowerCase().includes(q)) ||
        (s.titleNative && s.titleNative.toLowerCase().includes(q)) ||
        s.alternativeTitles.some((alt) => alt.toLowerCase().includes(q)),
    ).slice(0, limit);
  },
});

export const create = mutation({
  args: {
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
    provider: v.string(),
    importMethod: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    return await ctx.db.insert("externalContent", {
      ...args,
      published: args.published ?? false,
      importedAt: timestamp,
      lastSyncedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("externalContent"),
    titleRomaji: v.optional(v.string()),
    titleEnglish: v.optional(v.string()),
    titleNative: v.optional(v.string()),
    alternativeTitles: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    format: v.optional(v.string()),
    status: v.optional(v.string()),
    countryOfOrigin: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    themes: v.optional(v.array(v.string())),
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
    contentDetection: v.optional(v.string()),
    mappingVersion: v.optional(v.number()),
    externalUrl: v.optional(v.string()),
    isAdult: v.optional(v.boolean()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    urlSlug: v.optional(v.string()),
    ogImage: v.optional(v.string()),
    structuredData: v.optional(v.any()),
    lastSyncedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: now() });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("externalContent") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const publish = mutation({
  args: { id: v.id("externalContent"), published: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { published: args.published, updatedAt: now() });
    return args.id;
  },
});

export const publishMany = mutation({
  args: { ids: v.array(v.id("externalContent")), published: v.boolean() },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { published: args.published, updatedAt: now() });
    }
    return args.ids.length;
  },
});

export const listPublished = query({
  args: {
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;

    if (args.contentType) {
      return await ctx.db
        .query("externalContent")
        .withIndex("by_published_and_type", (q) => q.eq("published", true).eq("contentDetection", args.contentType!))
        .order("desc")
        .take(limit + offset);
    }

    return await ctx.db
      .query("externalContent")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .take(limit + offset);
  },
});

export const listPublishedByPopularity = query({
  args: {
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.contentType) {
      return await ctx.db
        .query("externalContent")
        .withIndex("by_published_and_type", (q) => q.eq("published", true).eq("contentDetection", args.contentType!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("externalContent")
      .withIndex("by_published_and_popularity", (q) => q.eq("published", true))
      .order("desc")
      .take(limit);
  },
});

export const listPublishedByScore = query({
  args: {
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.contentType) {
      return await ctx.db
        .query("externalContent")
        .withIndex("by_published_and_type", (q) => q.eq("published", true).eq("contentDetection", args.contentType!))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("externalContent")
      .withIndex("by_published_and_score", (q) => q.eq("published", true))
      .order("desc")
      .take(limit);
  },
});
