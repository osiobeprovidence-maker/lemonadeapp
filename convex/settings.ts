import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("platformSettings").first();
    if (!settings) {
      return {
        showMockData: true,
        maintenanceMode: false,
        updatedAt: new Date().toISOString(),
      };
    }
    return settings;
  },
});

export const update = mutation({
  args: {
    showMockData: v.optional(v.boolean()),
    maintenanceMode: v.optional(v.boolean()),
    announcement: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("platformSettings").first();
    const updates = {
      ...args,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("platformSettings", {
        showMockData: args.showMockData ?? true,
        maintenanceMode: args.maintenanceMode ?? false,
        announcement: args.announcement,
        updatedAt: new Date().toISOString(),
      });
    }
  },
});
