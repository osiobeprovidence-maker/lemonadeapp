export type Genre =
  | "Action"
  | "Adventure"
  | "Fantasy"
  | "Romance"
  | "Drama"
  | "Comedy"
  | "Sci-Fi"
  | "Horror"
  | "Mystery"
  | "Thriller"
  | "Slice of Life"
  | "Historical"
  | "Supernatural"
  | "Sports"
  | "School Life"
  | "Psychological";

export type ModernFantasyTag =
  | "System"
  | "Regression"
  | "Reincarnation"
  | "Isekai"
  | "Villainess"
  | "Dungeon"
  | "Tower"
  | "Hunter"
  | "Necromancer"
  | "Murim"
  | "Cultivation"
  | "Wuxia"
  | "Xianxia"
  | "Kingdom Building"
  | "Post-Apocalyptic"
  | "Monster Evolution"
  | "Virtual Reality"
  | "Game World"
  | "Overpowered MC"
  | "Anti-Hero";

export type RomanceTag =
  | "Slow Burn"
  | "Enemies to Lovers"
  | "Friends to Lovers"
  | "Second Chance Romance"
  | "Fantasy Romance"
  | "Historical Romance";

export type ContentType =
  | "Manga"
  | "Manhwa"
  | "Manhua"
  | "Webtoon"
  | "Comic"
  | "Novel"
  | "Light Novel";

export type PublicationStatus = "ongoing" | "completed" | "hiatus" | "cancelled";

export type Format = ContentType; // Backward compat alias

export type PremiumState = "Free Reader" | "Premium Reader" | "Expired Premium" | "Trial Active";

export type CreatorAccessStatus = 'none' | 'pending' | 'needs_info' | 'approved' | 'rejected';

export const ALL_GENRES: Genre[] = [
  "Action", "Adventure", "Fantasy", "Romance", "Drama", "Comedy",
  "Sci-Fi", "Horror", "Mystery", "Thriller", "Slice of Life", "Historical",
  "Supernatural", "Sports", "School Life", "Psychological",
];

export const ALL_MODERN_FANTASY_TAGS: ModernFantasyTag[] = [
  "System", "Regression", "Reincarnation", "Isekai", "Villainess",
  "Dungeon", "Tower", "Hunter", "Necromancer", "Murim", "Cultivation",
  "Wuxia", "Xianxia", "Kingdom Building", "Post-Apocalyptic",
  "Monster Evolution", "Virtual Reality", "Game World", "Overpowered MC", "Anti-Hero",
];

export const ALL_ROMANCE_TAGS: RomanceTag[] = [
  "Slow Burn", "Enemies to Lovers", "Friends to Lovers",
  "Second Chance Romance", "Fantasy Romance", "Historical Romance",
];

export const ALL_CONTENT_TYPES: ContentType[] = [
  "Manga", "Manhwa", "Manhua", "Webtoon", "Comic", "Novel", "Light Novel",
];

export interface CreatorApplication {
  id: string;
  userId: string;
  creatorName: string;
  fullName?: string;
  email?: string;
  socialUsername?: string;
  category: "Artist" | "Writer" | "Illustrator" | "Studio" | "Animator";
  location: string;
  bio: string;
  portfolioLink: string;
  portfolioUrl?: string;
  sampleWorkUrl?: string;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    x?: string;
    sampleWork?: string;
  };
  dropsomethingUrl?: string;
  studioMode?: 'solo' | 'existing' | 'new';
  studioName?: string;
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
  badges: string[];
  followedCreators: string[];
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

export interface StudioMember {
  userId: string;
  username: string;
  name: string;
  role: string; // e.g. "Artist", "Writer", "Editor", "Founder"
}

export interface StoryCredit {
  role: string; // e.g. "Story by", "Art by", "Colorist", "Editor", "Letterer"
  name: string;
  userId?: string;
  username?: string;
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
  isFollowed?: boolean;
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
  studioMembers?: StudioMember[];
  parentStudioId?: string;
}

export interface Story {
  id: string;
  title: string;
  alternativeTitles?: string[];
  creator: Creator;
  studioId?: string;
  studioName?: string;
  displayAs?: 'personal' | 'studio';
  credits?: StoryCredit[];
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
  isFeatured?: boolean;
  isOriginal: boolean;
  publicationStatus?: PublicationStatus;
  status?: 'draft' | 'published' | 'hidden' | 'archived';
  weeklyViews?: number;
  lastChapterAt?: string;
  createdAt?: string;
  updatedAt?: string;
  media?: {
    chapterText?: string;
    attachments?: Array<{ name: string; url: string; type?: string; size?: number }>;
    chapters?: Array<{
      title: string;
      text: string;
      attachments?: Array<{ name: string; url: string; type?: string; size?: number }>;
      monetization?: string;
      price?: number;
    }>;
    monetization?: string;
    credits?: string;
  };
}
