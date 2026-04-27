export type Genre = "Action" | "Romance" | "Horror" | "Sci-Fi & Cyberpunk" | "African Fantasy" | "Drama" | "Mystery";
export type Format = "Manga" | "Manhwa" | "Webcomic" | "Novel";

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
  creator: Creator;
  genre: Genre;
  format: Format;
  rating: number;
  views: number;
  saves: number;
  episodes: number;
  synopsis: string;
  coverImage: string;
  bannerImage: string;
  tags: string[];
  isOriginal: boolean;
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
    genres: ["Sci-Fi & Cyberpunk", "African Fantasy", "Action"],
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
    genres: ["African Fantasy", "Drama", "Romance"],
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
    favoriteGenres: ["Sci-Fi & Cyberpunk", "African Fantasy"],
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
  },
  {
    id: "s2",
    title: "Blood of Orisha",
    creator: MOCK_CREATORS.adaverse,
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
  },
  {
    id: "s3",
    title: "Neon Danfo",
    creator: MOCK_CREATORS.blackink,
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
  },
  {
    id: "s4",
    title: "The Spirit Courier",
    creator: MOCK_CREATORS.kemi,
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
  },
  {
    id: "s5",
    title: "Ashes of Benin",
    creator: MOCK_CREATORS.adaverse,
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
  },
  {
    id: "s6",
    title: "Sunborn",
    creator: MOCK_CREATORS.ovo,
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
  }
];
