import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CREATOR_SHARE = 0.7;
const PLATFORM_SHARE = 0.3;

const now = () => new Date().toISOString();
const periodKey = () => now().slice(0, 7);

const contentTypeValidator = v.union(
  v.literal("manga"),
  v.literal("manhwa"),
  v.literal("manhua"),
  v.literal("comic"),
  v.literal("novel"),
  v.literal("light_novel"),
  v.literal("movie"),
  v.literal("unknown"),
);

const placementValidator = v.union(
  v.literal("chapter_preroll"),
  v.literal("movie_preroll"),
  v.literal("novel_midroll"),
  v.literal("sponsored_banner"),
);

const eventTypeValidator = v.union(
  v.literal("impression"),
  v.literal("completed"),
  v.literal("skip"),
  v.literal("click"),
);

const baseAds = [
  {
    title: "OWUUU Premium",
    type: "banner" as const,
    placement: "chapter_preroll" as const,
    brandName: "OWUUU",
    headline: "Read without interruptions",
    description: "Go Premium for an ad-free cinematic reading experience.",
    mediaUrl: "/owuuu-icon.svg",
    clickUrl: "/premium",
    cpmNaira: 1800,
    targetGenres: ["Action", "Sci-Fi", "Romance", "Drama"],
    frequencyCapHours: 6,
    priority: 10,
  },
  {
    title: "Creator Spotlight",
    type: "image" as const,
    placement: "chapter_preroll" as const,
    brandName: "OWUUU Originals",
    headline: "Discover new manga, manhwa, and comic worlds",
    description: "Follow creators, save stories, and support the next breakout series.",
    mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80",
    clickUrl: "/explore",
    cpmNaira: 1500,
    targetGenres: ["Action", "Fantasy", "Sci-Fi"],
    frequencyCapHours: 4,
    priority: 8,
  },
];

const normalizeContentType = (format: string | undefined) => {
  const lower = (format || "").toLowerCase();
  if (lower.includes("movie")) return "movie";
  if (lower.includes("light novel")) return "light_novel";
  if (lower.includes("novel")) return "novel";
  if (lower.includes("manhwa")) return "manhwa";
  if (lower.includes("manhua")) return "manhua";
  if (lower.includes("comic")) return "comic";
  if (lower.includes("manga")) return "manga";
  return "unknown";
};

const shouldGate = (contentType: string, chapterNumber: number) => {
  if (contentType === "movie") return true;
  if (contentType === "novel" || contentType === "light_novel") return chapterNumber > 1 && chapterNumber % 4 === 0;
  if (contentType === "manga" || contentType === "manhwa" || contentType === "manhua" || contentType === "comic") return chapterNumber === 1 || chapterNumber % 4 === 0;
  return chapterNumber === 1 || chapterNumber % 5 === 0;
};

const calculateRevenue = (cpmNaira: number, eventType: string, watchTimeMs: number) => {
  if (eventType === "skip" || eventType === "click") return 0;

  const base = cpmNaira / 1000;
  const qualityMultiplier = eventType === "completed"
    ? Math.min(1.5, 1 + watchTimeMs / 30000)
    : 1;

  return Number((base * qualityMultiplier).toFixed(4));
};

const ensureSeedAds = async (ctx: any) => {
  const existing = await ctx.db.query("adCampaigns").withIndex("by_status", (q: any) => q.eq("status", "approved")).take(1);
  if (existing.length > 0) return;

  const timestamp = now();
  for (const ad of baseAds) {
    await ctx.db.insert("adCampaigns", {
      ...ad,
      status: "approved",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
};

export const selectForContent = mutation({
  args: {
    userId: v.optional(v.string()),
    storyId: v.string(),
    creatorUsername: v.optional(v.string()),
    format: v.optional(v.string()),
    genre: v.optional(v.string()),
    chapterNumber: v.number(),
    isPremium: v.boolean(),
    recentAdIds: v.optional(v.array(v.string())),
    lastAdShownAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.isPremium) return { shouldShow: false, reason: "premium" };

    const contentType = normalizeContentType(args.format);
    if (!shouldGate(contentType, args.chapterNumber)) {
      return { shouldShow: false, reason: "frequency" };
    }

    const lastAdAt = args.lastAdShownAt ? new Date(args.lastAdShownAt).getTime() : 0;
    if (lastAdAt && Date.now() - lastAdAt < 2 * 60 * 1000) {
      return { shouldShow: false, reason: "cooldown" };
    }

    await ensureSeedAds(ctx);

    const placement = contentType === "movie"
      ? "movie_preroll"
      : contentType === "novel" || contentType === "light_novel"
        ? "novel_midroll"
        : "chapter_preroll";

    const approvedAds = await ctx.db
      .query("adCampaigns")
      .withIndex("by_status_and_placement", (q) => q.eq("status", "approved").eq("placement", placement))
      .take(20);
    const fallbackAds = approvedAds.length > 0
      ? approvedAds
      : await ctx.db.query("adCampaigns").withIndex("by_status", (q) => q.eq("status", "approved")).take(20);

    const recent = new Set(args.recentAdIds || []);
    const genre = args.genre || "";
    const activeAds = fallbackAds
      .filter((ad) => !recent.has(ad._id))
      .filter((ad) => !ad.targetGenres.length || ad.targetGenres.includes(genre))
      .sort((a, b) => b.priority - a.priority);

    const ad = activeAds[0] || fallbackAds.find((candidate) => !recent.has(candidate._id)) || fallbackAds[0];
    if (!ad) return { shouldShow: false, reason: "no_inventory" };

    return {
      shouldShow: true,
      cooldownSeconds: 120,
      countdownSeconds: 5,
      placement,
      contentType,
      ad,
    };
  },
});

export const trackEvent = mutation({
  args: {
    adId: v.id("adCampaigns"),
    userId: v.optional(v.string()),
    storyId: v.optional(v.string()),
    creatorUsername: v.optional(v.string()),
    contentType: contentTypeValidator,
    chapterId: v.optional(v.string()),
    eventType: eventTypeValidator,
    watchTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const ad = await ctx.db.get(args.adId);
    if (!ad) return null;

    const revenueNaira = calculateRevenue(ad.cpmNaira, args.eventType, args.watchTimeMs);
    const creatorShareNaira = Number((revenueNaira * CREATOR_SHARE).toFixed(4));
    const platformShareNaira = Number((revenueNaira * PLATFORM_SHARE).toFixed(4));
    const timestamp = now();

    const eventId = await ctx.db.insert("adEvents", {
      adId: args.adId,
      advertiserId: ad.advertiserId,
      userId: args.userId,
      storyId: args.storyId,
      creatorUsername: args.creatorUsername,
      contentType: args.contentType,
      chapterId: args.chapterId,
      eventType: args.eventType,
      watchTimeMs: args.watchTimeMs,
      revenueNaira,
      creatorShareNaira,
      platformShareNaira,
      createdAt: timestamp,
    });

    if (args.creatorUsername && revenueNaira > 0) {
      const period = periodKey();
      const rows = await ctx.db
        .query("creatorAdRevenue")
        .withIndex("by_creator_and_period", (q) => q.eq("creatorUsername", args.creatorUsername || "").eq("period", period))
        .take(20);
      const current = rows.find((row) => row.storyId === args.storyId);

      const patch = {
        impressions: (current?.impressions || 0) + (args.eventType === "impression" ? 1 : 0),
        completedViews: (current?.completedViews || 0) + (args.eventType === "completed" ? 1 : 0),
        skips: (current?.skips || 0) + (args.eventType === "skip" ? 1 : 0),
        clicks: (current?.clicks || 0) + (args.eventType === "click" ? 1 : 0),
        watchTimeMs: (current?.watchTimeMs || 0) + args.watchTimeMs,
        grossRevenueNaira: Number(((current?.grossRevenueNaira || 0) + revenueNaira).toFixed(4)),
        creatorRevenueNaira: Number(((current?.creatorRevenueNaira || 0) + creatorShareNaira).toFixed(4)),
        platformRevenueNaira: Number(((current?.platformRevenueNaira || 0) + platformShareNaira).toFixed(4)),
        updatedAt: timestamp,
      };

      if (current) {
        await ctx.db.patch(current._id, patch);
      } else {
        await ctx.db.insert("creatorAdRevenue", {
          creatorUsername: args.creatorUsername,
          storyId: args.storyId,
          period,
          ...patch,
        });
      }
    }

    return eventId;
  },
});

export const creatorSummary = query({
  args: { creatorUsername: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("creatorAdRevenue")
      .withIndex("by_creatorUsername", (q) => q.eq("creatorUsername", args.creatorUsername))
      .take(100);

    const totals = rows.reduce((acc, row) => ({
      impressions: acc.impressions + row.impressions,
      completedViews: acc.completedViews + row.completedViews,
      skips: acc.skips + row.skips,
      clicks: acc.clicks + row.clicks,
      watchTimeMs: acc.watchTimeMs + row.watchTimeMs,
      creatorRevenueNaira: acc.creatorRevenueNaira + row.creatorRevenueNaira,
      grossRevenueNaira: acc.grossRevenueNaira + row.grossRevenueNaira,
    }), {
      impressions: 0,
      completedViews: 0,
      skips: 0,
      clicks: 0,
      watchTimeMs: 0,
      creatorRevenueNaira: 0,
      grossRevenueNaira: 0,
    });

    return {
      ...totals,
      rpm: totals.impressions > 0 ? (totals.creatorRevenueNaira / totals.impressions) * 1000 : 0,
      completionRate: totals.impressions > 0 ? (totals.completedViews / totals.impressions) * 100 : 0,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      topContent: rows.sort((a, b) => b.creatorRevenueNaira - a.creatorRevenueNaira).slice(0, 5),
    };
  },
});

export const adminSummary = query({
  args: {},
  handler: async (ctx) => {
    const [ads, advertisers, events] = await Promise.all([
      ctx.db.query("adCampaigns").take(100),
      ctx.db.query("advertisers").take(100),
      ctx.db.query("adEvents").take(500),
    ]);

    const totals = events.reduce((acc, event) => ({
      impressions: acc.impressions + (event.eventType === "impression" ? 1 : 0),
      completedViews: acc.completedViews + (event.eventType === "completed" ? 1 : 0),
      skips: acc.skips + (event.eventType === "skip" ? 1 : 0),
      clicks: acc.clicks + (event.eventType === "click" ? 1 : 0),
      grossRevenueNaira: acc.grossRevenueNaira + event.revenueNaira,
      creatorRevenueNaira: acc.creatorRevenueNaira + event.creatorShareNaira,
      platformRevenueNaira: acc.platformRevenueNaira + event.platformShareNaira,
    }), {
      impressions: 0,
      completedViews: 0,
      skips: 0,
      clicks: 0,
      grossRevenueNaira: 0,
      creatorRevenueNaira: 0,
      platformRevenueNaira: 0,
    });

    // Build per-campaign metrics
    const adMetrics: Record<string, { impressions: number; completedViews: number; skips: number; clicks: number; revenueNaira: number }> = {};
    for (const event of events) {
      const adId = event.adId;
      if (!adMetrics[adId]) {
        adMetrics[adId] = { impressions: 0, completedViews: 0, skips: 0, clicks: 0, revenueNaira: 0 };
      }
      const m = adMetrics[adId];
      if (event.eventType === "impression") m.impressions++;
      if (event.eventType === "completed") m.completedViews++;
      if (event.eventType === "skip") m.skips++;
      if (event.eventType === "click") m.clicks++;
      m.revenueNaira += event.revenueNaira;
    }

    const inventory = ads.map((ad) => ({
      ...ad,
      metrics: adMetrics[ad._id] || { impressions: 0, completedViews: 0, skips: 0, clicks: 0, revenueNaira: 0 },
    }));

    return {
      ...totals,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      completionRate: totals.impressions > 0 ? (totals.completedViews / totals.impressions) * 100 : 0,
      activeAds: ads.filter((ad) => ad.status === "approved").length,
      pendingApprovals: ads.filter((ad) => ad.status === "pending").length,
      advertisers: advertisers.length,
      inventory,
    };
  },
});

export const deleteCampaign = mutation({
  args: { adId: v.id("adCampaigns") },
  handler: async (ctx, args) => {
    const ad = await ctx.db.get(args.adId);
    if (!ad) throw new Error("Campaign not found");

    // Delete all associated events
    const events = await ctx.db
      .query("adEvents")
      .withIndex("by_adId", (q) => q.eq("adId", args.adId))
      .collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    await ctx.db.delete(args.adId);
    return { success: true };
  },
});

export const editCampaign = mutation({
  args: {
    adId: v.id("adCampaigns"),
    title: v.optional(v.string()),
    type: v.optional(v.union(v.literal("video"), v.literal("image"), v.literal("banner"))),
    placement: v.optional(placementValidator),
    mediaUrl: v.optional(v.string()),
    clickUrl: v.optional(v.string()),
    brandName: v.optional(v.string()),
    headline: v.optional(v.string()),
    description: v.optional(v.string()),
    cpmNaira: v.optional(v.number()),
    targetGenres: v.optional(v.array(v.string())),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ad = await ctx.db.get(args.adId);
    if (!ad) throw new Error("Campaign not found");

    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.type !== undefined) updates.type = args.type;
    if (args.placement !== undefined) updates.placement = args.placement;
    if (args.mediaUrl !== undefined) updates.mediaUrl = args.mediaUrl;
    if (args.clickUrl !== undefined) updates.clickUrl = args.clickUrl;
    if (args.brandName !== undefined) updates.brandName = args.brandName;
    if (args.headline !== undefined) updates.headline = args.headline;
    if (args.description !== undefined) updates.description = args.description;
    if (args.cpmNaira !== undefined) updates.cpmNaira = args.cpmNaira;
    if (args.targetGenres !== undefined) updates.targetGenres = args.targetGenres;
    if (args.priority !== undefined) updates.priority = args.priority;

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = now();
      await ctx.db.patch(args.adId, updates);
    }

    return args.adId;
  },
});

export const listCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("adCampaigns").take(100);
  },
});

export const createCampaign = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("video"), v.literal("image"), v.literal("banner")),
    placement: placementValidator,
    mediaUrl: v.string(),
    clickUrl: v.optional(v.string()),
    brandName: v.string(),
    headline: v.string(),
    description: v.optional(v.string()),
    cpmNaira: v.number(),
    targetGenres: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    return await ctx.db.insert("adCampaigns", {
      ...args,
      status: "pending",
      frequencyCapHours: 6,
      priority: 5,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const updateCampaignStatus = mutation({
  args: {
    adId: v.id("adCampaigns"),
    status: v.union(v.literal("approved"), v.literal("paused"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adId, {
      status: args.status,
      updatedAt: now(),
    });
    return args.adId;
  },
});

export const getSitewideAd = query({
  args: {},
  handler: async (ctx) => {
    await ensureSeedAds(ctx);
    const ads = await ctx.db
      .query("adCampaigns")
      .withIndex("by_status_and_placement", (q) => q.eq("status", "approved").eq("placement", "sponsored_banner"))
      .take(10);
    if (ads.length === 0) return null;
    return ads[Math.floor(Math.random() * ads.length)];
  },
});
