export type Genre = "Action" | "Adventure" | "Fantasy" | "Romance" | "Drama" | "Comedy" | "Sci-Fi" | "Horror" | "Mystery" | "Thriller" | "Slice of Life" | "Historical" | "Supernatural" | "Sports" | "School Life" | "Psychological";
export type ContentType = "Manga" | "Manhwa" | "Manhua" | "Webtoon" | "Comic" | "Novel" | "Light Novel";
export type Format = ContentType;

export type PremiumState = "Free Reader" | "Premium Reader" | "Expired Premium" | "Trial Active";

export type CreatorAccessStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface CreatorApplication {
  id: string;
  userId: string;
  creatorName: string;
  category: "Artist" | "Writer" | "Illustrator" | "Studio" | "Animator";
  location: string;
  bio: string;
  portfolioLink: string;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    x?: string;
    sampleWork?: string;
  };
  dropsomethingUrl?: string;
  storyIntent: string;
  mainGenre: string;
  hasStoryReady: boolean;
  whyLemonade: string;
  submittedAt: string;
  status: CreatorAccessStatus;
  adminFeedback?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Reader {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  favoriteGenres: Genre[];
  readingStreak: number;
  totalChaptersRead: number;
  premiumStatus: PremiumState;
  role: "reader" | "creator";
  badges: string[]; // Badge IDs
  followedCreators: string[]; // Creator IDs
  supportHistory: SupportTransaction[];
}

export interface SupportTransaction {
  id: string;
  creatorId: string;
  amount: number;
  date: string;
  message?: string;
  timestamp?: string;
}

export interface GalleryItem {
  title: string;
  project: string;
  category: string;
  image: string;
}

export interface PortfolioAchievement {
  name: string;
  icon: string;
}

export interface CreatorActivity {
  type: 'release' | 'milestone' | 'artwork' | 'announcement';
  date: string;
  content: string;
}

export interface CollaborationStatus {
  openForCommissions: boolean;
  openForWriting: boolean;
  openForAnimation: boolean;
  openForBrand: boolean;
  openForStudio: boolean;
}

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  bio: string;
  category: "Artist" | "Writer" | "Studio";
  location?: string;
  totalReads: number;
  totalStories: number;
  dropsomethingUrl?: string;
  supportEnabled: boolean;
  isFollowed?: boolean; // Mock flag for current user state
  banner?: string;
  tagline?: string;
  fullBio?: string;
  creativeMission?: string;
  genres?: string[];
  style?: string;
  influences?: string[];
  languages?: string[];
  galleryItems?: GalleryItem[];
  achievements?: PortfolioAchievement[];
  collaborationStatus?: CollaborationStatus;
  recentActivity?: CreatorActivity[];
}

export interface Story {
  id: string;
  title: string;
  alternativeTitles?: string[];
  creator: Creator;
  genre: Genre | string;
  genres?: string[];
  format: ContentType | string;
  contentType?: ContentType;
  rating: number;
  ratingCount?: number;
  views: number;
  saves: number;
  followers?: number;
  episodes: number;
  synopsis: string;
  description?: string;
  coverImage: string;
  bannerImage: string;
  author?: string;
  artist?: string;
  releaseYear?: number;
  language?: string;
  tags: string[];
  isOriginal: boolean;
  publicationStatus?: "ongoing" | "completed" | "hiatus" | "cancelled";
  status?: 'draft' | 'published' | 'hidden' | 'archived';
  weeklyViews?: number;
  lastChapterAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const MOCK_NOTIFICATIONS = [
  { id: 1, type: "release", title: "New Chapter!", description: "Lagos 2099 Chapter 43 is out now.", time: "2 hours ago" },
  { id: 2, type: "reply", title: "Creator Replied", description: "Ovo Studios replied to your comment on Episode 42.", time: "5 hours ago" },
  { id: 3, type: "announcement", title: "Lemonade Originals", description: "Blood of Orisha is officially a Lemonade Original!", time: "1 day ago" },
];

export const MOCK_CREATORS: Record<string, Creator> = {
  ovo: { 
    id: "c1", 
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
    isFollowed: true,
    banner: "https://picsum.photos/seed/ovobanner/1500/500",
    tagline: "Exploring the intersections of African mythology and futuristic technology.",
    fullBio: "Ovo Studios is a creative collective focused on high-concept sci-fi and fantasy series rooted in African traditions. Founded in 2021, we aim to redefine the global perception of African creative output through cinematic storytelling and world-building.",
    creativeMission: "To bring neo-African perspectives to the global stage through premium visual storytelling.",
    genres: ["Sci-Fi", "Fantasy", "Action"],
    style: "Cinematic, High-Contrast, Detailed World-building",
    influences: ["Moebius", "Katsuhiro Otomo", "Ben Enwonwu", "Nnedi Okorafor"],
    languages: ["English", "Yoruba", "Pidgin"],
    galleryItems: [
      { title: "Lagos 2099 Concept Art", project: "Lagos 2099", category: "Concept Art", image: "https://picsum.photos/seed/ovo1/800/600" },
      { title: "Sunborn Character Sheet", project: "Sunborn", category: "Character Design", image: "https://picsum.photos/seed/ovo2/800/1000" },
      { title: "Corporate Citadel Interior", project: "Lagos 2099", category: "Background Art", image: "https://picsum.photos/seed/ovo3/1000/600" },
      { title: "Spirit Tech Sketch", project: "Sunborn", category: "Prop Design", image: "https://picsum.photos/seed/ovo4/800/800" },
    ],
    achievements: [
      { name: "Lemonade Original", icon: "✨" },
      { name: "1M Reads Club", icon: "🚀" },
      { name: "Top Supported", icon: "🏆" }
    ],
    collaborationStatus: {
      openForCommissions: false,
      openForWriting: true,
      openForAnimation: true,
      openForBrand: true,
      openForStudio: true
    },
    recentActivity: [
      { type: 'release', date: '2 days ago', content: 'Released Lagos 2099 Chapter 43' },
      { type: 'artwork', date: '5 days ago', content: 'Uploaded new character designs for project "Void Walker"' },
      { type: 'milestone', date: '1 week ago', content: 'Reached 1.4 Million total reads!' }
    ]
  },
  blackink: { 
    id: "c2", 
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
    isFollowed: false,
    banner: "https://picsum.photos/seed/blackinkb/1500/500",
    tagline: "Unfiltered stories from the heart of the Gidi.",
    fullBio: "Black Ink Lagos is dedicated to gritty, urban action stories. We focus on the raw energy of modern Africa, blending street culture with high-stakes drama.",
    creativeMission: "Telling the stories that others are too afraid to touch.",
    genres: ["Action", "Drama", "Mystery"],
    style: "Gritty, Realism, High Energy",
    galleryItems: [
      { title: "Neon Danfo Racer", project: "Neon Danfo", category: "Character Design", image: "https://picsum.photos/seed/bi1/800/1000" },
      { title: "Night Market Chase", project: "Neon Danfo", category: "Layout", image: "https://picsum.photos/seed/bi2/1000/600" },
    ],
    achievements: [
      { name: "Action Master", icon: "💥" },
      { name: "2M Reads Club", icon: "🔥" }
    ],
    collaborationStatus: {
      openForCommissions: true,
      openForWriting: false,
      openForAnimation: true,
      openForBrand: true,
      openForStudio: true
    },
    recentActivity: [
      { type: 'milestone', date: '1 day ago', content: 'Neon Danfo reached 2 million reads!' },
      { type: 'announcement', date: '4 days ago', content: 'New collaboration with Lagos Streetwear announced.' }
    ]
  },
  adaverse: { 
    id: "c3", 
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
    isFollowed: true,
    banner: "https://picsum.photos/seed/adaverseb/1500/500",
    tagline: "Where the ancestors breathe through every word.",
    fullBio: "Ada is a writer and world-builder currently exploring the vast lore of West African mythology. Her work spans across epic fantasy and magical realism, always centered on strong character arcs and rich cultural heritage.",
    creativeMission: "Preserving and reimagining African folklore for a modern audience.",
    genres: ["Fantasy", "Drama", "Romance"],
    style: "Lyrical, Mythic, Deeply Emotional",
    galleryItems: [
      { title: "Orisha Temple Concept", project: "Blood of Orisha", category: "World Building", image: "https://picsum.photos/seed/av1/1000/600" },
      { title: "Spirit Gate Sketch", project: "Ashes of Benin", category: "Concept Art", image: "https://picsum.photos/seed/av2/800/800" },
    ],
    achievements: [
      { name: "Mythology Expert", icon: "🔱" },
      { name: "Rising Creator", icon: "📈" }
    ],
    collaborationStatus: {
      openForCommissions: false,
      openForWriting: true,
      openForAnimation: false,
      openForBrand: false,
      openForStudio: true
    },
    recentActivity: [
      { type: 'release', date: '3 days ago', content: 'New episode of Blood of Orisha published.' },
      { type: 'milestone', date: '1 week ago', content: 'Shortlisted for the African Fantasy Award.' }
    ]
  },
  kemi: { 
    id: "c4", 
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
    isFollowed: false,
    banner: "https://picsum.photos/seed/kemib/1500/500",
    tagline: "Capturing the beauty in the everyday moments.",
    fullBio: "Kemi is an illustrator and comic artist based in Accra. She loves exploring human relationships, especially through the lens of urban life and modern romance.",
    creativeMission: "Creating soft, relatable stories that warm the heart.",
    genres: ["Romance", "Drama"],
    style: "Soft, Pastel, Expressive Characters",
    galleryItems: [
      { title: "Spirit Courier Cover", project: "The Spirit Courier", category: "Cover Art", image: "https://picsum.photos/seed/k1/800/1000" },
      { title: "Rainy Day in Accra", project: "Personal Work", category: "Illustration", image: "https://picsum.photos/seed/k2/1000/1000" },
    ],
    achievements: [
      { name: "Romance Queen", icon: "💖" },
      { name: "Fan Favorite", icon: "✨" }
    ],
    collaborationStatus: {
      openForCommissions: true,
      openForWriting: true,
      openForAnimation: false,
      openForBrand: true,
      openForStudio: false
    },
    recentActivity: [
      { type: 'artwork', date: '12 hours ago', content: 'New speedpaint uploaded to YouTube.' },
      { type: 'release', date: '2 days ago', content: 'The Spirit Courier Episode 8 is live.' }
    ]
  },
};

export const MOCK_BADGES: Record<string, Badge> = {
  b1: { id: "b1", name: "Early Adopter", icon: "🚀", description: "Joined during the beta phase." },
  b2: { id: "b2", name: "Binge Reader", icon: "📚", description: "Read 100 chapters." },
  b3: { id: "b3", name: "Supporter", icon: "💎", description: "Tipped 5 creators." },
  b4: { id: "b4", name: "Originals Fan", icon: "🍋", description: "Read 5 Lemonade Originals." },
};

export const MOCK_READERS: Record<string, Reader> = {
  current: {
    id: "r1",
    displayName: "Chidi Anu",
    username: "chidi_99",
    avatar: "https://picsum.photos/seed/chidi/200/200",
    bio: "Obsessed with cyberpunk danfos and fantasy epics.",
    favoriteGenres: ["Sci-Fi", "Fantasy"],
    readingStreak: 12,
    totalChaptersRead: 450,
    premiumStatus: "Premium Reader",
    badges: ["b1", "b2", "b4"],
    role: "reader", // or "creator"
    followedCreators: ["c1", "c3"],
    supportHistory: [
      { id: "st1", creatorId: "c1", amount: 10, date: "2024-10-01", message: "Love the new chapter!" },
      { id: "st2", creatorId: "c3", amount: 25, date: "2024-09-15" }
    ]
  }
};

export const MOCK_STORIES: Story[] = [
  {
    id: "s1",
    title: "Lagos 2099",
    creator: MOCK_CREATORS.ovo,
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action", "Thriller"],
    format: "Manga",
    contentType: "Manga",
    rating: 4.9,
    ratingCount: 12400,
    views: 1200000,
    saves: 45000,
    followers: 89000,
    episodes: 42,
    synopsis: "In a neon-drenched futuristic megacity, a rogue delivery driver uncovers a corporate conspiracy that threatens the entire West African union.",
    description: "A cyberpunk action thriller set in a futuristic Lagos.",
    coverImage: "https://picsum.photos/seed/lagos2099/600/800",
    bannerImage: "https://picsum.photos/seed/lagos2099banner/1200/600",
    author: "Ovo Studios",
    artist: "Ovo Studios",
    releaseYear: 2023,
    language: "English",
    tags: ["Cyberpunk", "Action", "Dystopian", "System"],
    isOriginal: true,
    publicationStatus: "ongoing",
    weeklyViews: 85000,
    lastChapterAt: "2025-05-28T00:00:00Z",
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2025-05-28T00:00:00Z",
  },
  {
    id: "s2",
    title: "Blood of Orisha",
    creator: MOCK_CREATORS.adaverse,
    genre: "Fantasy",
    genres: ["Fantasy", "Adventure", "Supernatural"],
    format: "Webtoon",
    contentType: "Webtoon",
    rating: 4.8,
    ratingCount: 8900,
    views: 890000,
    saves: 32000,
    followers: 56000,
    episodes: 15,
    synopsis: "When the gods are forced back to earth, a young warrior must gather the shattered pieces of their power before a dark cult consumes them.",
    description: "An epic fantasy inspired by Yoruba mythology.",
    coverImage: "https://picsum.photos/seed/orisha/600/800",
    bannerImage: "https://picsum.photos/seed/orishabanner/1200/600",
    author: "AdaVerse",
    artist: "AdaVerse",
    releaseYear: 2024,
    language: "English",
    tags: ["Fantasy", "Mythology", "Magic", "Reincarnation"],
    isOriginal: true,
    publicationStatus: "ongoing",
    weeklyViews: 62000,
    lastChapterAt: "2025-05-25T00:00:00Z",
    createdAt: "2024-03-10T00:00:00Z",
    updatedAt: "2025-05-25T00:00:00Z",
  },
  {
    id: "s3",
    title: "Neon Danfo",
    creator: MOCK_CREATORS.blackink,
    genre: "Action",
    genres: ["Action", "Sci-Fi", "Sports"],
    format: "Manhwa",
    contentType: "Manhwa",
    rating: 4.9,
    ratingCount: 21000,
    views: 2100000,
    saves: 89000,
    followers: 134000,
    episodes: 104,
    synopsis: "A high-octane racing series about the underground hover-danfo races in the sprawling metropolis.",
    description: "Street racing meets sci-fi in this action-packed series.",
    coverImage: "https://picsum.photos/seed/danfo/600/800",
    bannerImage: "https://picsum.photos/seed/danfobanner/1200/600",
    author: "Black Ink Lagos",
    artist: "Black Ink Lagos",
    releaseYear: 2022,
    language: "English",
    tags: ["Racing", "Sci-Fi", "Tournament", "Anti-Hero"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 120000,
    lastChapterAt: "2025-05-29T00:00:00Z",
    createdAt: "2022-06-01T00:00:00Z",
    updatedAt: "2025-05-29T00:00:00Z",
  },
  {
    id: "s4",
    title: "The Spirit Courier",
    creator: MOCK_CREATORS.kemi,
    genre: "Romance",
    genres: ["Romance", "Supernatural", "Mystery"],
    format: "Novel",
    contentType: "Novel",
    rating: 4.6,
    ratingCount: 3400,
    views: 340000,
    saves: 12000,
    followers: 24000,
    episodes: 8,
    synopsis: "A medium who delivers messages for ghosts falls in love with a spirit who doesn't know how he died.",
    description: "A slow-burn supernatural romance.",
    coverImage: "https://picsum.photos/seed/spirit/600/800",
    bannerImage: "https://picsum.photos/seed/spiritbanner/1200/600",
    author: "Kemi Draws",
    releaseYear: 2025,
    language: "English",
    tags: ["Romance", "Supernatural", "Mystery", "Slow Burn"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 28000,
    lastChapterAt: "2025-05-20T00:00:00Z",
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-05-20T00:00:00Z",
  },
  {
    id: "s5",
    title: "Ashes of Benin",
    creator: MOCK_CREATORS.adaverse,
    genre: "Historical",
    genres: ["Historical", "Action", "Fantasy"],
    format: "Manga",
    contentType: "Manga",
    rating: 4.7,
    ratingCount: 4500,
    views: 450000,
    saves: 18000,
    followers: 35000,
    episodes: 22,
    synopsis: "A historical fantasy following the legendary guards of the ancient kingdom during its greatest crisis.",
    description: "Epic historical fantasy rooted in the Benin Empire.",
    coverImage: "https://picsum.photos/seed/ashes/600/800",
    bannerImage: "https://picsum.photos/seed/ashesbanner/1200/600",
    author: "AdaVerse",
    artist: "AdaVerse",
    releaseYear: 2023,
    language: "English",
    tags: ["Historical", "Action", "War", "Kingdom Building"],
    isOriginal: true,
    publicationStatus: "ongoing",
    weeklyViews: 35000,
    lastChapterAt: "2025-05-22T00:00:00Z",
    createdAt: "2023-08-20T00:00:00Z",
    updatedAt: "2025-05-22T00:00:00Z",
  },
  {
    id: "s6",
    title: "Sunborn",
    creator: MOCK_CREATORS.ovo,
    genre: "Fantasy",
    genres: ["Fantasy", "Action", "Adventure"],
    format: "Manhwa",
    contentType: "Manhwa",
    rating: 4.8,
    ratingCount: 6700,
    views: 670000,
    saves: 25000,
    followers: 48000,
    episodes: 34,
    synopsis: "A boy discovers he is the last vessel of the Sun God, and must train to master the solar flames.",
    description: "A power fantasy with deep lore and stunning art.",
    coverImage: "https://picsum.photos/seed/sunborn/600/800",
    bannerImage: "https://picsum.photos/seed/sunbornbanner/1200/600",
    author: "Ovo Studios",
    artist: "Ovo Studios",
    releaseYear: 2023,
    language: "English",
    tags: ["Superpowers", "Tournament", "Action", "Overpowered MC"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 45000,
    lastChapterAt: "2025-05-27T00:00:00Z",
    createdAt: "2023-04-10T00:00:00Z",
    updatedAt: "2025-05-27T00:00:00Z",
  },
  {
    id: "s7",
    title: "Tower of Shadows",
    creator: MOCK_CREATORS.blackink,
    genre: "Action",
    genres: ["Action", "Fantasy", "Thriller"],
    format: "Manhwa",
    contentType: "Manhwa",
    rating: 4.7,
    ratingCount: 9800,
    views: 980000,
    saves: 41000,
    followers: 72000,
    episodes: 67,
    synopsis: "A disgraced hunter enters a mysterious tower that promises power to those who survive its deadly floors.",
    description: "A tower-climbing action fantasy with a regression twist.",
    coverImage: "https://picsum.photos/seed/towershadow/600/800",
    bannerImage: "https://picsum.photos/seed/towershadowbanner/1200/600",
    author: "Black Ink Lagos",
    artist: "Black Ink Lagos",
    releaseYear: 2022,
    language: "English",
    tags: ["Tower", "Hunter", "Regression", "Dungeon", "Overpowered MC"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 72000,
    lastChapterAt: "2025-05-29T00:00:00Z",
    createdAt: "2022-11-01T00:00:00Z",
    updatedAt: "2025-05-29T00:00:00Z",
  },
  {
    id: "s8",
    title: "Crimson Murim",
    creator: MOCK_CREATORS.adaverse,
    genre: "Action",
    genres: ["Action", "Historical", "Fantasy"],
    format: "Manhua",
    contentType: "Manhua",
    rating: 4.5,
    ratingCount: 3200,
    views: 280000,
    saves: 11000,
    followers: 19000,
    episodes: 45,
    synopsis: "An outcast martial artist discovers a forbidden cultivation technique that could reshape the martial world.",
    description: "A cultivation epic with stunning fight choreography.",
    coverImage: "https://picsum.photos/seed/crimsonmurim/600/800",
    bannerImage: "https://picsum.photos/seed/crimsonmurimbanner/1200/600",
    author: "AdaVerse",
    artist: "AdaVerse",
    releaseYear: 2023,
    language: "English",
    tags: ["Murim", "Cultivation", "Wuxia", "Xianxia", "Anti-Hero"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 22000,
    lastChapterAt: "2025-05-26T00:00:00Z",
    createdAt: "2023-06-15T00:00:00Z",
    updatedAt: "2025-05-26T00:00:00Z",
  },
  {
    id: "s9",
    title: "My Villainess Academy Life",
    creator: MOCK_CREATORS.kemi,
    genre: "Romance",
    genres: ["Romance", "Fantasy", "Comedy", "School Life"],
    format: "Webtoon",
    contentType: "Webtoon",
    rating: 4.4,
    ratingCount: 5600,
    views: 520000,
    saves: 22000,
    followers: 41000,
    episodes: 28,
    synopsis: "Reborn as the villainess of her favorite game, she must avoid all death flags and maybe find love along the way.",
    description: "A comedic isekai romance with gorgeous art.",
    coverImage: "https://picsum.photos/seed/villainess/600/800",
    bannerImage: "https://picsum.photos/seed/villainessbanner/1200/600",
    author: "Kemi Draws",
    artist: "Kemi Draws",
    releaseYear: 2024,
    language: "English",
    tags: ["Villainess", "Isekai", "Reincarnation", "Enemies to Lovers", "Fantasy Romance"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 38000,
    lastChapterAt: "2025-05-28T00:00:00Z",
    createdAt: "2024-02-14T00:00:00Z",
    updatedAt: "2025-05-28T00:00:00Z",
  },
  {
    id: "s10",
    title: "The Last Necromancer",
    creator: MOCK_CREATORS.ovo,
    genre: "Horror",
    genres: ["Horror", "Fantasy", "Thriller"],
    format: "Comic",
    contentType: "Comic",
    rating: 4.6,
    ratingCount: 2800,
    views: 310000,
    saves: 14000,
    followers: 22000,
    episodes: 18,
    synopsis: "In a world where necromancy is outlawed, the last practitioner must choose between power and humanity.",
    description: "A dark fantasy horror with stunning ink work.",
    coverImage: "https://picsum.photos/seed/necromancer/600/800",
    bannerImage: "https://picsum.photos/seed/necromancerbanner/1200/600",
    author: "Ovo Studios",
    artist: "Ovo Studios",
    releaseYear: 2024,
    language: "English",
    tags: ["Necromancer", "Dark Fantasy", "Anti-Hero", "Post-Apocalyptic"],
    isOriginal: true,
    publicationStatus: "ongoing",
    weeklyViews: 18000,
    lastChapterAt: "2025-05-24T00:00:00Z",
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2025-05-24T00:00:00Z",
  },
  {
    id: "s11",
    title: "Solo Leveling: Rebirth",
    creator: MOCK_CREATORS.blackink,
    genre: "Action",
    genres: ["Action", "Fantasy", "Adventure"],
    format: "Manhwa",
    contentType: "Manhwa",
    rating: 4.9,
    ratingCount: 45000,
    views: 3200000,
    saves: 156000,
    followers: 280000,
    episodes: 180,
    synopsis: "The weakest hunter awakens a mysterious system that lets him level up without limit.",
    description: "The iconic power fantasy that defined a generation of manhwa.",
    coverImage: "https://picsum.photos/seed/sololeveling/600/800",
    bannerImage: "https://picsum.photos/seed/sololevelingbanner/1200/600",
    author: "Chugong",
    artist: "Dubu (Redice Studio)",
    releaseYear: 2018,
    language: "Korean",
    tags: ["System", "Hunter", "Dungeon", "Overpowered MC", "Monster Evolution"],
    isOriginal: false,
    publicationStatus: "completed",
    weeklyViews: 180000,
    lastChapterAt: "2025-01-15T00:00:00Z",
    createdAt: "2018-03-04T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "s12",
    title: "Hearts in Bloom",
    creator: MOCK_CREATORS.kemi,
    genre: "Slice of Life",
    genres: ["Slice of Life", "Romance", "Drama"],
    format: "Webtoon",
    contentType: "Webtoon",
    rating: 4.3,
    ratingCount: 1900,
    views: 180000,
    saves: 8500,
    followers: 15000,
    episodes: 12,
    synopsis: "Two baristas at rival coffee shops slowly fall for each other through stolen glances and shared playlists.",
    description: "A cozy, heartwarming romance set in Accra.",
    coverImage: "https://picsum.photos/seed/heartsbloom/600/800",
    bannerImage: "https://picsum.photos/seed/heartsbloombanner/1200/600",
    author: "Kemi Draws",
    artist: "Kemi Draws",
    releaseYear: 2025,
    language: "English",
    tags: ["Slow Burn", "Friends to Lovers", "Slice of Life"],
    isOriginal: true,
    publicationStatus: "ongoing",
    weeklyViews: 15000,
    lastChapterAt: "2025-05-27T00:00:00Z",
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-05-27T00:00:00Z",
  },
  {
    id: "s13",
    title: "Sword of the Regressor",
    creator: MOCK_CREATORS.adaverse,
    genre: "Fantasy",
    genres: ["Fantasy", "Action", "Adventure"],
    format: "Light Novel",
    contentType: "Light Novel",
    rating: 4.7,
    ratingCount: 4100,
    views: 390000,
    saves: 17000,
    followers: 31000,
    episodes: 85,
    synopsis: "After failing to save the world, the hero is sent back 10 years with all his memories intact.",
    description: "A gripping regression light novel with deep character development.",
    coverImage: "https://picsum.photos/seed/regressor/600/800",
    bannerImage: "https://picsum.photos/seed/regressorbanner/1200/600",
    author: "AdaVerse",
    releaseYear: 2023,
    language: "English",
    tags: ["Regression", "Reincarnation", "Overpowered MC", "Game World"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 25000,
    lastChapterAt: "2025-05-26T00:00:00Z",
    createdAt: "2023-09-12T00:00:00Z",
    updatedAt: "2025-05-26T00:00:00Z",
  },
  {
    id: "s14",
    title: "Dungeon Eater",
    creator: MOCK_CREATORS.blackink,
    genre: "Thriller",
    genres: ["Thriller", "Action", "Horror"],
    format: "Manhwa",
    contentType: "Manhwa",
    rating: 4.5,
    ratingCount: 6300,
    views: 580000,
    saves: 27000,
    followers: 44000,
    episodes: 52,
    synopsis: "A team of elite hunters enters an S-rank dungeon that has never been cleared — and it's alive.",
    description: "A claustrophobic dungeon thriller with brutal action.",
    coverImage: "https://picsum.photos/seed/dungeoneater/600/800",
    bannerImage: "https://picsum.photos/seed/dungeoneaterbanner/1200/600",
    author: "Black Ink Lagos",
    artist: "Black Ink Lagos",
    releaseYear: 2023,
    language: "English",
    tags: ["Dungeon", "Hunter", "Monster Evolution", "Anti-Hero"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 42000,
    lastChapterAt: "2025-05-28T00:00:00Z",
    createdAt: "2023-05-20T00:00:00Z",
    updatedAt: "2025-05-28T00:00:00Z",
  },
  {
    id: "s15",
    title: "The Emperor's Second Chance",
    creator: MOCK_CREATORS.adaverse,
    genre: "Romance",
    genres: ["Romance", "Historical", "Drama"],
    format: "Novel",
    contentType: "Novel",
    rating: 4.8,
    ratingCount: 7200,
    views: 620000,
    saves: 29000,
    followers: 51000,
    episodes: 95,
    synopsis: "A deposed empress is given a second chance at life — and love — in a kingdom that once condemned her.",
    description: "A sweeping historical romance with political intrigue.",
    coverImage: "https://picsum.photos/seed/emperor/600/800",
    bannerImage: "https://picsum.photos/seed/emperorbanner/1200/600",
    author: "AdaVerse",
    releaseYear: 2022,
    language: "English",
    tags: ["Second Chance Romance", "Historical Romance", "Villainess", "Regression"],
    isOriginal: false,
    publicationStatus: "completed",
    weeklyViews: 32000,
    lastChapterAt: "2024-12-01T00:00:00Z",
    createdAt: "2022-08-15T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "s16",
    title: "Virtual Ascension",
    creator: MOCK_CREATORS.ovo,
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action", "Adventure"],
    format: "Manhwa",
    contentType: "Manhwa",
    rating: 4.4,
    ratingCount: 2100,
    views: 220000,
    saves: 9800,
    followers: 17000,
    episodes: 30,
    synopsis: "Trapped in a VRMMO, a player discovers the game's AI is evolving beyond its programming.",
    description: "A sci-fi thriller exploring the boundary between game and reality.",
    coverImage: "https://picsum.photos/seed/virtualasc/600/800",
    bannerImage: "https://picsum.photos/seed/virtualascbanner/1200/600",
    author: "Ovo Studios",
    artist: "Ovo Studios",
    releaseYear: 2024,
    language: "English",
    tags: ["Virtual Reality", "Game World", "System", "Overpowered MC"],
    isOriginal: true,
    publicationStatus: "ongoing",
    weeklyViews: 16000,
    lastChapterAt: "2025-05-25T00:00:00Z",
    createdAt: "2024-07-01T00:00:00Z",
    updatedAt: "2025-05-25T00:00:00Z",
  },
  {
    id: "s17",
    title: "Psychic High School",
    creator: MOCK_CREATORS.kemi,
    genre: "School Life",
    genres: ["School Life", "Supernatural", "Comedy"],
    format: "Webtoon",
    contentType: "Webtoon",
    rating: 4.2,
    ratingCount: 1500,
    views: 145000,
    saves: 6200,
    followers: 11000,
    episodes: 16,
    synopsis: "Every student at this academy has a psychic ability — except the new transfer student who might be the most powerful of all.",
    description: "A supernatural school-life comedy with heart.",
    coverImage: "https://picsum.photos/seed/psychicschool/600/800",
    bannerImage: "https://picsum.photos/seed/psychicschoolbanner/1200/600",
    author: "Kemi Draws",
    artist: "Kemi Draws",
    releaseYear: 2025,
    language: "English",
    tags: ["School Life", "Supernatural", "Comedy", "Overpowered MC"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 12000,
    lastChapterAt: "2025-05-23T00:00:00Z",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-05-23T00:00:00Z",
  },
  {
    id: "s18",
    title: "The System Awakens",
    creator: MOCK_CREATORS.blackink,
    genre: "Action",
    genres: ["Action", "Fantasy", "Sci-Fi"],
    format: "Manhwa",
    contentType: "Manhwa",
    rating: 4.6,
    ratingCount: 8900,
    views: 870000,
    saves: 38000,
    followers: 65000,
    episodes: 78,
    synopsis: "When monsters appear through gates across the world, ordinary office workers awaken to a mysterious leveling system.",
    description: "A fast-paced system apocalypse story.",
    coverImage: "https://picsum.photos/seed/systemawakens/600/800",
    bannerImage: "https://picsum.photos/seed/systemawakensbanner/1200/600",
    author: "Black Ink Lagos",
    artist: "Black Ink Lagos",
    releaseYear: 2022,
    language: "English",
    tags: ["System", "Hunter", "Post-Apocalyptic", "Tower"],
    isOriginal: false,
    publicationStatus: "ongoing",
    weeklyViews: 55000,
    lastChapterAt: "2025-05-29T00:00:00Z",
    createdAt: "2022-09-01T00:00:00Z",
    updatedAt: "2025-05-29T00:00:00Z",
  },
];
