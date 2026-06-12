import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { normaliseMedia, detectContentType } from "./anilist";

const now = () => new Date().toISOString();

/* ══════════════════════════════════════════════════════════════
   Import Logging
   ══════════════════════════════════════════════════════════════ */

export const logImport = mutation({
  args: {
    anilistId: v.optional(v.number()),
    title: v.optional(v.string()),
    action: v.string(),
    status: v.string(),
    message: v.string(),
    details: v.optional(v.any()),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("importLogs", {
      ...args,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const listImportLogs = query({
  args: { limit: v.optional(v.number()), offset: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;
    return await ctx.db.query("importLogs").order("desc").take(limit + offset);
  },
});

export const listFailedImports = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("importLogs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .order("desc")
      .take(limit);
  },
});

/* ══════════════════════════════════════════════════════════════
   Sync History
   ══════════════════════════════════════════════════════════════ */

export const startSync = mutation({
  args: {
    syncType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("syncHistory", {
      syncType: args.syncType,
      status: "in_progress",
      itemsProcessed: 0,
      itemsSucceeded: 0,
      itemsFailed: 0,
      startedAt: now(),
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const completeSync = mutation({
  args: {
    syncId: v.id("syncHistory"),
    itemsProcessed: v.number(),
    itemsSucceeded: v.number(),
    itemsFailed: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.syncId, {
      status: args.errorMessage ? "failed" : "completed",
      itemsProcessed: args.itemsProcessed,
      itemsSucceeded: args.itemsSucceeded,
      itemsFailed: args.itemsFailed,
      completedAt: now(),
      errorMessage: args.errorMessage,
      updatedAt: now(),
    });
  },
});

export const listSyncHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db.query("syncHistory").order("desc").take(limit);
  },
});

export const getLastSync = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("syncHistory").order("desc").first();
  },
});

/* ══════════════════════════════════════════════════════════════
   Import Actions (called from client)
   ══════════════════════════════════════════════════════════════ */

const ANILIST_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: MANGA) {
      id
      idMal
      title { romaji english native }
      description
      coverImage { extraLarge large color }
      bannerImage
      format
      status
      countryOfOrigin
      startDate { year month day }
      endDate { year month day }
      genres
      tags { name rank isMediaSpoiler }
      averageScore
      meanScore
      popularity
      favourites
      rankings { rank type season year allTime context }
      studios(isMain: true) { nodes { name } }
      externalLinks { url site }
      source
      chapters
      volumes
      isAdult
      siteUrl
      staff(sort: FAVOURITES_DESC, page: 1, perPage: 25) {
        edges {
          role
          node {
            id
            name { full }
            primaryOccupations
          }
        }
      }
    }
  }
`;

// Rate limit: max 30 req/min
let lastAnilistCall = 0;
const MIN_INTERVAL = 2000;

async function anilistFetch(body: object): Promise<any> {
  const elapsed = Date.now() - lastAnilistCall;
  if (elapsed < MIN_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL - elapsed));
  }
  lastAnilistCall = Date.now();

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AniList API error ${res.status}: ${err}`);
  }
  return res.json();
}

/**
 * Import a single title from AniList by ID.
 * Checks for duplicates before importing.
 */
export const importFromAnilist = action({
  args: {
    anilistId: v.number(),
    importMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const anilistId = args.anilistId;
    const method = args.importMethod ?? "manual";

    // Check for existing content
    const existing = await ctx.runQuery(api.externalContent.getByAnilistId, { anilistId });
    if (existing) {
      await ctx.runMutation(api.imports.logImport, {
        anilistId,
        title: existing.titleRomaji,
        action: "import",
        status: "skipped",
        message: `Already imported as "${existing.titleRomaji}" (${existing.contentDetection})`,
        provider: "anilist",
      });
      return { status: "skipped", id: existing._id, title: existing.titleRomaji };
    }

    // Fetch from AniList
    const raw = await anilistFetch({
      query: ANILIST_DETAIL_QUERY,
      variables: { id: anilistId },
    });

    const media = raw.data?.Media;
    if (!media) {
      await ctx.runMutation(api.imports.logImport, {
        anilistId,
        action: "import",
        status: "failed",
        message: "AniList returned no data for this ID",
        provider: "anilist",
      });
      return { status: "failed", error: "No data returned from AniList" };
    }

    const normalised = normaliseMedia(media);
    const title = normalised.titleRomaji;

    // Create the record
    const id = await ctx.runMutation(api.externalContent.create, {
      ...normalised,
      provider: "anilist",
      importMethod: method,
    });

    await ctx.runMutation(api.imports.logImport, {
      anilistId,
      title,
      action: "import",
      status: "success",
      message: `Imported "${title}" as ${normalised.contentDetection}`,
      details: { contentDetection: normalised.contentDetection, format: normalised.format },
      provider: "anilist",
    });

    return { status: "success", id, title, contentDetection: normalised.contentDetection };
  },
});

/**
 * Bulk import multiple AniList IDs
 */
export const bulkImportFromAnilist = action({
  args: {
    anilistIds: v.array(v.number()),
    importMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const method = args.importMethod ?? "bulk";
    const results: Array<{ anilistId: number; status: string; title?: string; error?: string }> = [];

    // Create sync record
    const syncId = await ctx.runMutation(api.imports.startSync, { syncType: "bulk_import" });

    for (const anilistId of args.anilistIds) {
      try {
        const result = await ctx.runAction(api.imports.importFromAnilist, {
          anilistId,
          importMethod: method,
        });
        results.push({ anilistId, ...result });
      } catch (error: any) {
        results.push({ anilistId, status: "failed", error: error.message });
        await ctx.runMutation(api.imports.logImport, {
          anilistId,
          action: "import",
          status: "failed",
          message: error.message,
          provider: "anilist",
        });
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const failed = results.filter((r) => r.status === "failed").length;

    await ctx.runMutation(api.imports.completeSync, {
      syncId,
      itemsProcessed: args.anilistIds.length,
      itemsSucceeded: succeeded,
      itemsFailed: failed + skipped,
    });

    return { results, summary: { total: args.anilistIds.length, succeeded, skipped, failed } };
  },
});

/**
 * Re-sync a single imported title with current AniList data
 */
export const resyncFromAnilist = action({
  args: {
    contentId: v.id("externalContent"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(api.externalContent.getById, { id: args.contentId });
    if (!existing) {
      return { status: "failed", error: "Content not found" };
    }

    if (!existing.anilistId) {
      return { status: "failed", error: "No AniList ID associated with this content" };
    }

    // Fetch fresh data
    const raw = await anilistFetch({
      query: ANILIST_DETAIL_QUERY,
      variables: { id: existing.anilistId },
    });

    const media = raw.data?.Media;
    if (!media) {
      return { status: "failed", error: "AniList returned no data" };
    }

    const normalised = normaliseMedia(media);

    // Update the record
    await ctx.runMutation(api.externalContent.update, {
      id: args.contentId,
      ...normalised,
      lastSyncedAt: now(),
      mappingVersion: existing.mappingVersion + 1,
    });

    await ctx.runMutation(api.imports.logImport, {
      anilistId: existing.anilistId,
      title: existing.titleRomaji,
      action: "re_sync",
      status: "success",
      message: `Re-synced "${existing.titleRomaji}"`,
      provider: "anilist",
    });

    return { status: "success", id: args.contentId, title: existing.titleRomaji };
  },
});

/* ───────── Stats / Dashboard ───────── */

export const getImportStats = query({
  args: {},
  handler: async (ctx) => {
    const total = await ctx.db.query("externalContent").take(10000);
    const lastSync = await ctx.db.query("syncHistory").order("desc").first();
    const failedLogs = await ctx.db
      .query("importLogs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .take(100);

    const byType: Record<string, number> = {};
    for (const item of total) {
      byType[item.contentDetection] = (byType[item.contentDetection] || 0) + 1;
    }

    return {
      totalImported: total.length,
      byType,
      lastSync: lastSync
        ? {
            status: lastSync.status,
            startedAt: lastSync.startedAt,
            completedAt: lastSync.completedAt,
            itemsProcessed: lastSync.itemsProcessed,
          }
        : null,
      failedCount: failedLogs.length,
    };
  },
});
