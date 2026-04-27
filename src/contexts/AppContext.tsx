import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_CREATORS, MOCK_STORIES, Creator, Story, Reader, SupportTransaction, CreatorApplication, CreatorAccessStatus } from '../data/mock';

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
  themeMode: 'dark' | 'light' | 'amoled';
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
  name: string;
  username: string;
  avatar: string;
  role: UserRole;
  creatorAccessStatus: CreatorAccessStatus;
  isAuthenticated: boolean;
  isGuest: boolean;
  isPremium: boolean;
  premiumStatus: PremiumStatus;
  walletBalance: number;
  followedCreators: string[]; // Creator usernames
  savedStories: string[]; // Story IDs
  unlockedChapters: string[]; // Chapter IDs (e.g. "s1-c42")
  unlockHistory: UnlockTransaction[];
  supportHistory: SupportTransaction[];
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
  markNotificationsAsRead: () => void;
  submitCreatorApplication: (application: Omit<CreatorApplication, 'id' | 'userId' | 'submittedAt' | 'status'>) => void;
  approveCreatorApplication: (appId: string) => void;
  rejectCreatorApplication: (appId: string, feedback: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'dark',
  readerFontSize: 16,
  comicScrollMode: 'vertical',
  novelTheme: 'dark',
  notifications: {
    newChapters: true,
    replies: true,
    promotions: true,
  }
};

const GUEST_USER: AppUser = {
  id: 'guest',
  name: 'Guest',
  username: 'guest',
  avatar: 'https://picsum.photos/seed/guest/100/100',
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
  readingHistory: [],
  badges: [],
  notifications: [],
  settings: DEFAULT_SETTINGS,
};

const INITIAL_READER: AppUser = {
  id: 'r1',
  name: 'Leke Adesina',
  username: 'leke_adesina',
  avatar: 'https://picsum.photos/seed/leke/100/100',
  role: 'reader',
  creatorAccessStatus: 'none',
  isAuthenticated: true,
  isGuest: false,
  isPremium: false,
  premiumStatus: 'free',
  walletBalance: 1250,
  followedCreators: ['ovo_studios'],
  savedStories: ['s1'],
  unlockedChapters: [],
  unlockHistory: [],
  supportHistory: [],
  readingHistory: [],
  badges: ['b1'],
  notifications: [
    {
      id: 'n1',
      type: 'update',
      title: 'New Chapter',
      message: 'Lagos 2099 Chapter 43 is out now.',
      timestamp: new Date().toISOString(),
      read: false,
      link: '/story/lagos-2099'
    }
  ],
  settings: DEFAULT_SETTINGS,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [creators, setCreators] = useState<Record<string, Creator>>(MOCK_CREATORS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  
  // Admin State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [activityLog, setActivityLog] = useState<AdminActivity[]>([]);

  // Persistence
  useEffect(() => {
    const savedState = localStorage.getItem('lemonade_app_state');
    const savedAdminState = localStorage.getItem('lemonade_admin_session');
    
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setUser(parsed.user);
      } catch (e) {
        console.error('Failed to load state', e);
      }
    } else {
      setUser(GUEST_USER);
    }

    if (savedAdminState) {
      try {
        setAdminSession(JSON.parse(savedAdminState));
      } catch (e) {
        console.error('Failed to load admin session', e);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lemonade_app_state', JSON.stringify({ user }));
    }
  }, [user]);

  useEffect(() => {
    if (adminSession) {
      localStorage.setItem('lemonade_admin_session', JSON.stringify(adminSession));
    } else {
      localStorage.removeItem('lemonade_admin_session');
    }
  }, [adminSession]);

  // Mock Initialization for Admin
  useEffect(() => {
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
          targetName: 'Lagos 2099',
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

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!user || user.isGuest) return;
    
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setUser(prev => prev ? {
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    } : null);
  };

  const login = (role: UserRole) => {
    const newUser: AppUser = {
      ...INITIAL_READER,
      role: role,
      isAuthenticated: true,
      isGuest: false,
    };
    setUser(newUser);
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

  const logout = () => {
    setUser(GUEST_USER);
    localStorage.removeItem('lemonade_app_state');
  };

  const followCreator = (username: string) => {
    if (!user || user.isGuest) return;
    if (user.followedCreators.includes(username)) return;

    setUser(prev => prev ? {
      ...prev,
      followedCreators: [...prev.followedCreators, username]
    } : null);

    // Update creator follower count (locally)
    setCreators(prev => {
      const updated = { ...prev };
      const creatorKey = Object.keys(updated).find(k => updated[k].username === username);
      if (creatorKey) {
        updated[creatorKey] = {
          ...updated[creatorKey],
          followers: updated[creatorKey].followers + 1,
          isFollowed: true
        };
      }
      return updated;
    });

    addNotification({
      type: 'follow',
      title: 'New Follow',
      message: `You followed ${username}`,
      link: `/creator/${username}`
    });
  };

  const unfollowCreator = (username: string) => {
    if (!user || user.isGuest) return;
    
    setUser(prev => prev ? {
      ...prev,
      followedCreators: prev.followedCreators.filter(u => u !== username)
    } : null);

    setCreators(prev => {
      const updated = { ...prev };
      const creatorKey = Object.keys(updated).find(k => updated[k].username === username);
      if (creatorKey) {
        updated[creatorKey] = {
          ...updated[creatorKey],
          followers: Math.max(0, updated[creatorKey].followers - 1),
          isFollowed: false
        };
      }
      return updated;
    });
  };

  const saveStory = (storyId: string) => {
    if (!user || user.isGuest) return;
    if (user.savedStories.includes(storyId)) return;

    setUser(prev => prev ? {
      ...prev,
      savedStories: [...prev.savedStories, storyId]
    } : null);

    const story = stories.find(s => s.id === storyId);
    addNotification({
      type: 'save',
      title: 'Story Saved',
      message: `Story "${story?.title}" saved to your library`,
      link: `/story/${story?.id}`
    });
  };

  const unsaveStory = (storyId: string) => {
    if (!user || user.isGuest) return;
    setUser(prev => prev ? {
      ...prev,
      savedStories: prev.savedStories.filter(id => id !== storyId)
    } : null);
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

  const trackReading = (storyId: string, chapterId: string) => {
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
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUser(prev => prev ? {
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    } : null);
  };

  const submitCreatorApplication = (appData: Omit<CreatorApplication, 'id' | 'userId' | 'submittedAt' | 'status'>) => {
    if (!user || user.isGuest) return;
    
    const newApp: CreatorApplication = {
      ...appData,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    setApplications(prev => [newApp, ...prev]);
    setUser(prev => prev ? { ...prev, creatorAccessStatus: 'pending' } : null);
    
    addNotification({
      type: 'update',
      title: 'Application Submitted',
      message: 'Your creator application is now under review.',
    });
  };

  const approveCreatorApplication = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
    
    // In a real app we'd find the user by ID
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

  const rejectCreatorApplication = (appId: string, feedback: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected', adminFeedback: feedback } : a));
    
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

  return (
    <AppContext.Provider value={{ 
      user, 
      isGuest: !!user?.isGuest, 
      isAuthenticated: !!user?.isAuthenticated,
      creators,
      stories,
      login,
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
      applications
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
