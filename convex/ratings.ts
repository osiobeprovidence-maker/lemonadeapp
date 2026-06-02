import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const now = () => new Date().toISOString();

const getStoryDoc = async (ctx: any, storyId: string) => {
  const byExternalId = await ctx.db
    .query("stories")
    .withIndex("by_externalId", (q: any) => q.eq("externalId", storyId))
    .unique();
  if (byExternalId) return byExternalId;

  try {
    const byId = await ctx.db.get(storyId as Id<"stories">);
    if (byId) return byId;
  } catch {
    return null;
  }

  return null;
};

export const getUserRating = query({
  args: { storyId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const rating = await ctx.db
      .query("storyRatings")
      .withIndex("by_userId_and_storyId", (q) =>
        q.eq("userId", args.userId).eq("storyId", args.storyId),
      )
      .unique();
    return rating?.rating ?? null;
  },
});

export const rateStory = mutation({
  args: { storyId: v.string(), userId: v.string(), rating: v.number() },
  handler: async (ctx, args) => {
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
      .unique();

    const prevRating = existing?.rating ?? null;
    const currentCount = typeof (story as any).ratingCount === "number" ? (story as any).ratingCount : 0;
    const currentSum = typeof (story as any).ratingSum === "number" ? (story as any).ratingSum : 0;

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
      await ctx.db.patch(existing!._id, {
        rating: ratingValue,
        updatedAt: now(),
      });
    }

    const average = nextCount > 0 ? Number((nextSum / nextCount).toFixed(1)) : 0;
    await ctx.db.patch(story._id, {
      rating: average,
      ratingCount: nextCount,
      ratingSum: nextSum,
      updatedAt: now(),
    });

    return { rating: average, ratingCount: nextCount };
  },
});

