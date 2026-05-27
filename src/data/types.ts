export type Genre = "Action" | "Romance" | "Horror" | "Sci-Fi & Cyberpunk" | "African Fantasy" | "Drama" | "Mystery";
export type Format = "Manga" | "Manhwa" | "Webcomic" | "Novel";

export type PremiumState = "Free Reader" | "Premium Reader" | "Expired Premium" | "Trial Active";

export type CreatorAccessStatus = 'none' | 'pending' | 'needs_info' | 'approved' | 'rejected';

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
  status?: 'draft' | 'published' | 'hidden' | 'archived';
  media?: {
    chapterText?: string;
    attachments?: Array<{ name: string; url: string; type?: string; size?: number }>;
    monetization?: string;
    credits?: string;
  };
}
