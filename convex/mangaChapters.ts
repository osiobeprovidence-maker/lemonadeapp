import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

const now = () => new Date().toISOString();

// ─── QUERIES ────────────────────────────────────────────────────────────────

export const listByMangaId = query({
  args: { mangaId: v.id("manga"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("mangaChapters")
      .withIndex("by_mangaId", (q) => q.eq("mangaId", args.mangaId))
      .order("asc");
    return await q.take(500);
  },
});

export const getByChapterNumber = query({
  args: { mangaId: v.id("manga"), chapterNumber: v.float64() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mangaChapters")
      .withIndex("by_mangaId_and_chapter", (q) =>
        q.eq("mangaId", args.mangaId).eq("chapterNumber", args.chapterNumber)
      )
      .first();
  },
});

export const getById = query({
  args: { id: v.id("mangaChapters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ─── MUTATIONS ──────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    mangaId: v.id("manga"),
    chapterNumber: v.float64(),
    title: v.optional(v.string()),
    volumeNumber: v.optional(v.float64()),
    externalId: v.string(),
    pages: v.array(v.string()),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mangaChapters", {
      mangaId: args.mangaId,
      chapterNumber: args.chapterNumber,
      title: args.title,
      volumeNumber: args.volumeNumber,
      externalId: args.externalId,
      pages: args.pages,
      status: "published",
      language: args.language,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("mangaChapters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const removeByMangaId = mutation({
  args: { mangaId: v.id("manga") },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query("mangaChapters")
      .withIndex("by_mangaId", (q) => q.eq("mangaId", args.mangaId))
      .collect();
    for (const ch of chapters) {
      await ctx.db.delete(ch._id);
    }
    return chapters.length;
  },
});

// ─── MANGADEX CHAPTER IMPORT ───────────────────────────────────────────────

export const importChapters = action({
  args: {
    mangaId: v.id("manga"),
    language: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const manga = await ctx.runQuery(api.manga.getById, { id: args.mangaId });
    if (!manga) return { imported: 0, skipped: 0, failed: 0, error: "Manga not found" };
    const lang = args.language || "en";
    const limit = args.limit ?? 500;

    const feedUrl = `https://api.mangadex.org/manga/${manga.externalId}/feed?limit=${limit}&translatedLanguage[]=${lang}&order[chapter]=asc&includes[]=scanlation_group`;
    const res = await fetch(feedUrl);
    if (!res.ok) return { imported: 0, skipped: 0, failed: 0, error: `MangaDex feed error ${res.status}` };

    const json = await res.json();
    const chapters = json?.data || [];
    if (chapters.length === 0) return { imported: 0, skipped: 0, failed: 0, error: "No chapters found" };

    let imported = 0, skipped = 0, failed = 0;

    for (const ch of chapters) {
      const attrs = ch.attributes || {};
      const chNum = parseFloat(attrs.chapter);
      if (isNaN(chNum)) { skipped++; continue; }
      if (attrs.pages === 0) { skipped++; continue; }
      if (attrs.isUnavailable) { skipped++; continue; }

      try {
        const existing = await ctx.runQuery(api.mangaChapters.getByChapterNumber, {
          mangaId: args.mangaId,
          chapterNumber: chNum,
        });
        if (existing) { skipped++; continue; }

        const pagesRes = await fetch(`https://api.mangadex.org/at-home/server/${ch.id}`);
        if (!pagesRes.ok) { failed++; continue; }
        const pagesJson = await pagesRes.json();
        const baseUrl = pagesJson?.baseUrl;
        const chapterData = pagesJson?.chapter;
        if (!baseUrl || !chapterData?.hash || !chapterData?.data?.length) { failed++; continue; }

        const pageUrls = chapterData.data.map(
          (f: string) => `${baseUrl}/data/${chapterData.hash}/${f}`
        );

        await ctx.runMutation(api.mangaChapters.create, {
          mangaId: args.mangaId,
          chapterNumber: chNum,
          title: attrs.title || undefined,
          volumeNumber: attrs.volume ? parseFloat(attrs.volume) : undefined,
          externalId: ch.id,
          pages: pageUrls,
          language: attrs.translatedLanguage || lang,
        });
        imported++;
      } catch { failed++; }
    }

    return { imported, skipped, failed };
  },
});

export const syncChapterPages = action({
  args: { chapterId: v.id("mangaChapters") },
  handler: async (ctx, args) => {
    const chapter = await ctx.runQuery(api.mangaChapters.getById, { id: args.chapterId });
    if (!chapter) return { error: "Chapter not found" };

    const res = await fetch(`https://api.mangadex.org/at-home/server/${chapter.externalId}`);
    if (!res.ok) return { error: `MangaDex page error ${res.status}` };
    const json = await res.json();
    const baseUrl = json?.baseUrl;
    const chapterData = json?.chapter;
    if (!baseUrl || !chapterData?.hash || !chapterData?.data?.length) {
      return { error: "No page data returned" };
    }

    const pageUrls = chapterData.data.map(
      (f: string) => `${baseUrl}/data/${chapterData.hash}/${f}`
    );

    await ctx.runMutation(api.mangaChapters.updatePages, {
      id: args.chapterId,
      pages: pageUrls,
    });

    return { pages: pageUrls.length };
  },
});

export const updatePages = mutation({
  args: { id: v.id("mangaChapters"), pages: v.array(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { pages: args.pages, updatedAt: now() });
  },
});
