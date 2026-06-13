import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

const now = () => new Date().toISOString();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ─── CRUD ─────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    alternativeTitle: v.optional(v.string()),
    slug: v.optional(v.string()),
    synopsis: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    genres: v.array(v.string()),
    themes: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    artist: v.optional(v.string()),
    releaseYear: v.optional(v.float64()),
    chapters: v.optional(v.float64()),
    volumes: v.optional(v.float64()),
    rating: v.optional(v.float64()),
    popularityScore: v.optional(v.float64()),
    countryOfOrigin: v.optional(v.string()),
    language: v.optional(v.string()),
    source: v.string(),
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    const slug = args.slug || slugify(args.title) + "-" + Date.now();
    const timestamp = now();
    return await ctx.db.insert("manga", {
      ...args,
      themes: args.themes ?? [],
      slug,
      status: "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
      importedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("manga"),
    title: v.optional(v.string()),
    alternativeTitle: v.optional(v.string()),
    slug: v.optional(v.string()),
    synopsis: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    themes: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    artist: v.optional(v.string()),
    releaseYear: v.optional(v.float64()),
    chapters: v.optional(v.float64()),
    volumes: v.optional(v.float64()),
    rating: v.optional(v.float64()),
    popularityScore: v.optional(v.float64()),
    countryOfOrigin: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: now() });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("manga") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("manga")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("manga") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    source: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;
    if (args.status) {
      return await ctx.db
        .query("manga")
        .withIndex("by_status_and_created", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit + offset);
    }
    return await ctx.db.query("manga").order("desc").take(limit + offset);
  },
});

export const listPublished = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;
    return await ctx.db
      .query("manga")
      .withIndex("by_status_and_popularity", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit + offset);
  },
});

export const listPublishedByRating = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("manga")
      .withIndex("by_status_and_rating", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);
  },
});

// ─── PUBLISH / ARCHIVE ────────────────────────────────────────────────────

export const publish = mutation({
  args: { id: v.id("manga") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "published", updatedAt: now() });
    return args.id;
  },
});

export const unpublish = mutation({
  args: { id: v.id("manga") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "draft", updatedAt: now() });
    return args.id;
  },
});

export const archive = mutation({
  args: { id: v.id("manga") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "archived", updatedAt: now() });
    return args.id;
  },
});

export const bulkPublish = mutation({
  args: { ids: v.array(v.id("manga")) },
  handler: async (ctx, args) => {
    const timestamp = now();
    for (const id of args.ids) {
      await ctx.db.patch(id, { status: "published", updatedAt: timestamp });
    }
    return args.ids.length;
  },
});

export const bulkArchive = mutation({
  args: { ids: v.array(v.id("manga")) },
  handler: async (ctx, args) => {
    const timestamp = now();
    for (const id of args.ids) {
      await ctx.db.patch(id, { status: "archived", updatedAt: timestamp });
    }
    return args.ids.length;
  },
});

export const bulkDelete = mutation({
  args: { ids: v.array(v.id("manga")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return args.ids.length;
  },
});

export const bulkUpdateGenres = mutation({
  args: { ids: v.array(v.id("manga")), genres: v.array(v.string()) },
  handler: async (ctx, args) => {
    const timestamp = now();
    for (const id of args.ids) {
      await ctx.db.patch(id, { genres: args.genres, updatedAt: timestamp });
    }
    return args.ids.length;
  },
});

// ─── SEARCH ───────────────────────────────────────────────────────────────

export const search = query({
  args: {
    query: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    genre: v.optional(v.string()),
    author: v.optional(v.string()),
    year: v.optional(v.float64()),
    source: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;
    let items;
    if (args.status) {
      items = await ctx.db
        .query("manga")
        .withIndex("by_status_and_created", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(200);
    } else {
      items = await ctx.db.query("manga").order("desc").take(200);
    }
    let filtered = items;
    if (args.query) {
      const q = args.query.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.alternativeTitle && m.alternativeTitle.toLowerCase().includes(q)) ||
          (m.synopsis && m.synopsis.toLowerCase().includes(q))
      );
    }
    if (args.genre) {
      filtered = filtered.filter((m) => m.genres.some((g) => g.toLowerCase() === args.genre!.toLowerCase()));
    }
    if (args.author) {
      const a = args.author.toLowerCase();
      filtered = filtered.filter((m) => m.author?.toLowerCase().includes(a));
    }
    if (args.year) {
      filtered = filtered.filter((m) => m.releaseYear === args.year);
    }
    if (args.source) {
      filtered = filtered.filter((m) => m.source === args.source);
    }
    return filtered.slice(offset, offset + limit);
  },
});

// ─── DUPLICATE CHECK ──────────────────────────────────────────────────────

export const checkDuplicate = query({
  args: { title: v.string(), externalId: v.string(), source: v.string() },
  handler: async (ctx, args) => {
    const byExtId = await ctx.db
      .query("manga")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId).eq("source", args.source))
      .first();
    if (byExtId) return { exists: true, field: "externalId", id: byExtId._id };
    const byTitle = await ctx.db
      .query("manga")
      .filter((q) => q.eq(q.field("title"), args.title))
      .first();
    if (byTitle) return { exists: true, field: "title", id: byTitle._id };
    return { exists: false };
  },
});

// ─── IMPORT LOGS ──────────────────────────────────────────────────────────

export const listImportLogs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    source: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;
    return await ctx.db
      .query("importLogs")
      .order("desc")
      .take(limit + offset);
  },
});

// ─── ANILIST IMPORT (action) ──────────────────────────────────────────────

async function anilistFetch(query: string, variables: Record<string, any>): Promise<any> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AniList API error ${res.status}: ${text}`);
  }
  return await res.json();
}

const ANILIST_SEARCH = `
query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, sort: $sort, isAdult: false) {
      id
      title { romaji english native }
      description
      coverImage { extraLarge large }
      bannerImage
      genres
      tags { name }
      authors: staff(sort: [RELEVANCE]) {
        edges { role node { name { full } } }
      }
      format
      status
      chapters
      volumes
      averageScore
      popularity
      favourites
      countryOfOrigin
      startDate { year }
      source
      siteUrl
    }
  }
}`;

function parseAnilistMedia(media: any, source: string) {
  const author = media.authors?.edges?.find((e: any) =>
    e.role.toLowerCase().includes("story") || e.role.toLowerCase().includes("author")
  )?.node?.name?.full;
  const artist = media.authors?.edges?.find((e: any) =>
    e.role.toLowerCase().includes("art")
  )?.node?.name?.full;
  const slug = slugify(media.title?.romaji || media.title?.english || "untitled");
  return {
    title: media.title?.romaji || media.title?.english || "Untitled",
    alternativeTitle: media.title?.english || media.title?.native || undefined,
    slug: slug + "-" + media.id,
    synopsis: media.description?.replace(/<[^>]*>/g, "")?.slice(0, 2000),
    coverImage: media.coverImage?.extraLarge || media.coverImage?.large,
    bannerImage: media.bannerImage,
    genres: media.genres || [],
    themes: media.tags?.map((t: any) => t.name) || [],
    author: author || undefined,
    artist: artist || undefined,
    releaseYear: media.startDate?.year || undefined,
    chapters: media.chapters || undefined,
    volumes: media.volumes || undefined,
    rating: media.averageScore ? media.averageScore / 10 : undefined,
    popularityScore: media.popularity || undefined,
    countryOfOrigin: media.countryOfOrigin || undefined,
    source,
    externalId: String(media.id),
  };
}

export const importFromAnilist = action({
  args: {
    externalId: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const source = args.source || "anilist";
    try {
      const dup = await ctx.runQuery(api.manga.checkDuplicate, {
        title: "",
        externalId: args.externalId,
        source,
      });
      if (dup.exists) return { status: "skipped", message: "Already imported", id: dup.id };

      const data = await anilistFetch(ANILIST_SEARCH, {
        page: 1,
        perPage: 1,
        sort: ["POPULARITY_DESC"],
      });
      const media = data?.data?.Page?.media?.[0];
      if (!media && args.externalId) {
        const detailQuery = `query ($id: Int) { Media(id: $id, type: MANGA) { id title { romaji english native } description coverImage { extraLarge large } bannerImage genres tags { name } staff(sort: [RELEVANCE]) { edges { role node { name { full } } } } format status chapters volumes averageScore popularity favourites countryOfOrigin startDate { year } source siteUrl } }`;
        const detail = await anilistFetch(detailQuery, { id: parseInt(args.externalId) });
        if (!detail?.data?.Media) return { status: "failed", message: "Not found on AniList" };
        const parsed = parseAnilistMedia(detail.data.Media, source);
        const id = await ctx.runMutation(api.manga.create, parsed);
        return { status: "success", title: parsed.title, id };
      }
      if (!media) return { status: "failed", message: "No manga found" };
      const parsed = parseAnilistMedia(media, source);
      const id = await ctx.runMutation(api.manga.create, parsed);
      return { status: "success", title: parsed.title, id };
    } catch (e: any) {
      return { status: "failed", message: e.message || "Import failed" };
    }
  },
});

export const bulkImportFromAnilist = action({
  args: {
    query: v.string(),
    source: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const source = args.source || "anilist";
    const limit = args.limit ?? 10;
    let imported = 0, skipped = 0, failed = 0;
    try {
      const sort: string[] = ["POPULARITY_DESC"];
      if (args.query === "trending") sort[0] = "TRENDING_DESC";
      else if (args.query === "latest") sort[0] = "START_DATE_DESC";
      const data = await anilistFetch(ANILIST_SEARCH, { page: 1, perPage: limit, sort });
      const mediaList = data?.data?.Page?.media || [];
      for (const media of mediaList) {
        try {
          const dup = await ctx.runQuery(api.manga.checkDuplicate, {
            title: media.title?.romaji || "",
            externalId: String(media.id),
            source,
          });
          if (dup.exists) { skipped++; continue; }
          const parsed = parseAnilistMedia(media, source);
          await ctx.runMutation(api.manga.create, parsed);
          imported++;
        } catch { failed++; }
      }
    } catch (e: any) {
      return { imported, skipped, failed, error: e.message };
    }
    return { imported, skipped, failed };
  },
});

// ─── MANGADEX IMPORT ──────────────────────────────────────────────────────

export const importFromMangaDex = action({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const source = "mangadex";
    try {
      const dup = await ctx.runQuery(api.manga.checkDuplicate, {
        title: "",
        externalId: args.externalId,
        source,
      });
      if (dup.exists) return { status: "skipped", message: "Already imported", id: dup.id };
      const res = await fetch(`https://api.mangadex.org/manga/${args.externalId}?includes[]=cover_art&includes[]=author&includes[]=artist`);
      if (!res.ok) return { status: "failed", message: `MangaDex API error ${res.status}` };
      const json = await res.json();
      const md = json?.data;
      if (!md) return { status: "failed", message: "Not found on MangaDex" };
      const attrs = md.attributes || {};
      const title = attrs.title?.en || Object.values(attrs.title || {})[0] || "Untitled";
      const altTitle = attrs.altTitles?.map((t: any) => Object.values(t)[0]).find(Boolean);
      const desc = attrs.description?.en || Object.values(attrs.description || {})[0] || "";
      const authorRel = md.relationships?.find((r: any) => r.type === "author");
      const artistRel = md.relationships?.find((r: any) => r.type === "artist");
      const coverRel = md.relationships?.find((r: any) => r.type === "cover_art");
      let coverUrl: string | undefined;
      if (coverRel?.attributes?.fileName) {
        coverUrl = `https://uploads.mangadex.org/covers/${md.id}/${coverRel.attributes.fileName}`;
      }
      const authorName = authorRel ? await fetchMangaDexAuthor(authorRel.id) : undefined;
      const artistName = artistRel && artistRel.id !== authorRel?.id ? await fetchMangaDexAuthor(artistRel.id) : undefined;
      const parsed = {
        title,
        alternativeTitle: altTitle || undefined,
        slug: slugify(title) + "-md-" + md.id,
        synopsis: desc.slice(0, 2000) || undefined,
        coverImage: coverUrl,
        genres: attrs.tags?.map((t: any) => t.attributes?.name?.en).filter(Boolean) || [],
        themes: [],
        author: authorName,
        artist: artistName,
        releaseYear: attrs.year || undefined,
        chapters: attrs.lastChapter ? parseFloat(attrs.lastChapter) : undefined,
        volumes: attrs.lastVolume ? parseFloat(attrs.lastVolume) : undefined,
        rating: attrs.rating ? attrs.rating / 2 : undefined,
        popularityScore: attrs.followCount || undefined,
        countryOfOrigin: attrs.originalLanguage?.toUpperCase(),
        language: attrs.originalLanguage,
        source,
        externalId: md.id,
      };
      const id = await ctx.runMutation(api.manga.create, parsed);
      return { status: "success", title, id };
    } catch (e: any) {
      return { status: "failed", message: e.message || "Import failed" };
    }
  },
});

async function fetchMangaDexAuthor(authorId: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.mangadex.org/author/${authorId}`);
    if (!res.ok) return undefined;
    const json = await res.json();
    return json?.data?.attributes?.name?.en || json?.data?.attributes?.name || undefined;
  } catch {
    return undefined;
  }
}

export const bulkImportFromMangaDex = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    let imported = 0, skipped = 0, failed = 0;
    try {
      const order: string = args.query === "trending" ? "followCount" : args.query === "latest" ? "createdAt" : "rating";
      const res = await fetch(`https://api.mangadex.org/manga?limit=${limit}&order[${order}]=desc&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`);
      if (!res.ok) return { imported, skipped, failed, error: `MangaDex API error ${res.status}` };
      const json = await res.json();
      const mangaList = json?.data || [];
      for (const md of mangaList) {
        try {
          const title = md.attributes?.title?.en || Object.values(md.attributes?.title || {})[0] || "Untitled";
          const dup = await ctx.runQuery(api.manga.checkDuplicate, {
            title,
            externalId: md.id,
            source: "mangadex",
          });
          if (dup.exists) { skipped++; continue; }
          const result = await ctx.runAction(api.manga.importFromMangaDex, { externalId: md.id });
          if (result.status === "success") imported++;
          else if (result.status === "skipped") skipped++;
          else failed++;
        } catch { failed++; }
      }
    } catch (e: any) {
      return { imported, skipped, failed, error: e.message };
    }
    return { imported, skipped, failed };
  },
});

// ─── SEARCH ANILIST (for admin import UI) ─────────────────────────────────

export const searchAnilist = action({
  args: { search: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const q = `query ($s: String, $l: Int) { Page(perPage: $l) { media(type: MANGA, search: $s, isAdult: false) { id title { romaji english native } coverImage { extraLarge large } bannerImage genres format chapters volumes averageScore popularity } } }`;
    const data = await anilistFetch(q, { s: args.search, l: limit });
    return data?.data?.Page?.media || [];
  },
});

export const searchMangaDex = action({
  args: { search: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const res = await fetch(`https://api.mangadex.org/manga?limit=${limit}&title=${encodeURIComponent(args.search)}&includes[]=cover_art`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data || []).map((md: any) => {
      const coverRel = md.relationships?.find((r: any) => r.type === "cover_art");
      const coverUrl = coverRel?.attributes?.fileName
        ? `https://uploads.mangadex.org/covers/${md.id}/${coverRel.attributes.fileName}`
        : undefined;
      return {
        id: md.id,
        title: md.attributes?.title?.en || Object.values(md.attributes?.title || {})[0] || "Untitled",
        coverImage: coverUrl,
        bannerImage: undefined,
        genres: md.attributes?.tags?.map((t: any) => t.attributes?.name?.en).filter(Boolean) || [],
        format: "MANGA",
        chapters: md.attributes?.lastChapter ? parseFloat(md.attributes.lastChapter) : undefined,
        volumes: md.attributes?.lastVolume ? parseFloat(md.attributes.lastVolume) : undefined,
        averageScore: md.attributes?.rating ? md.attributes.rating / 2 : undefined,
        popularity: md.attributes?.followCount || undefined,
        year: md.attributes?.year || undefined,
      };
    });
  },
});
