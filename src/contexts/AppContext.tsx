import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { Creator, Story, SupportTransaction, CreatorApplication, CreatorAccessStatus } from '../data/types';
import { MOCK_CREATORS, MOCK_STORIES } from '../data/mock';
import { api } from '../../convex/_generated/api';
import { auth, authPersistenceReady, googleProvider } from '../lib/firebase';
import { convex } from '../lib/convex';

export type UserRole = 'guest' | 'reader' | 'creator' | 'admin';
export type AdminRole = 'super_admin' | 'moderator' | 'content_reviewer' | 'payment_reviewer';

export interface AdminSession {
  isAuthenticated: boolean;
  role: AdminRole;
  email: string;
}

export interface Moderator {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  status: 'active' | 'disabled';
  lastActive: string;
}

export interface ContentReport {
  id: string;
  type: 'story' | 'chapter' | 'user' | 'comment';
  targetId: string;
  targetName: string;
  reportedBy: string;
  reason: string;
  message: string;
  date: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
}

export interface AdminActivity {
  id: string;
  action: string;
  adminEmail: string;
  timestamp: string;
}
export type PremiumStatus = 'free' | 'trial' | 'premium' | 'expired';
export type PremiumPlan = 'premium' | 'patron';
export type PremiumBillingCycle = 'monthly' | 'yearly';

export interface Notification {
  id: string;
  type: 'follow' | 'save' | 'unlock' | 'premium' | 'support' | 'update' | 'wallet';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface ReadingHistoryItem {
  storyId: string;
  chapterId: string;
  timestamp: string;
}

export interface UserSettings {
  themeMode: 'dark' | 'light' | 'system';
  accentColor: 'lemon' | 'purple' | 'blue' | 'orange' | 'white';
  displayDensity: 'compact' | 'default' | 'relaxed';
  readerFontSize: number;
  comicScrollMode: 'vertical' | 'paged';
  novelTheme: 'dark' | 'sepia' | 'light';
  notifications: {
    newChapters: boolean;
    replies: boolean;
    promotions: boolean;
  };
}

export interface UnlockTransaction {
  storyId: string;
  chapterId: string;
  price: number;
  timestamp: string;
}

export interface AppUser {
  id: string;
  email?: string;
  name: string;
  username: string;
  usernameUpdatedAt?: string;
  usernameChangeLockedAt?: string;
  bio?: string;
  avatar: string;
  banner?: string;
  role: UserRole;
  creatorAccessStatus: CreatorAccessStatus;
  isAuthenticated: boolean;
  isGuest: boolean;
  isPremium: boolean;
  premiumStatus: PremiumStatus;
  premiumPlan?: PremiumPlan;
  premiumBillingCycle?: PremiumBillingCycle;
  premiumStartedAt?: string;
  premiumRenewsAt?: string;
  premiumCancelledAt?: string;
  premiumCancelAtPeriodEnd?: boolean;
  premiumProvider?: string;
  premiumReference?: string;
  walletBalance: number;
  followedCreators: string[]; // Creator usernames
  savedStories: string[]; // Story IDs
  unlockedChapters: string[]; // Chapter IDs (e.g. "s1-c42")
  unlockHistory: UnlockTransaction[];
  supportHistory: SupportTransaction[];
  topupHistory: any[];
  readingHistory: ReadingHistoryItem[];
  badges: string[]; // Badge IDs
  notifications: Notification[];
  settings: UserSettings;
  pendingAction?: { type: string; payload?: any };
}

interface AppContextType {
  user: AppUser | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  creators: Record<string, Creator>;
  stories: Story[];
  applications: CreatorApplication[];
  
  // Admin State
  adminSession: AdminSession | null;
  moderators: Moderator[];
  allUsers: AppUser[];
  reports: ContentReport[];
  activityLog: AdminActivity[];
  
  // Actions
  login: (role: UserRole) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; username: string; email: string; password: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  
  // Admin Actions
  adminLogin: (email: string, role: AdminRole) => void;
  adminLogout: () => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  resolveReport: (reportId: string, action: 'resolved' | 'dismissed') => void;
  addModerator: (mod: Omit<Moderator, 'id' | 'lastActive'>) => void;
  removeModerator: (modId: string) => void;
  updateModerator: (modId: string, updates: Partial<Moderator>) => void;
  logAdminActivity: (action: string) => void;

  setPendingAction: (type: string, payload?: any) => void;
  executePendingAction: () => void;

  followCreator: (username: string) => void;
  unfollowCreator: (username: string) => void;
  saveStory: (storyId: string) => void;
  unsaveStory: (storyId: string) => void;
  unlockChapter: (storyId: string, chapterId: string, price: number) => void;
  supportCreator: (username: string, amount: number) => void;
  addFunds: (amount: number) => void;
  addCoins: (amount: number) => void;
  upgradePremium: (plan: 'monthly' | 'yearly') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  trackReading: (storyId: string, chapterId: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateLocalUser: (updates: Partial<AppUser>) => void;
  markNotificationsAsRead: () => void;
  submitCreatorApplication: (application: Omit<CreatorApplication, 'id' | 'userId' | 'submittedAt' | 'status'>) => Promise<void>;
  approveCreatorApplication: (appId: string) => Promise<void>;
  rejectCreatorApplication: (appId: string, feedback: string) => Promise<void>;
  
  // Platform Settings
  showMockData: boolean;
  updatePlatformSettings: (settings: { showMockData?: boolean; maintenanceMode?: boolean }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'dark',
  accentColor: 'lemon',
  displayDensity: 'default',
  readerFontSize: 16,
  comicScrollMode: 'vertical',
  novelTheme: 'dark',
  notifications: {
    newChapters: true,
    replies: true,
    promotions: true,
  }
};

const LIVE_CONTENT_REFRESH_MS = 10000;
const AUTH_SESSION_KEY = 'lemonade_auth_session';
const AUTH_EXPLICIT_LOGOUT_KEY = 'lemonade_auth_explicit_logout';

const GUEST_USER: AppUser = {
  id: 'guest',
  name: 'Guest',
  username: 'guest',
  avatar: '',
  role: 'guest',
  creatorAccessStatus: 'none',
  isAuthenticated: false,
  isGuest: true,
  isPremium: false,
  premiumStatus: 'free',
  walletBalance: 0,
  followedCreators: [],
  savedStories: [],
  unlockedChapters: [],
  unlockHistory: [],
  supportHistory: [],
  topupHistory: [],
  readingHistory: [],
  badges: [],
  notifications: [],
  settings: DEFAULT_SETTINGS,
};

const INITIAL_READER: AppUser = {
  id: 'reader',
  name: 'Reader',
  username: 'reader',
  avatar: '',
  role: 'reader',
  creatorAccessStatus: 'none',
  isAuthenticated: true,
  isGuest: false,
  isPremium: false,
  premiumStatus: 'free',
  walletBalance: 0,
  followedCreators: [],
  savedStories: [],
  unlockedChapters: [],
  unlockHistory: [],
  supportHistory: [],
  topupHistory: [],
  readingHistory: [],
  badges: [],
  notifications: [],
  settings: DEFAULT_SETTINGS,
};

const readPersistedUser = (): AppUser | null => {
  if (typeof window === 'undefined') return null;

  try {
    const savedSession = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!savedSession) return null;

    const parsed = JSON.parse(savedSession) as { user?: AppUser };
    const savedUser = parsed.user;
    if (!savedUser?.isAuthenticated || savedUser.isGuest) return null;

    return {
      ...savedUser,
      settings: { ...DEFAULT_SETTINGS, ...(savedUser.settings || {}) },
    };
  } catch (error) {
    console.error('Failed to restore saved auth session', error);
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
};

const persistUserSession = (nextUser: AppUser) => {
  if (typeof window === 'undefined' || nextUser.isGuest || !nextUser.isAuthenticated) return;

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    user: nextUser,
    savedAt: new Date().toISOString(),
  }));
  window.localStorage.removeItem(AUTH_EXPLICIT_LOGOUT_KEY);
};

const clearPersistedUserSession = () => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.setItem(AUTH_EXPLICIT_LOGOUT_KEY, 'true');
};

const usernameFromUser = (firebaseUser: FirebaseUser, preferred?: string) => {
  const base = preferred || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'reader';
  return base.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'reader';
};

const appUserFromFirebase = (firebaseUser: FirebaseUser, convexUser?: any): AppUser => {
  const walletTransactions = convexUser?.walletTransactions || [];
  
  const unlockHistory = walletTransactions
    .filter((t: any) => t.type === 'chapter_unlock' && t.status === 'success')
    .map((t: any) => ({
      storyId: t.metadata?.storyId,
      chapterId: t.metadata?.chapterId,
      timestamp: t.createdAt,
      price: t.amount,
    }));

  const supportHistory = walletTransactions
    .filter((t: any) => t.type === 'creator_support' && t.status === 'success')
    .map((t: any) => ({
      creatorId: t.metadata?.username || t.metadata?.creatorId,
      amount: t.amount,
      timestamp: t.createdAt,
    }));

  const topupHistory = walletTransactions
    .filter((t: any) => t.type === 'wallet_topup' && t.status === 'success')
    .map((t: any) => ({
      amount: t.amount,
      nairaAmount: t.metadata?.nairaAmount,
      timestamp: t.createdAt,
      reference: t.reference,
    }));

  return {
    id: convexUser?._id || firebaseUser.uid,
    email: firebaseUser.email || convexUser?.email,
    name: convexUser?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Reader',
    username: convexUser?.username || usernameFromUser(firebaseUser),
    usernameUpdatedAt: convexUser?.usernameUpdatedAt,
    usernameChangeLockedAt: convexUser?.usernameChangeLockedAt,
    bio: convexUser?.bio,
    avatar: convexUser?.avatar || firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
    banner: convexUser?.banner,
    role: convexUser?.role || 'reader',
    creatorAccessStatus: convexUser?.creatorAccessStatus || 'none',
    isAuthenticated: true,
    isGuest: false,
    isPremium: convexUser?.premiumStatus === 'premium',
    premiumStatus: convexUser?.premiumStatus || 'free',
    premiumPlan: convexUser?.premiumPlan,
    premiumBillingCycle: convexUser?.premiumBillingCycle,
    premiumStartedAt: convexUser?.premiumStartedAt,
    premiumRenewsAt: convexUser?.premiumRenewsAt,
    premiumCancelledAt: convexUser?.premiumCancelledAt,
    premiumCancelAtPeriodEnd: convexUser?.premiumCancelAtPeriodEnd,
    premiumProvider: convexUser?.premiumProvider,
    premiumReference: convexUser?.premiumReference,
    walletBalance: convexUser?.walletBalance || 0,
    followedCreators: convexUser?.followedCreators || [],
    savedStories: convexUser?.savedStories || [],
    unlockedChapters: convexUser?.unlockedChapters || [],
    unlockHistory,
    supportHistory,
    topupHistory,
    readingHistory: convexUser?.readingHistory || [],
    badges: convexUser?.badges || [],
    notifications: convexUser?.notifications || [],
    settings: { ...DEFAULT_SETTINGS, ...(convexUser?.settings || {}) },
  };
};

const creatorFromDoc = (doc: any): Creator => ({
  id: doc.externalId || doc._id,
  name: doc.name,
  username: doc.username,
  avatar: doc.avatar,
  followers: doc.followers,
  bio: doc.bio,
  category: doc.category,
  location: doc.location,
  totalReads: doc.totalReads,
  totalStories: doc.totalStories,
  dropsomethingUrl: doc.dropsomethingUrl,
  supportEnabled: doc.supportEnabled,
  profile: doc.profile,
  ...(doc.profile || {}),
});

const storyFromDoc = (doc: any, creator: Creator): Story => ({
  id: doc.externalId || doc._id,
  title: doc.title,
  creator,
  genre: doc.genre,
  format: doc.format,
  rating: doc.rating,
  views: doc.views,
  saves: doc.saves,
  episodes: doc.episodes,
  synopsis: doc.synopsis,
  coverImage: doc.coverImage,
  bannerImage: doc.bannerImage,
  tags: doc.tags,
  isOriginal: doc.isOriginal,
  status: doc.status,
  media: doc.media,
});

const applicationFromDoc = (doc: any): CreatorApplication => ({
  id: doc._id,
  userId: doc.userId,
  creatorName: doc.creatorName || doc.applicantName || 'Unknown creator',
  fullName: doc.creatorName || doc.applicantName || 'Unknown creator',
  email: doc.email,
  socialUsername: doc.username,
  category: Array.isArray(doc.category) ? (doc.category[0] || 'Writer') : doc.category,
  location: doc.location || '',
  bio: doc.bio || '',
  portfolioLink: doc.portfolioLink || '',
  portfolioUrl: doc.portfolioLink || '',
  sampleWorkUrl: doc.socialLinks?.sampleWork,
  socialLinks: doc.socialLinks || {},
  dropsomethingUrl: doc.dropsomethingUrl,
  studioMode: doc.studioMode || 'solo',
  studioName: doc.studioName || '',
  storyIntent: doc.storyIntent || '',
  mainGenre: doc.mainGenre || '',
  hasStoryReady: !!doc.hasStoryReady,
  whyLemonade: doc.whyLemonade || '',
  submittedAt: doc.submittedAt,
  status: doc.status,
  adminFeedback: doc.adminFeedback,
});

const appUserFromDoc = (doc: any): AppUser => ({
  id: doc._id,
  email: doc.email,
  name: doc.name,
  username: doc.username,
  usernameUpdatedAt: doc.usernameUpdatedAt,
  usernameChangeLockedAt: doc.usernameChangeLockedAt,
  bio: doc.bio,
  avatar: doc.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(doc.name || doc.username || 'User')}`,
  banner: doc.banner,
  role: doc.role,
  creatorAccessStatus: doc.creatorAccessStatus,
  isAuthenticated: true,
  isGuest: false,
  isPremium: doc.premiumStatus === 'premium',
  premiumStatus: doc.premiumStatus || 'free',
  premiumPlan: doc.premiumPlan,
  premiumBillingCycle: doc.premiumBillingCycle,
  premiumStartedAt: doc.premiumStartedAt,
  premiumRenewsAt: doc.premiumRenewsAt,
  premiumCancelledAt: doc.premiumCancelledAt,
  premiumCancelAtPeriodEnd: doc.premiumCancelAtPeriodEnd,
  premiumProvider: doc.premiumProvider,
  premiumReference: doc.premiumReference,
  walletBalance: doc.walletBalance || 0,
  followedCreators: doc.followedCreators || [],
  savedStories: doc.savedStories || [],
  unlockedChapters: doc.unlockedChapters || [],
  unlockHistory: [],
  supportHistory: [],
  topupHistory: [],
  readingHistory: [],
  badges: doc.badges || [],
  notifications: [],
  settings: { ...DEFAULT_SETTINGS, ...(doc.settings || {}) },
  status: doc.status,
} as AppUser);

const reportFromDoc = (doc: any): ContentReport => ({
  id: doc._id,
  type: doc.type,
  targetId: doc.targetId,
  targetName: doc.targetName,
  reportedBy: doc.reportedBy,
  reason: doc.reason,
  message: doc.message,
  date: doc.createdAt,
  status: doc.status,
});

const activityFromDoc = (doc: any): AdminActivity => ({
  id: doc._id,
  action: doc.action,
  adminEmail: doc.adminEmail,
  timestamp: doc.timestamp,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => readPersistedUser());
  const [liveCreators, setLiveCreators] = useState<Record<string, Creator>>(MOCK_CREATORS as unknown as Record<string, Creator>);
  const [liveStories, setLiveStories] = useState<Story[]>(MOCK_STORIES as unknown as Story[]);
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  
  // Admin State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [activityLog, setActivityLog] = useState<AdminActivity[]>([]);
  const [showMockData, setShowMockData] = useState<boolean>(import.meta.env.DEV);

  useEffect(() => {
    if (!convex) return;
    let isMounted = true;

    const loadLiveContent = async (isBackgroundRefresh = false) => {
      try {
        let [creatorDocs, storyDocs, applicationDocs, userDocs, reportDocs, activityDocs, moderatorDocs, platformSettings] = await Promise.all([
          convex.query(api.creators.list, {}),
          convex.query(api.stories.listPublished, {}),
          convex.query(api.applications.list, {}),
          convex.query(api.users.list, {}),
          convex.query(api.admin.listReports, {}),
          convex.query(api.admin.listActivity, {}),
          convex.query(api.admin.listModerators, {}),
          convex.query(api.settings.get, {}),
        ]);

        if (!isMounted) return;

        if (platformSettings) {
          setShowMockData(platformSettings.showMockData);
        }

        if (import.meta.env.DEV && (creatorDocs.length === 0 || storyDocs.length === 0)) {
          await convex.mutation(api.seed.initialContent, {});
          [creatorDocs, storyDocs] = await Promise.all([
            convex.query(api.creators.list, {}),
            convex.query(api.stories.listPublished, {}),
          ]);
        }

        if (!isMounted) return;

        const liveCreators = creatorDocs.reduce<Record<string, Creator>>((acc, doc: any) => {
          const creator = creatorFromDoc(doc);
          acc[creator.username] = creator;
          return acc;
        }, {});

        const liveStories = storyDocs
          .map((doc: any) => {
            const creator = liveCreators[doc.creatorUsername];
            return creator ? storyFromDoc(doc, creator) : null;
          })
          .filter(Boolean) as Story[];

        if (Object.keys(liveCreators).length > 0) {
          setLiveCreators(liveCreators);
        }
        if (liveStories.length > 0) {
          setLiveStories(liveStories);
        }
        setApplications(applicationDocs.map(applicationFromDoc));
        setAllUsers(userDocs.map(appUserFromDoc));
        setReports(reportDocs.map(reportFromDoc));
        setActivityLog(activityDocs.map(activityFromDoc));
        setModerators(moderatorDocs.map((doc: any) => ({
          id: doc._id,
          name: doc.name,
          email: doc.email,
          role: doc.role,
          permissions: doc.permissions || [],
          status: doc.status,
          lastActive: doc.lastActive,
        })));
      } catch (error) {
        if (!isBackgroundRefresh) {
          console.error('Failed to load live Convex content; using bundled fallback.', error);
        }
      }
    };

    loadLiveContent();
    const interval = window.setInterval(() => loadLiveContent(true), LIVE_CONTENT_REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const stories = useMemo(() => {
    return liveStories;
  }, [liveStories]);

  const creators = useMemo(() => {
    return liveCreators;
  }, [liveCreators]);
  const isAuthenticated = !!user?.isAuthenticated && !user.isGuest;

  const syncFirebaseUser = async (firebaseUser: FirebaseUser) => {
    if (!convex) {
      const nextUser = appUserFromFirebase(firebaseUser);
      persistUserSession(nextUser);
      setUser(nextUser);
      return;
    }

    const username = usernameFromUser(firebaseUser);
    await convex.mutation(api.users.upsertFromAuth, {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      name: firebaseUser.displayName || username,
      username,
      avatar: firebaseUser.photoURL || undefined,
    });
    const convexUser = await convex.query(api.users.getFullProfile, {
      firebaseUid: firebaseUser.uid,
    });
    const nextUser = appUserFromFirebase(firebaseUser, convexUser);
    persistUserSession(nextUser);
    setUser(nextUser);
  };

  // Persistence
  useEffect(() => {
    const savedAdminState = localStorage.getItem('lemonade_admin_session');

    if (savedAdminState) {
      try {
        setAdminSession(JSON.parse(savedAdminState));
      } catch (e) {
        console.error('Failed to load admin session', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        const savedUser = readPersistedUser();
        const explicitlyLoggedOut = localStorage.getItem(AUTH_EXPLICIT_LOGOUT_KEY) === 'true';

        if (savedUser && !explicitlyLoggedOut) {
          setUser(savedUser);
          return;
        }

        setUser(GUEST_USER);
        return;
      }

      try {
        await syncFirebaseUser(firebaseUser);
      } catch (error) {
        console.error('Failed to sync Firebase user', error);
        const fallbackUser = appUserFromFirebase(firebaseUser);
        persistUserSession(fallbackUser);
        setUser(fallbackUser);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (adminSession) {
      localStorage.setItem('lemonade_admin_session', JSON.stringify(adminSession));
    } else {
      localStorage.removeItem('lemonade_admin_session');
    }
  }, [adminSession]);

  useEffect(() => {
    if (user?.isAuthenticated && !user.isGuest) {
      persistUserSession(user);
    }
  }, [user]);

  // Local admin sample data only exists in development.
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    // Populate with some mock data if empty
    if (allUsers.length === 0) {
      setAllUsers([
        { ...INITIAL_READER, id: 'u1', name: 'Leke Adesina', username: 'leke_adesina', email: 'leke@live.com', role: 'reader', premiumStatus: 'free', walletBalance: 1250, creatorAccessStatus: 'none', settings: DEFAULT_SETTINGS, notifications: [] } as any,
        { id: 'u2', name: 'Tunde Bakare', username: 'tunde_b', email: 'tunde@bakare.com', role: 'reader', premiumStatus: 'premium', walletBalance: 5000, creatorAccessStatus: 'none', settings: DEFAULT_SETTINGS, notifications: [] } as any,
        { id: 'u3', name: 'Zaria Williams', username: 'zaria_w', email: 'zaria@works.com', role: 'creator', premiumStatus: 'free', walletBalance: 120, creatorAccessStatus: 'approved', settings: DEFAULT_SETTINGS, notifications: [] } as any,
      ]);
    }

    if (applications.length === 0) {
      setApplications([
        {
          id: 'app1',
          userId: 'u2',
          fullName: 'Tunde Bakare',
          email: 'tunde@bakare.com',
          socialUsername: 'tunde_the_artist',
          portfolioUrl: 'https://behance.net/tunde',
          sampleWorkUrl: 'https://artstation.com/tunde',
          mainGenre: 'Afro-Futurism',
          bio: 'I want to create stories that reflect the vibrant culture of Lagos in 2100.',
          submittedAt: new Date().toISOString(),
          status: 'pending'
        }
      ]);
    }
    
    if (moderators.length === 0) {
      setModerators([
        {
          id: 'm1',
          name: 'Ridwan Ade',
          email: 'riderezzy@lemons.com',
          role: 'super_admin',
          permissions: ['all'],
          status: 'active',
          lastActive: new Date().toISOString()
        }
      ]);
    }

    if (reports.length === 0) {
      setReports([
        {
          id: 'r1',
          type: 'story',
          targetId: 's1',
          targetName: 'Sample story',
          reportedBy: 'tunde_b',
          reason: 'Inappropriate content',
          message: 'The chapter 4 has some graphic scenes that violate rules.',
          date: new Date().toISOString(),
          status: 'open'
        }
      ]);
    }
    
    if (activityLog.length === 0) {
      setActivityLog([
        { id: 'log1', action: 'System initialized', adminEmail: 'system', timestamp: new Date().toISOString() }
      ]);
    }
  }, []);

  const adminLogin = (email: string, role: AdminRole) => {
    const session: AdminSession = {
      isAuthenticated: true,
      email,
      role
    };
    setAdminSession(session);
    logAdminActivity(`Admin login: ${email}`);
  };

  const adminLogout = () => {
    setAdminSession(null);
  };

  const logAdminActivity = (action: string) => {
    const newLog: AdminActivity = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      adminEmail: adminSession?.email || 'system',
      timestamp: new Date().toISOString()
    };
    setActivityLog(prev => [newLog, ...prev]);
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } as any : u));
    logAdminActivity(`Updated user ${userId} status to ${status}`);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    logAdminActivity(`Updated user ${userId} role to ${role}`);
  };

  const resolveReport = (reportId: string, status: 'resolved' | 'dismissed') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    logAdminActivity(`Report ${reportId} marked as ${status}`);
  };

  const addModerator = (modData: Omit<Moderator, 'id' | 'lastActive'>) => {
    const newMod: Moderator = {
      ...modData,
      id: Math.random().toString(36).substr(2, 9),
      lastActive: new Date().toISOString()
    };
    setModerators(prev => [...prev, newMod]);
    logAdminActivity(`Added moderator: ${modData.email}`);
  };

  const removeModerator = (modId: string) => {
    setModerators(prev => prev.filter(m => m.id !== modId));
    logAdminActivity(`Removed moderator ${modId}`);
  };

  const updateModerator = (modId: string, updates: Partial<Moderator>) => {
    setModerators(prev => prev.map(m => m.id === modId ? { ...m, ...updates } : m));
    logAdminActivity(`Updated moderator ${modId}`);
  };

  const addNotification = async (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!user || user.isGuest) return;
    
    const localId = Math.random().toString(36).substr(2, 9);
    const newNotif: Notification = {
      ...notif,
      id: localId,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setUser(prev => prev ? {
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    } : null);

    if (convex && isAuthenticated && user.id) {
       try {
         await convex.mutation(api.users.createNotification, {
           userId: user.id,
           type: notif.type as any,
           title: notif.title,
           message: notif.message,
           link: notif.link,
         });
       } catch (error) {
         console.error('Failed to persist notification', error);
       }
    }
  };

  const login = (role: UserRole) => {
    const newUser: AppUser = {
      ...INITIAL_READER,
      role: role,
      isAuthenticated: true,
      isGuest: false,
    };
    persistUserSession(newUser);
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    await authPersistenceReady;
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await syncFirebaseUser(credential.user);
  };

  const signUp = async (input: { name: string; username: string; email: string; password: string }) => {
    await authPersistenceReady;
    const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await updateProfile(credential.user, {
      displayName: input.name,
      photoURL: `https://picsum.photos/seed/${input.username}/100/100`,
    });

    if (convex) {
      await convex.mutation(api.users.upsertFromAuth, {
        firebaseUid: credential.user.uid,
        email: input.email,
        name: input.name,
        username: usernameFromUser(credential.user, input.username),
        avatar: credential.user.photoURL || undefined,
      });
      const convexUser = await convex.query(api.users.getByFirebaseUid, {
        firebaseUid: credential.user.uid,
      });
      const nextUser = appUserFromFirebase(credential.user, convexUser);
      persistUserSession(nextUser);
      setUser(nextUser);
    } else {
      const nextUser = appUserFromFirebase(credential.user);
      persistUserSession(nextUser);
      setUser(nextUser);
    }
  };

  const signInWithGoogle = async () => {
    await authPersistenceReady;
    const credential = await signInWithPopup(auth, googleProvider);
    await syncFirebaseUser(credential.user);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const setPendingAction = (type: string, payload?: any) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, pendingAction: { type, payload } } : null);
  };

  const executePendingAction = () => {
    if (!user || !user.pendingAction) return;
    
    const { type, payload } = user.pendingAction;
    
    switch (type) {
      case 'follow':
        if (payload?.username) followCreator(payload.username);
        break;
      case 'save story':
        if (payload?.storyId) saveStory(payload.storyId);
        break;
      case 'support':
        if (payload?.username) supportCreator(payload.username, 10);
        break;
      case 'favorite':
        // Handle favorite
        break;
    }
    
    setUser(prev => prev ? { ...prev, pendingAction: undefined } : null);
  };

  const continueAsGuest = () => {
    setUser(GUEST_USER);
  };

  const logout = async () => {
    await signOut(auth);
    clearPersistedUserSession();
    setUser(GUEST_USER);
  };

  const followCreator = async (username: string) => {
    if (!user || user.isGuest) return;
    
    setUser(prev => prev ? {
      ...prev,
      followedCreators: [...prev.followedCreators, username]
    } : null);

    if (convex && isAuthenticated && auth.currentUser) {
      try {
        await convex.mutation(api.users.toggleFollow, {
          firebaseUid: auth.currentUser.uid,
          creatorUsername: username,
        });
      } catch (error) {
        console.error('Failed to follow creator', error);
      }
    }

    addNotification({
      type: 'follow',
      title: 'New Follow',
      message: `You followed ${username}`,
      link: `/creator/${username}`
    });
  };

  const unfollowCreator = async (username: string) => {
    if (!user || user.isGuest) return;
    
    setUser(prev => prev ? {
      ...prev,
      followedCreators: prev.followedCreators.filter(u => u !== username)
    } : null);

    if (convex && isAuthenticated && auth.currentUser) {
      try {
        await convex.mutation(api.users.toggleFollow, {
          firebaseUid: auth.currentUser.uid,
          creatorUsername: username,
        });
      } catch (error) {
        console.error('Failed to unfollow creator', error);
      }
    }
  };

  const saveStory = async (storyId: string) => {
    if (!user || user.isGuest) return;
    if (user.savedStories.includes(storyId)) return;

    setUser(prev => prev ? {
      ...prev,
      savedStories: [...prev.savedStories, storyId]
    } : null);

    if (convex && isAuthenticated && auth.currentUser) {
      try {
        await convex.mutation(api.users.toggleSave, {
          firebaseUid: auth.currentUser.uid,
          storyId: storyId,
        });
      } catch (error) {
        console.error('Failed to save story', error);
      }
    }

    const story = stories.find(s => s.id === storyId);
    addNotification({
      type: 'save',
      title: 'Story Saved',
      message: `Story "${story?.title}" saved to your library`,
      link: `/story/${story?.id}`
    });
  };

  const unsaveStory = async (storyId: string) => {
    if (!user || user.isGuest) return;
    setUser(prev => prev ? {
      ...prev,
      savedStories: prev.savedStories.filter(id => id !== storyId)
    } : null);

    if (convex && isAuthenticated && auth.currentUser) {
      try {
        await convex.mutation(api.users.toggleSave, {
          firebaseUid: auth.currentUser.uid,
          storyId: storyId,
        });
      } catch (error) {
        console.error('Failed to unsave story', error);
      }
    }
  };

  const unlockChapter = (storyId: string, chapterId: string, price: number) => {
    if (!user || user.isGuest) return;
    if (user.walletBalance < price) return;
    
    const key = `${storyId}-${chapterId}`;
    if (user.unlockedChapters.includes(key)) return;

    setUser(prev => prev ? {
      ...prev,
      walletBalance: prev.walletBalance - price,
      unlockedChapters: [...prev.unlockedChapters, key],
      unlockHistory: [
        { storyId, chapterId, price, timestamp: new Date().toISOString() },
        ...prev.unlockHistory
      ]
    } : null);

    addNotification({
      type: 'unlock',
      title: 'Chapter Unlocked',
      message: `You unlocked a new chapter!`,
    });
  };

  const supportCreator = (username: string, amount: number) => {
    if (!user || user.isGuest) return;
    
    const transaction: SupportTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      creatorId: username,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    setUser(prev => prev ? {
      ...prev,
      supportHistory: [...prev.supportHistory, transaction]
    } : null);

    addNotification({
      type: 'support',
      title: 'Support Sent',
      message: `You supported ${username} via DropSomething!`,
      link: `/creator/${username}`
    });
  };

  const addFunds = (amount: number) => {
    if (!user || user.isGuest) return;
    setUser(prev => prev ? {
      ...prev,
      walletBalance: prev.walletBalance + amount
    } : null);

    addNotification({
      type: 'wallet',
      title: 'Funds Added',
      message: `₦${(amount ?? 0).toLocaleString()} added to your wallet.`,
    });
  };

  const addCoins = (amount: number) => {
    if (!user || user.isGuest) return;
    setUser(prev => prev ? {
      ...prev,
      walletBalance: prev.walletBalance + amount
    } : null);

    addNotification({
      type: 'wallet',
      title: 'Coins Added',
      message: `${(amount ?? 0).toLocaleString()} coins added to your wallet.`,
    });
  };

  const upgradePremium = (plan: 'monthly' | 'yearly') => {
    if (!user || user.isGuest) return;
    setUser(prev => prev ? {
      ...prev,
      isPremium: true,
      premiumStatus: 'premium'
    } : null);

    addNotification({
      type: 'premium',
      title: 'Premium Activated',
      message: `Welcome to Lemonade Premium!`,
    });
  };

  const markNotificationAsRead = (id: string) => {
    setUser(prev => prev ? {
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    } : null);
  };

  const markNotificationsAsRead = () => {
    setUser(prev => prev ? {
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    } : null);
  };

  const trackReading = async (storyId: string, chapterId: string) => {
    if (!user || user.isGuest) return;
    
    const newItem: ReadingHistoryItem = {
      storyId,
      chapterId,
      timestamp: new Date().toISOString()
    };

    setUser(prev => {
      if (!prev) return null;
      // Remove previous entry for this story if exists to keep it unique/recent
      const filtered = prev.readingHistory.filter(h => h.storyId !== storyId);
      return {
        ...prev,
        readingHistory: [newItem, ...filtered].slice(0, 50) // Keep last 50
      };
    });

    if (convex && isAuthenticated && auth.currentUser) {
      try {
        await convex.mutation(api.interactions.trackReadingByFirebaseUid, {
          firebaseUid: auth.currentUser.uid,
          storyId,
          chapterId
        });
      } catch (error) {
        console.error('Failed to persist reading history', error);
      }
    }
  };

  // Appearance application
  useEffect(() => {
    const root = document.documentElement;
    const settings = user?.settings || DEFAULT_SETTINGS;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const selectedTheme = settings.themeMode || 'dark';
      const resolvedTheme = selectedTheme === 'system'
        ? (prefersDark.matches ? 'dark' : 'light')
        : selectedTheme;

      root.classList.toggle('dark', resolvedTheme === 'dark');
      root.dataset.theme = resolvedTheme;
      root.dataset.themeMode = selectedTheme;
      root.dataset.accent = settings.accentColor || 'lemon';
      root.dataset.density = settings.displayDensity || 'default';
    };

    applyTheme();

    if (settings.themeMode === 'system') {
      prefersDark.addEventListener('change', applyTheme);
      return () => prefersDark.removeEventListener('change', applyTheme);
    }
  }, [user?.settings.themeMode, user?.settings.accentColor, user?.settings.displayDensity]);

  useEffect(() => {
    if (user?.settings) {
      localStorage.setItem('lemonade_appearance', JSON.stringify({
        themeMode: user.settings.themeMode,
        accentColor: user.settings.accentColor,
        displayDensity: user.settings.displayDensity,
      }));
    } else {
      const savedAppearance = localStorage.getItem('lemonade_appearance');
      if (!savedAppearance) return;

      try {
        const settings = JSON.parse(savedAppearance);
        const root = document.documentElement;
        const resolvedTheme = settings.themeMode === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : (settings.themeMode || 'dark');

        root.classList.toggle('dark', resolvedTheme === 'dark');
        root.dataset.theme = resolvedTheme;
        root.dataset.themeMode = settings.themeMode || 'dark';
        root.dataset.accent = settings.accentColor || 'lemon';
        root.dataset.density = settings.displayDensity || 'default';
      } catch (error) {
        console.error('Failed to apply saved appearance settings', error);
      }
    }
  }, [user?.settings]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    setUser(prev => prev ? {
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    } : null);

    if (convex && isAuthenticated && auth.currentUser) {
      try {
        await convex.mutation(api.users.updateProfile, {
          firebaseUid: auth.currentUser.uid,
          settings: { ...(user?.settings || {}), ...newSettings }
        });
      } catch (error) {
        console.error('Failed to persist settings', error);
      }
    }
  };

  const updateLocalUser = (updates: Partial<AppUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const submitCreatorApplication = async (appData: Omit<CreatorApplication, 'id' | 'userId' | 'submittedAt' | 'status'>) => {
    if (!user || user.isGuest) return;

    if (convex) {
      try {
        const res: any = await convex.mutation(api.applications.submit, {
          userId: user.id,
          firebaseUid: auth.currentUser?.uid,
          creatorName: appData.creatorName,
          category: Array.isArray(appData.category) ? appData.category : [appData.category],
          location: appData.location,
          bio: appData.bio,
          portfolioLink: appData.portfolioLink,
          socialLinks: appData.socialLinks,
          dropsomethingUrl: appData.dropsomethingUrl,
          storyIntent: appData.storyIntent,
          mainGenre: appData.mainGenre,
          hasStoryReady: appData.hasStoryReady,
          whyLemonade: appData.whyLemonade,
        });

        const newApp: any = {
          ...(res || {}),
          id: (res && (res._id || res.id)) || Math.random().toString(36).substr(2, 9),
        };

        setApplications(prev => [newApp, ...prev]);
        setUser(prev => prev ? { ...prev, creatorAccessStatus: 'pending' } : null);
      } catch (error) {
        console.error('Failed to submit application to Convex', error);
        // fallback to local-only behavior
        const newApp: CreatorApplication = {
          ...appData,
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };
        setApplications(prev => [newApp, ...prev]);
        setUser(prev => prev ? { ...prev, creatorAccessStatus: 'pending' } : null);
      }
    } else {
      const newApp: CreatorApplication = {
        ...appData,
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      setApplications(prev => [newApp, ...prev]);
      setUser(prev => prev ? { ...prev, creatorAccessStatus: 'pending' } : null);
    }

    addNotification({
      type: 'update',
      title: 'Application Submitted',
      message: 'Your creator application is now under review.',
    });
  };

  const approveCreatorApplication = async (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));

    if (convex) {
      await convex.mutation(api.applications.review, {
        applicationId: appId as any,
        status: 'approved',
        adminEmail: adminSession?.email || user?.email || 'admin@lemonade.app',
      });
    }
    
    if (user && user.id === app.userId) {
      setUser(prev => prev ? { ...prev, creatorAccessStatus: 'approved', role: 'creator' } : null);
      
      addNotification({
        type: 'update',
        title: 'Application Approved',
        message: 'Your creator application has been approved.',
        link: '/studio'
      });
    }
  };

  const rejectCreatorApplication = async (appId: string, feedback: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected', adminFeedback: feedback } : a));

    if (convex) {
      await convex.mutation(api.applications.review, {
        applicationId: appId as any,
        status: 'rejected',
        adminEmail: adminSession?.email || user?.email || 'admin@lemonade.app',
        adminFeedback: feedback,
      });
    }
    
    if (user && user.id === app.userId) {
      setUser(prev => prev ? { ...prev, creatorAccessStatus: 'rejected' } : null);
      
      addNotification({
        type: 'update',
        title: 'Application Update',
        message: 'Your creator application needs more detail.',
        link: '/creator-application/status'
      });
    }
  };

  const updatePlatformSettings = async (settings: { showMockData?: boolean; maintenanceMode?: boolean }) => {
    if (!convex) return;
    try {
      await convex.mutation(api.settings.update, settings);
      if (settings.showMockData !== undefined) {
        setShowMockData(settings.showMockData);
      }
    } catch (error) {
      console.error('Failed to update platform settings', error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      isGuest: !!user?.isGuest, 
      isAuthenticated: !!user?.isAuthenticated,
      creators,
      stories,
      login,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      continueAsGuest,
      logout,
      setPendingAction,
      executePendingAction,
      followCreator,
      unfollowCreator,
      saveStory,
      unsaveStory,
      unlockChapter,
      supportCreator,
      addFunds,
      addCoins,
      upgradePremium,
      markNotificationAsRead,
      markAllNotificationsAsRead: markNotificationsAsRead,
      markNotificationsAsRead,
      trackReading,
      updateSettings,
      updateLocalUser,
      submitCreatorApplication,
      approveCreatorApplication,
      rejectCreatorApplication,
      adminLogin,
      adminLogout,
      updateUserStatus,
      updateUserRole,
      resolveReport,
      addModerator,
      removeModerator,
      updateModerator,
      logAdminActivity,
      adminSession,
      moderators,
      allUsers,
      reports,
      activityLog,
      applications,
      showMockData,
      updatePlatformSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// For backward compatibility while I transition components
export const useAuth = useApp;
