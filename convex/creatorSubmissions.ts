import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    mangaTitle: v.string(),
    genre: v.string(),
    synopsis: v.string(),
    submissionStatus: v.string(),
    chapters: v.optional(v.number()),
    portfolio: v.optional(v.string()),
    social: v.optional(v.string()),
    sampleFiles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("creatorSubmissions", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      mangaTitle: args.mangaTitle,
      genre: args.genre,
      synopsis: args.synopsis,
      submissionStatus: args.submissionStatus,
      chapters: args.chapters,
      portfolio: args.portfolio,
      social: args.social,
      sampleFiles: args.sampleFiles,
      submittedAt: now,
    });
  },
});
