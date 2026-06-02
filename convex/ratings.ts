import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const now = () => new Date().toISOString();

const getStoryDoc = async (ctx: MutationCtx | QueryCtx, storyId: string) => {
  const byExternalId = await ctx.db
    .query("stories")
    .withIndex("by_externalId", (q) => q.eq("externalId", storyId))
    .first();
  if (byExternalId) return byExternalId;

  // Fall back to document _id lookup
  try {
    const byId = await ctx.db.get(storyId as Id<"stories">);
    if (byId) return byId;
  } catch {
    // storyId is not a valid document ID format — ignore
  }

  return null;
};

export const getUserRating = query({
  args: { storyId: v.string(), userId: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    const rating = await ctx.db
      .query("storyRatings")
      .withIndex("by_userId_and_storyId", (q) =>
        q.eq("userId", args.userId).eq("storyId", args.storyId),
      )
      .first();
    return rating?.rating ?? null;
  },
});

export const rateStory = mutation({
  args: { storyId: v.string(), userId: v.string(), rating: v.number() },
  handler: async (ctx: MutationCtx, args) => {
    const ratingValue = Math.round(args.rating);
    if (ratingValue < 1 || ratingValue > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }

    const story = await getStoryDoc(ctx, args.storyId);
    if (!story) {
      throw new Error("Story not found.");
    }

    const existing = await ctx.db
      .query("storyRatings")
      .withIndex("by_userId_and_storyId", (q) =>
        q.eq("userId", args.userId).eq("storyId", args.storyId),
      )
      .first();

    const prevRating = existing?.rating ?? null;
    const currentCount =
      typeof story.ratingCount === "number" ? story.ratingCount : 0;
    const currentSum =
      typeof story.ratingSum === "number" ? story.ratingSum : 0;

    let nextCount = currentCount;
    let nextSum = currentSum;

    if (prevRating === null) {
      nextCount = currentCount + 1;
      nextSum = currentSum + ratingValue;
      await ctx.db.insert("storyRatings", {
        storyId: args.storyId,
        userId: args.userId,
        rating: ratingValue,
        createdAt: now(),
        updatedAt: now(),
      });
    } else {
      nextCount = currentCount;
      nextSum = currentSum - prevRating + ratingValue;
      await ctx.db.patch(existing._id, {
        rating: ratingValue,
        updatedAt: now(),
      });
    }

    const average =
      nextCount > 0 ? Number((nextSum / nextCount).toFixed(1)) : 0;
    await ctx.db.patch(story._id, {
      rating: average,
      ratingCount: nextCount,
      ratingSum: nextSum,
      updatedAt: now(),
    });

    return { rating: average, ratingCount: nextCount };
  },
});
