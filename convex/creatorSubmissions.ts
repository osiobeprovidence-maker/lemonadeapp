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
    social: v.optional(v.string()),
    portfolio: v.optional(v.string()),
    chapterCount: v.optional(v.number()),
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
      social: args.social,
      portfolio: args.portfolio,
      chapterCount: args.chapterCount,
      sampleFiles: args.sampleFiles,
      status: "pending",
      offerPrice: undefined,
      adminNotes: "",
      createdAt: now,
    });
  },
});
