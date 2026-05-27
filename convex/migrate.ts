import { mutation } from "./_generated/server";

/**
 * Data migration: Fix category field in creators table.
 * Converts any array values like ["Artist"] back to single strings "Artist".
 * Also fixes creatorApplications if needed.
 */
export const fixCategoryFields = mutation({
  args: {},
  handler: async (ctx) => {
    const now = () => new Date().toISOString();
    let fixedCreators = 0;
    let fixedApplications = 0;

    // Fix creators table
    const creators = await ctx.db.query("creators").collect();
    for (const creator of creators) {
      const category = creator.category;
      
      // If category is an array, unwrap it to first element or default to "Artist"
      let fixed = false;
      let newCategory = category;
      
      if (Array.isArray(category)) {
        newCategory = category[0] || "Artist";
        fixed = true;
      }

      if (fixed) {
        await ctx.db.patch(creator._id, {
          category: newCategory,
          updatedAt: now(),
        });
        fixedCreators += 1;
      }
    }

    // Fix creatorApplications table if needed
    const applications = await ctx.db.query("creatorApplications").collect();
    for (const app of applications) {
      const category = app.category;
      
      let fixed = false;
      let newCategory = category;
      
      if (Array.isArray(category)) {
        newCategory = category[0] || "Artist";
        fixed = true;
      }

      if (fixed) {
        await ctx.db.patch(app._id, {
          category: newCategory,
          updatedAt: now(),
        });
        fixedApplications += 1;
      }
    }

    return {
      success: true,
      fixedCreators,
      fixedApplications,
      message: `Migration completed: fixed ${fixedCreators} creators and ${fixedApplications} applications`,
    };
  },
});
