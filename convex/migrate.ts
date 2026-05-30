import { mutation } from "./_generated/server";

/**
 * Data migration: Fix category field in creators table.
 * Converts any array values like ["Artist"] back to single strings "Artist".
 */
export const fixCategoryFields = mutation({
  args: {},
  handler: async (ctx) => {
    const now = () => new Date().toISOString();
    let fixedCreators = 0;

    // Fix creators table - category should be a single string, not an array
    const creators = await ctx.db.query("creators").collect();
    for (const creator of creators) {
      const category = creator.category;

      // If category is an array, unwrap it to first element or default to "Artist"
      if (Array.isArray(category)) {
        const newCategory = (category[0] as string) || "Artist";
        await ctx.db.patch(creator._id, {
          category: newCategory as unknown as "Artist" | "Writer" | "Studio",
          updatedAt: now(),
        });
        fixedCreators += 1;
      }
    }

    return {
      success: true,
      fixedCreators,
      message: `Migration completed: fixed ${fixedCreators} creators`,
    };
  },
});
