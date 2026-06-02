import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();

const COMMENT_BLACKLIST = new Set([
  "nice",
  "first",
  "good chapter",
  "wow",
  "cool",
  "great",
  "loved it",
  "amazing",
  "awesome",
]);

const COMMENT_SIGNAL_WORDS = new Set([
  "character",
  "chapter",
  "plot",
  "story",
  "ending",
  "twist",
  "prediction",
  "theory",
  "analysis",
  "feedback",
  "because",
  "however",
  "relationship",
  "dialogue",
  "arc",
  "scene",
  "villain",
  "hero",
  "emotion",
  "theme",
  "development",
]);

const COMMENT_LIKE_TIERS = [1, 3, 5, 10];

function normalizeMessage(message: string) {
  return message.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreComment(message: string) {
  const normalized = normalizeMessage(message);
  if (!normalized || normalized.length < 20) {
    return { meaningful: false, score: 0, reason: "too_short" };
  }

  if (COMMENT_BLACKLIST.has(normalized)) {
    return { meaningful: false, score: 0, reason: "low_quality_phrase" };
  }

  const words = normalized
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const meaningfulWords = words.filter(
    (word) =>
      ![
        "the",
        "and",
        "a",
        "an",
        "to",
        "of",
        "is",
        "it",
        "this",
        "that",
        "i",
        "you",
        "they",
      ].includes(word),
  );
  const distinctWords = new Set(meaningfulWords);
  const signalWords = meaningfulWords.filter((word) =>
    COMMENT_SIGNAL_WORDS.has(word),
  );

  let score = 0;
  score += Math.min(30, meaningfulWords.length * 3);
  score += Math.min(20, distinctWords.size * 2);
  score += Math.min(20, signalWords.length * 8);
  if (normalized.includes("?") || normalized.includes("!")) score += 5;
  if (
    normalized.includes("because") ||
    normalized.includes("but") ||
    normalized.includes("however")
  )
    score += 10;
  if (normalized.length > 120) score += 10;

  const meaningful = score >= 35 && meaningfulWords.length >= 6;
  return {
    meaningful,
    score: Math.min(100, score),
    reason: meaningful ? "meaningful" : "low_signal",
  };
}

async function getUserByFirebaseUid(ctx: any, firebaseUid: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_firebaseUid", (q: any) => q.eq("firebaseUid", firebaseUid))
    .unique();
}

async function getUserById(ctx: any, userId: string) {
  return await ctx.db.get(userId as any);
}

async function creditCoins(
  ctx: any,
  userId: string,
  amount: number,
  reason: string,
  source: string,
  metadata: Record<string, any> = {},
) {
  if (!amount || amount === 0) return;

  const currencies = await ctx.db
    .query("userCurrencies")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique();

  if (currencies) {
    await ctx.db.patch(currencies._id, {
      lemonCoins: currencies.lemonCoins + amount,
      updatedAt: now(),
    });
  } else {
    await ctx.db.insert("userCurrencies", {
      userId,
      lemonCoins: amount,
      goldenInk: 0,
      updatedAt: now(),
    });
  }

  await ctx.db.insert("xpEvents", {
    userId,
    amount,
    reason,
    source,
    timestamp: now(),
    metadata: { currency: "lemonCoins", ...metadata },
  });
}

async function maybeAwardCommentLikeBonus(
  ctx: any,
  comment: any,
  likesCount: number,
) {
  if (!comment?.authorId || likesCount <= 0) return null;
  const tier = [...COMMENT_LIKE_TIERS]
    .reverse()
    .find((value) => likesCount >= value);
  if (!tier) return null;

  const events = await ctx.db
    .query("xpEvents")
    .withIndex("by_user", (q: any) => q.eq("userId", comment.authorId))
    .take(200);
  const alreadyAwarded = events.some(
    (event: any) =>
      event.reason === "comment_like_bonus" &&
      event.metadata?.commentId === String(comment._id) &&
      event.metadata?.tier === tier,
  );
  if (alreadyAwarded) return null;

  const reward = tier >= 10 ? 15 : tier >= 5 ? 8 : tier >= 3 ? 4 : 2;
  await creditCoins(
    ctx,
    comment.authorId,
    reward,
    "comment_like_bonus",
    String(comment._id),
    {
      commentId: String(comment._id),
      likesCount,
      tier,
    },
  );
  return { amount: reward };
}

export const followCreator = mutation({
  args: { username: v.string(), creatorUsername: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user || user.followedCreators.includes(args.creatorUsername))
      return null;

    await ctx.db.patch(user._id, {
      followedCreators: [...user.followedCreators, args.creatorUsername],
      updatedAt: now(),
    });
    return user._id;
  },
});

export const unfollowCreator = mutation({
  args: { username: v.string(), creatorUsername: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return null;

    await ctx.db.patch(user._id, {
      followedCreators: user.followedCreators.filter(
        (value) => value !== args.creatorUsername,
      ),
      updatedAt: now(),
    });
    return user._id;
  },
});

export const saveStory = mutation({
  args: { username: v.string(), storyId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user || user.savedStories.includes(args.storyId)) return null;

    await ctx.db.patch(user._id, {
      savedStories: [...user.savedStories, args.storyId],
      updatedAt: now(),
    });
    return user._id;
  },
});

export const unsaveStory = mutation({
  args: { username: v.string(), storyId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return null;

    await ctx.db.patch(user._id, {
      savedStories: user.savedStories.filter((value) => value !== args.storyId),
      updatedAt: now(),
    });
    return user._id;
  },
});

export const trackReading = mutation({
  args: { userId: v.string(), storyId: v.string(), chapterId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("readingHistory", {
      ...args,
      timestamp: now(),
    });
  },
});

export const trackReadingByFirebaseUid = mutation({
  args: { firebaseUid: v.string(), storyId: v.string(), chapterId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("readingHistory")
      .withIndex("by_user_story", (q) =>
        q.eq("userId", user._id).eq("storyId", args.storyId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return await ctx.db.insert("readingHistory", {
      userId: user._id,
      storyId: args.storyId,
      chapterId: args.chapterId,
      timestamp: now(),
    });
  },
});

export const createComment = mutation({
  args: {
    storyId: v.string(),
    chapterId: v.optional(v.string()),
    parentCommentId: v.optional(v.string()),
    authorId: v.string(),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const author = await getUserById(ctx, args.authorId);
    const commentAnalysis = scoreComment(args.message);
    const normalizedMessage = normalizeMessage(args.message);

    const duplicates = await ctx.db
      .query("comments")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .take(100);
    const duplicateFound = duplicates.some(
      (comment: any) =>
        comment.authorId === args.authorId &&
        normalizeMessage(comment.message) === normalizedMessage,
    );

    const comment: {
      storyId: string;
      authorId: string;
      authorName: string;
      message: string;
      likesCount: number;
      likedBy: string[];
      dislikesCount: number;
      dislikedBy: string[];
      createdAt: string;
      chapterId?: string;
      parentCommentId?: string;
      authorAvatar?: string;
    } = {
      storyId: args.storyId,
      authorId: args.authorId,
      authorName: args.authorName,
      message: args.message,
      likesCount: 0,
      likedBy: [],
      dislikesCount: 0,
      dislikedBy: [],
      createdAt: now(),
    };

    // Only set optional string fields when they are actual strings —
    // Convex rejects null/undefined for v.optional(v.string()) fields.
    if (args.chapterId) comment.chapterId = args.chapterId;
    if (args.parentCommentId) comment.parentCommentId = args.parentCommentId;
    if (args.authorAvatar) comment.authorAvatar = args.authorAvatar;

    const commentId = await ctx.db.insert("comments", comment);

    let reward = 0;
    if (author && commentAnalysis.meaningful && !duplicateFound) {
      reward = 3;
      if (commentAnalysis.score >= 55) reward = 4;
      if (commentAnalysis.score >= 70) reward = 5;
      await creditCoins(
        ctx,
        author._id,
        reward,
        "comment_reward",
        String(commentId),
        {
          commentId: String(commentId),
          storyId: args.storyId,
          chapterId: args.chapterId,
          meaningful: true,
          score: commentAnalysis.score,
        },
      );
    }

    return {
      commentId,
      reward,
      meaningful: commentAnalysis.meaningful,
      score: commentAnalysis.score,
      reason: commentAnalysis.reason,
    };
  },
});

export const listComments = query({
  args: {
    storyId: v.string(),
    chapterId: v.optional(v.string()),
    parentCommentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.parentCommentId) {
      return await ctx.db
        .query("comments")
        .withIndex("by_parentCommentId", (q) =>
          q.eq("parentCommentId", args.parentCommentId),
        )
        .take(100);
    }
    let rows;
    if (args.chapterId) {
      rows = await ctx.db
        .query("comments")
        .withIndex("by_story_chapter", (q) =>
          q.eq("storyId", args.storyId).eq("chapterId", args.chapterId),
        )
        .take(100);
    } else {
      rows = await ctx.db
        .query("comments")
        .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
        .take(100);
    }
    return rows.filter((r: any) => !r.parentCommentId);
  },
});

export const listCommentsPaged = query({
  args: {
    storyId: v.string(),
    chapterId: v.optional(v.string()),
    parentCommentId: v.optional(v.string()),
    limit: v.optional(v.number()),
    before: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rows;
    if (args.parentCommentId) {
      rows = await ctx.db
        .query("comments")
        .withIndex("by_parentCommentId", (q) =>
          q.eq("parentCommentId", args.parentCommentId),
        )
        .take(100);
    } else if (args.chapterId) {
      rows = await ctx.db
        .query("comments")
        .withIndex("by_story_chapter", (q) =>
          q.eq("storyId", args.storyId).eq("chapterId", args.chapterId),
        )
        .take(100);
    } else {
      rows = await ctx.db
        .query("comments")
        .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
        .take(100);
    }

    if (!args.parentCommentId) {
      rows = rows.filter((r: any) => !r.parentCommentId);
    }

    rows.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));

    const before = args.before;
    if (before) {
      rows = rows.filter((r: any) => r.createdAt < before);
    }

    const limit = args.limit ?? 10;
    return rows.slice(0, limit);
  },
});

export const toggleLikeComment = mutation({
  args: { commentId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db.query("comments").take(200);
    const comment = comments.find((c) => c._id === (args.commentId as any));
    if (!comment) return null;
    const already = (comment.likedBy || []).includes(args.userId);
    const likedBy = already
      ? comment.likedBy.filter((u: string) => u !== args.userId)
      : [...(comment.likedBy || []), args.userId];
    const likesCount = likedBy.length;
    const dislikedBy = (comment.dislikedBy || []).filter(
      (u: string) => u !== args.userId,
    );
    const dislikesCount = dislikedBy.length;
    await ctx.db.patch(comment._id, {
      likedBy,
      likesCount,
      dislikedBy,
      dislikesCount,
      updatedAt: now(),
    });

    if (!already) {
      await maybeAwardCommentLikeBonus(ctx, comment, likesCount);
    }

    return { likesCount, dislikesCount };
  },
});

export const toggleDislikeComment = mutation({
  args: { commentId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db.query("comments").take(200);
    const comment = comments.find((c) => c._id === (args.commentId as any));
    if (!comment) return null;
    const already = (comment.dislikedBy || []).includes(args.userId);
    const dislikedBy = already
      ? comment.dislikedBy.filter((u: string) => u !== args.userId)
      : [...(comment.dislikedBy || []), args.userId];
    const dislikesCount = dislikedBy.length;
    const likedBy = (comment.likedBy || []).filter(
      (u: string) => u !== args.userId,
    );
    const likesCount = likedBy.length;
    await ctx.db.patch(comment._id, {
      dislikedBy,
      dislikesCount,
      likedBy,
      likesCount,
      updatedAt: now(),
    });
    return { likesCount, dislikesCount };
  },
});

export const deleteComment = mutation({
  args: { commentId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db.query("comments").take(200);
    const comment = comments.find((c) => c._id === (args.commentId as any));
    if (!comment) return null;
    if (comment.authorId !== args.userId) {
      const user: any = await ctx.db.get(args.userId as any);
      if (!user || user.role !== "admin") {
        throw new Error("Not authorized to delete this comment");
      }
    }
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parentCommentId", (q) =>
        q.eq("parentCommentId", args.commentId),
      )
      .take(100);
    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }
    await ctx.db.delete(comment._id);
    return { success: true };
  },
});

export const getCommentCount = query({
  args: { storyId: v.string(), chapterId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let rows;
    if (args.chapterId) {
      rows = await ctx.db
        .query("comments")
        .withIndex("by_story_chapter", (q) =>
          q.eq("storyId", args.storyId).eq("chapterId", args.chapterId),
        )
        .take(100);
    } else {
      rows = await ctx.db
        .query("comments")
        .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
        .take(100);
    }
    return rows.filter((r: any) => !r.parentCommentId).length;
  },
});
