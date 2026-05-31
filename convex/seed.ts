import { mutation } from "./_generated/server";

const timestamp = () => new Date().toISOString();

const creators = [
  {
    externalId: "c1",
    name: "Ovo Studios",
    username: "ovo_studios",
    avatar: "https://picsum.photos/seed/ovo/200/200",
    followers: 12500,
    bio: "Building neo-African sci-fi worlds.",
    category: "Studio",
    location: "Lagos, Nigeria",
    totalReads: 1450000,
    totalStories: 5,
    dropsomethingUrl: "ovo_studios",
    supportEnabled: true,
    profile: {
      banner: "https://picsum.photos/seed/ovobanner/1500/500",
      tagline: "Exploring the intersections of African mythology and futuristic technology.",
      fullBio: "Ovo Studios is a creative collective focused on high-concept sci-fi and fantasy series rooted in African traditions.",
      creativeMission: "To bring neo-African perspectives to the global stage through premium visual storytelling.",
      genres: ["Sci-Fi & Cyberpunk", "African Fantasy", "Action"],
      style: "Cinematic, High-Contrast, Detailed World-building",
      influences: ["Moebius", "Katsuhiro Otomo", "Ben Enwonwu", "Nnedi Okorafor"],
      languages: ["English", "Yoruba", "Pidgin"],
    },
  },
  {
    externalId: "c2",
    name: "Black Ink Lagos",
    username: "blackink",
    avatar: "https://picsum.photos/seed/blackink/200/200",
    followers: 8400,
    bio: "Action. Drama. Real lagos grit.",
    category: "Studio",
    location: "Lagos, Nigeria",
    totalReads: 2100000,
    totalStories: 2,
    dropsomethingUrl: "blackink",
    supportEnabled: true,
    profile: {
      banner: "https://picsum.photos/seed/blackinkb/1500/500",
      tagline: "Unfiltered stories from the heart of the Gidi.",
      fullBio: "Black Ink Lagos is dedicated to gritty, urban action stories with modern African energy.",
      creativeMission: "Telling the stories that others are too afraid to touch.",
      genres: ["Action", "Drama", "Mystery"],
      style: "Gritty, Realism, High Energy",
    },
  },
  {
    externalId: "c3",
    name: "AdaVerse",
    username: "adaverse",
    avatar: "https://picsum.photos/seed/adaverse/200/200",
    followers: 32000,
    bio: "Fantasy worlds inspired by Igbo mythology.",
    category: "Writer",
    location: "Enugu, Nigeria",
    totalReads: 1340000,
    totalStories: 8,
    dropsomethingUrl: "adaverse",
    supportEnabled: true,
    profile: {
      banner: "https://picsum.photos/seed/adaverseb/1500/500",
      tagline: "Where the ancestors breathe through every word.",
      fullBio: "Ada is a writer and world-builder exploring West African mythology, epic fantasy, and magical realism.",
      creativeMission: "Preserving and reimagining African folklore for a modern audience.",
      genres: ["African Fantasy", "Drama", "Romance"],
      style: "Lyrical, Mythic, Deeply Emotional",
    },
  },
  {
    externalId: "c4",
    name: "Kemi Draws",
    username: "kemidraws",
    avatar: "https://picsum.photos/seed/kemi/200/200",
    followers: 4500,
    bio: "Romance and slice of life.",
    category: "Artist",
    location: "Accra, Ghana",
    totalReads: 340000,
    totalStories: 3,
    dropsomethingUrl: "",
    supportEnabled: false,
    profile: {
      banner: "https://picsum.photos/seed/kemib/1500/500",
      tagline: "Capturing the beauty in the everyday moments.",
      fullBio: "Kemi is an illustrator and comic artist based in Accra, exploring urban life and modern romance.",
      creativeMission: "Creating soft, relatable stories that warm the heart.",
      genres: ["Romance", "Drama"],
      style: "Soft, Pastel, Expressive Characters",
    },
  },
];

const stories = [
  {
    externalId: "s1",
    title: "Lagos 2099",
    creatorId: "c1",
    creatorUsername: "ovo_studios",
    genre: "Sci-Fi & Cyberpunk",
    format: "Manga",
    rating: 4.9,
    views: 1200000,
    saves: 45000,
    episodes: 42,
    synopsis: "In a neon-drenched futuristic megacity, a rogue delivery driver uncovers a corporate conspiracy that threatens the entire West African union.",
    coverImage: "https://picsum.photos/seed/lagos2099/600/800",
    bannerImage: "https://picsum.photos/seed/lagos2099banner/1200/600",
    tags: ["Cyberpunk", "Action", "Dystopian"],
    isOriginal: true,
    isFeatured: true,
  },
  {
    externalId: "s2",
    title: "Blood of Orisha",
    creatorId: "c3",
    creatorUsername: "adaverse",
    genre: "African Fantasy",
    format: "Webcomic",
    rating: 4.8,
    views: 890000,
    saves: 32000,
    episodes: 15,
    synopsis: "When the gods are forced back to earth, a young warrior must gather the shattered pieces of their power before a dark cult consumes them.",
    coverImage: "https://picsum.photos/seed/orisha/600/800",
    bannerImage: "https://picsum.photos/seed/orishabanner/1200/600",
    tags: ["Fantasy", "Mythology", "Magic"],
    isOriginal: true,
    isFeatured: true,
  },
  {
    externalId: "s3",
    title: "Neon Danfo",
    creatorId: "c2",
    creatorUsername: "blackink",
    genre: "Action",
    format: "Manhwa",
    rating: 4.9,
    views: 2100000,
    saves: 89000,
    episodes: 104,
    synopsis: "A high-octane racing series about the underground hover-danfo races in the sprawling metropolis.",
    coverImage: "https://picsum.photos/seed/danfo/600/800",
    bannerImage: "https://picsum.photos/seed/danfobanner/1200/600",
    tags: ["Racing", "Sci-Fi", "Tournament"],
    isOriginal: false,
    isFeatured: false,
  },
  {
    externalId: "s4",
    title: "The Spirit Courier",
    creatorId: "c4",
    creatorUsername: "kemidraws",
    genre: "Romance",
    format: "Novel",
    rating: 4.6,
    views: 340000,
    saves: 12000,
    episodes: 8,
    synopsis: "A medium who delivers messages for ghosts falls in love with a spirit who doesn't know how he died.",
    coverImage: "https://picsum.photos/seed/spirit/600/800",
    bannerImage: "https://picsum.photos/seed/spiritbanner/1200/600",
    tags: ["Romance", "Supernatural", "Mystery"],
    isOriginal: false,
    isFeatured: false,
  },
  {
    externalId: "s5",
    title: "Ashes of Benin",
    creatorId: "c3",
    creatorUsername: "adaverse",
    genre: "Action",
    format: "Manga",
    rating: 4.7,
    views: 450000,
    saves: 18000,
    episodes: 22,
    synopsis: "A historical fantasy following the legendary guards of the ancient kingdom during its greatest crisis.",
    coverImage: "https://picsum.photos/seed/ashes/600/800",
    bannerImage: "https://picsum.photos/seed/ashesbanner/1200/600",
    tags: ["Historical", "Action", "War"],
    isOriginal: true,
    isFeatured: false,
  },
  {
    externalId: "s6",
    title: "Sunborn",
    creatorId: "c1",
    creatorUsername: "ovo_studios",
    genre: "African Fantasy",
    format: "Manhwa",
    rating: 4.8,
    views: 670000,
    saves: 25000,
    episodes: 34,
    synopsis: "A boy discovers he is the last vessel of the Sun God, and must train to master the solar flames.",
    coverImage: "https://picsum.photos/seed/sunborn/600/800",
    bannerImage: "https://picsum.photos/seed/sunbornbanner/1200/600",
    tags: ["Superpowers", "Tournament", "Action"],
    isOriginal: false,
    isFeatured: false,
  },
];

export const initialContent = mutation({
  args: {},
  handler: async (ctx) => {
    const now = timestamp();
    let creatorsInserted = 0;
    let storiesInserted = 0;

    for (const creator of creators) {
      const existing = await ctx.db
        .query("creators")
        .withIndex("by_username", (q) => q.eq("username", creator.username))
        .unique();

      if (!existing) {
        await ctx.db.insert("creators", {
          ...creator,
          category: Array.isArray(creator.category) ? creator.category : [creator.category],
          createdAt: now,
          updatedAt: now,
        });
        creatorsInserted += 1;
      }
    }

    for (const story of stories) {
      const existing = await ctx.db
        .query("stories")
        .withIndex("by_externalId", (q) => q.eq("externalId", story.externalId))
        .unique();

      if (!existing) {
        await ctx.db.insert("stories", {
          ...story,
          status: "published",
          createdAt: now,
          updatedAt: now,
        });
        storiesInserted += 1;
      }
    }

    const existingMissions = await ctx.db.query("missionsCatalog").collect();
    if (existingMissions.length === 0) {
      const missions = [
        { missionId: "read_5_chapters", title: "Chapter Explorer", description: "Read 5 chapters this week to build your habit.", type: "read_chapters", target: 5, coinReward: 50, xpReward: 100, period: "weekly" },
        { missionId: "read_60_minutes", title: "Deep Dive", description: "Spend 60 minutes reading this week.", type: "read_minutes", target: 60, coinReward: 75, xpReward: 150, period: "weekly" },
        { missionId: "complete_1_story", title: "Finisher", description: "Complete 1 full story this week.", type: "complete_stories", target: 1, coinReward: 100, xpReward: 200, period: "weekly" },
        { missionId: "leave_3_comments", title: "Conversationalist", description: "Leave 3 meaningful comments this week.", type: "leave_comments", target: 3, coinReward: 40, xpReward: 80, period: "weekly" },
        { missionId: "daily_login_bonus", title: "Daily Visitor", description: "Log in every day to maintain your streak.", type: "daily_login", target: 7, coinReward: 35, xpReward: 70, period: "daily" },
      ];

      for (const mission of missions) {
        await ctx.db.insert("missionsCatalog", {
          ...mission,
          active: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const existingAchievements = await ctx.db.query("achievementsCatalog").collect();
    if (existingAchievements.length === 0) {
      const achievements = [
        { achievementId: "new_reader", name: "New Reader", description: "Read your first chapters.", criteria: { chaptersRead: 1 }, xpReward: 10, coinReward: 5, icon: "📖" },
        { achievementId: "bookworm", name: "Bookworm", description: "Read 50 chapters.", criteria: { chaptersRead: 50 }, xpReward: 50, coinReward: 25, icon: "🐛" },
        { achievementId: "story_sage", name: "Story Sage", description: "Complete 5 stories.", criteria: { storiesCompleted: 5 }, xpReward: 150, coinReward: 75, icon: "📚" },
        { achievementId: "legend_reader", name: "Legend Reader", description: "Reach a 30-day streak.", criteria: { streakDays: 30 }, xpReward: 300, coinReward: 150, icon: "👑" },
        { achievementId: "story_critic", name: "Story Critic", description: "Leave 20 high-quality comments.", criteria: { qualityComments: 20 }, xpReward: 100, coinReward: 50, icon: "✍️" },
      ];

      for (const achievement of achievements) {
        await ctx.db.insert("achievementsCatalog", {
          ...achievement,
          active: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const existingRewards = await ctx.db.query("marketplaceRewards").collect();
    if (existingRewards.length === 0) {
      const rewards = [
        { rewardId: "r_100_coins", name: "100 Lemon Coins Pack", description: "Instant 100 Lemon Coins boost for your account.", type: "lemon_coins", coinPrice: 0, stock: 0, active: true, requiresApproval: false },
        { rewardId: "r_1day_premium", name: "1-Day Premium Pass", description: "Enjoy ad-free reading for 24 hours.", type: "premium", coinPrice: 500, stock: 100, active: true, requiresApproval: false },
        { rewardId: "r_500_airtime", name: "₦500 Airtime", description: "Get ₦500 mobile airtime credited to your number.", type: "airtime", coinPrice: 800, stock: 50, active: true, requiresApproval: true },
        { rewardId: "r_1gb_data", name: "1GB Data Bundle", description: "1GB mobile data for any network.", type: "data", coinPrice: 1200, stock: 30, active: true, requiresApproval: true },
        { rewardId: "r_amazon_5", name: "$5 Amazon Gift Card", description: "$5 Amazon e-gift card delivered to your email.", type: "gift_card", coinPrice: 5000, stock: 20, active: true, requiresApproval: true },
        { rewardId: "r_mystery_box_small", name: "Lemon Mystery Box", description: "A surprise pack with bonuses, cosmetics, or coins.", type: "mystery_box", coinPrice: 300, stock: 200, active: true, requiresApproval: false },
      ];

      for (const reward of rewards) {
        await ctx.db.insert("marketplaceRewards", {
          ...reward,
          reserved: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { creatorsInserted, storiesInserted };
  },
});
