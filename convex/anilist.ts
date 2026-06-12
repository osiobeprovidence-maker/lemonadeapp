import { v } from "convex/values";
import { action } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/* ══════════════════════════════════════════════════════════════
   AniList GraphQL API Integration
   - Read-only queries via the public AniList API
   - Rate-limited (max 30 req/min to stay well under 90/min limit)
   - Response caching via anilistCache table
   ══════════════════════════════════════════════════════════════ */

const ANILIST_API = "https://graphql.anilist.co";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const RATE_LIMIT_WINDOW = 2000; // 2s between requests

// Simple in-memory rate limiter (per-action invocation)
let lastRequestTime = 0;

async function rateLimitedFetch(body: object): Promise<any> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_WINDOW) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_WINDOW - elapsed));
  }
  lastRequestTime = Date.now();

  const res = await fetch(ANILIST_API, {
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

/* ───────── GraphQL Queries ───────── */

const SEARCH_QUERY = `
  query ($search: String, $page: Int, $perPage: Int, $type: MediaType, $format_in: [MediaFormat]) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(search: $search, type: $type, format_in: $format_in, isAdult: false) {
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
      }
    }
  }
`;

const DETAIL_QUERY = `
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

/* ───────── Helpers ───────── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
}

function formatDate(date: { year?: number; month?: number; day?: number } | null): string | undefined {
  if (!date || !date.year) return undefined;
  const m = String(date.month ?? 1).padStart(2, "0");
  const d = String(date.day ?? 1).padStart(2, "0");
  return `${date.year}-${m}-${d}`;
}

/* ───────── Content Type Detection ───────── */

type DetectedType = "manga" | "manhwa" | "manhua" | "novel" | "comic";

export function detectContentType(media: {
  format?: string;
  countryOfOrigin?: string;
  tags?: { name: string }[];
  source?: string;
  chapters?: number | null;
}): DetectedType {
  const format = media.format || "";
  const country = media.countryOfOrigin || "";
  const source = media.source || "";
  const tags = (media.tags || []).map((t) => t.name?.toLowerCase());

  if (format === "NOVEL") return "novel";
  if (source === "LIGHT_NOVEL" || source === "WEB_NOVEL") return "novel";
  if (tags.includes("light novel") || tags.includes("web novel")) return "novel";

  if (format === "MANGA" || format === "ONE_SHOT") {
    if (country === "KR" || country === "South Korea") return "manhwa";
    if (country === "CN" || country === "China") return "manhua";
    if (country === "JP" || country === "Japan") return "manga";
    if (tags.includes("manhwa") || tags.includes("webtoon")) return "manhwa";
    if (tags.includes("manhua")) return "manhua";
    return "manga";
  }

  return "comic";
}

/* ───────── SEO Generation ───────── */

export function generateSeo(media: { title: { romaji: string; english?: string }; description: string; coverImage?: { extraLarge?: string } }): {
  seoTitle: string;
  seoDescription: string;
  urlSlug: string;
  ogImage?: string;
  structuredData: any;
} {
  const title = media.title.romaji || media.title.english || "Untitled";
  const cleanDesc = stripHtml(media.description || "");

  return {
    seoTitle: `${title} | OWUUU Manga & Novels`,
    seoDescription: truncate(cleanDesc, 160),
    urlSlug: slugify(title),
    ogImage: media.coverImage?.extraLarge,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Book",
      name: title,
      description: truncate(cleanDesc, 300),
      image: media.coverImage?.extraLarge,
    },
  };
}

/* ───────── Extract Staff (Author/Artist only) ───────── */

export function extractStaff(media: any): { author?: string; artist?: string; publisher?: string } {
  const result: { author?: string; artist?: string; publisher?: string } = {};
  if (!media.staff?.edges) return result;

  for (const edge of media.staff.edges) {
    const name = edge.node?.name?.full;
    if (!name) continue;
    const role = (edge.role || "").toLowerCase();

    if (result.author && result.artist) break;

    if (!result.author && (role.includes("story") || role.includes("author") || role.includes("writer"))) {
      result.author = name;
    } else if (!result.artist && (role.includes("art") || role.includes("illustrator"))) {
      result.artist = name;
    }
  }

  // Fallback: use first staff member with matching occupation
  if (!result.author || !result.artist) {
    for (const edge of media.staff.edges) {
      const name = edge.node?.name?.full;
      if (!name) continue;
      const occs = (edge.node?.primaryOccupations || []).map((o: string) => o.toLowerCase());

      if (!result.author && occs.some((o: string) => o.includes("author") || o.includes("writer") || o.includes("story"))) {
        result.author = name;
      } else if (!result.artist && occs.some((o: string) => o.includes("artist") || o.includes("illustrator"))) {
        result.artist = name;
      }
    }
  }

  // Publisher from studios or external links
  if (media.studios?.nodes?.length) {
    result.publisher = media.studios.nodes[0].name;
  }

  return result;
}

/* ───────── Normalise Media to Our Schema ───────── */

export function normaliseMedia(media: any) {
  const staff = extractStaff(media);
  const seo = generateSeo(media);
  const cleanDescription = stripHtml(media.description || "");
  const detectedType = detectContentType(media);

  return {
    anilistId: media.id,
    malId: media.idMal || undefined,
    titleRomaji: media.title?.romaji || "Untitled",
    titleEnglish: media.title?.english || undefined,
    titleNative: media.title?.native || undefined,
    alternativeTitles: [media.title?.english, media.title?.native].filter(Boolean),
    description: cleanDescription,
    coverImage: media.coverImage?.extraLarge || media.coverImage?.large,
    bannerImage: media.bannerImage || undefined,
    format: media.format || "UNKNOWN",
    status: media.status || "UNKNOWN",
    countryOfOrigin: media.countryOfOrigin || undefined,
    startDate: formatDate(media.startDate),
    endDate: formatDate(media.endDate),
    genres: media.genres || [],
    tags: (media.tags || []).map((t: any) => t.name),
    themes: [],
    averageScore: media.averageScore ?? undefined,
    meanScore: media.meanScore ?? undefined,
    popularity: media.popularity ?? 0,
    favorites: media.favourites ?? 0,
    rankings: media.rankings || [],
    author: staff.author,
    artist: staff.artist,
    publisher: staff.publisher,
    serialization: undefined,
    chapterCount: media.chapters ?? undefined,
    volumeCount: media.volumes ?? undefined,
    source: media.source || undefined,
    contentDetection: detectedType,
    mappingVersion: 1,
    externalUrl: media.siteUrl || undefined,
    isAdult: media.isAdult || false,
    ...seo,
  };
}

/* ══════════════════════════════════════════════════════════════
   Actions (callable from client or other mutations)
   ══════════════════════════════════════════════════════════════ */

export const searchAnilist = action({
  args: {
    search: v.string(),
    page: v.optional(v.number()),
    perPage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const perPage = args.perPage ?? 20;

    const data = await rateLimitedFetch({
      query: SEARCH_QUERY,
      variables: {
        search: args.search,
        page,
        perPage,
        type: "MANGA",
        format_in: ["MANGA", "ONE_SHOT", "NOVEL"],
      },
    });

    return data.data.Page;
  },
});

export const getAnilistDetail = action({
  args: { anilistId: v.number() },
  handler: async (ctx, args) => {
    const data = await rateLimitedFetch({
      query: DETAIL_QUERY,
      variables: { id: args.anilistId },
    });

    return data.data.Media ? normaliseMedia(data.data.Media) : null;
  },
});

export const getAnilistDetailRaw = action({
  args: { anilistId: v.number() },
  handler: async (ctx, args) => {
    const data = await rateLimitedFetch({
      query: DETAIL_QUERY,
      variables: { id: args.anilistId },
    });
    return data.data.Media || null;
  },
});
