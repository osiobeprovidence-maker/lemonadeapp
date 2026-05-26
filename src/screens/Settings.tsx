import React from 'react';
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Palette,
  PenTool,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';

type SettingsItem = {
  label: string;
  description: string;
  path: string;
};

type SettingsSection = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: SettingsItem[];
};

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'account',
    title: 'Account',
    description: 'Personal info, password, and privacy',
    icon: User,
    items: [
      { label: 'Profile Info', description: 'Edit your name, username, bio, and avatar', path: '/settings/account/profile' },
      { label: 'Change Password', description: 'Update your sign-in password', path: '/settings/account/password' },
      { label: 'Privacy', description: 'Control account visibility and safety options', path: '/settings/account/privacy' },
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Theme, display mode, and visual preferences',
    icon: Palette,
    items: [
      { label: 'Theme', description: 'Choose the app theme and display style', path: '/settings/appearance' },
    ],
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Reader font size, scroll mode, and layout',
    icon: BookOpen,
    items: [
      { label: 'Reader Preferences', description: 'Adjust text size and reading behavior', path: '/settings/reading' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Email and push notification alerts',
    icon: Bell,
    items: [
      { label: 'Notification Settings', description: 'Choose which updates you receive', path: '/settings/notifications' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Wallet and premium status',
    icon: CreditCard,
    items: [
      { label: 'Wallet', description: 'Manage balance and payment history', path: '/wallet' },
      { label: 'Premium Subscription', description: 'Review premium plans and access', path: '/premium' },
    ],
  },
  {
    id: 'creator',
    title: 'Creator',
    description: 'Support and portfolio settings',
    icon: PenTool,
    items: [
      { label: 'Creator Settings', description: 'Manage support links and creator profile', path: '/settings/creator' },
      { label: 'Studio', description: 'Open your creator workspace', path: '/studio' },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    description: 'Help, reports, and legal pages',
    icon: HelpCircle,
    items: [
      { label: 'Help Center', description: 'Find answers and contact support', path: '/help' },
      { label: 'Report a Problem', description: 'Tell us about a bug or safety issue', path: '/help/report-problem' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    description: 'Terms and privacy rules',
    icon: ShieldCheck,
    items: [
      { label: 'Terms', description: 'Read Lemonade terms of service', path: '/terms' },
      { label: 'Privacy Policy', description: 'Review how your data is handled', path: '/privacy' },
    ],
  },
  {
    id: 'admin',
    title: 'Platform Admin',
    description: 'Internal infrastructure login',
    icon: LayoutDashboard,
    items: [
      { label: 'Admin Dashboard', description: 'Open the admin sign-in page', path: '/admin/login' },
    ],
  },
];

export default function Settings() {
  const { logout, user } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-5 md:p-10 xl:p-12 max-w-6xl mx-auto pb-32 md:pb-12">
      <header className="flex flex-col gap-6 mb-8 md:mb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Back to profile"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-black text-3xl md:text-5xl leading-none">Settings</h1>
              <p className="text-white/35 font-bold text-sm mt-2">Manage your account, reader, creator, and platform preferences.</p>
            </div>
          </div>

          {user && (
            <button
              onClick={() => navigate('/settings/account/profile')}
              className="hidden md:flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors text-left max-w-xs"
            >
              <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover bg-white/5 shrink-0" alt="" referrerPolicy="no-referrer" />
              <span className="min-w-0">
                <span className="block text-sm font-black truncate">{user.name}</span>
                <span className="block text-xs text-white/40 font-bold truncate">@{user.username}</span>
              </span>
            </button>
          )}
        </div>

        {user && (
          <button
            onClick={() => navigate('/settings/account/profile')}
            className="md:hidden flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors text-left"
          >
            <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover bg-white/5 shrink-0" alt="" referrerPolicy="no-referrer" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black truncate">{user.name}</span>
              <span className="block text-xs text-white/40 font-bold truncate">@{user.username}</span>
            </span>
            <ChevronRight size={18} className="text-white/20" />
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;

          return (
            <section key={section.id} className="bg-ink-deep/70 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-lemon-muted/10 text-lemon-muted border border-lemon-muted/20 flex items-center justify-center shrink-0">
                  <Icon size={21} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-black text-xl leading-tight">{section.title}</h2>
                  <p className="text-xs text-white/35 font-bold mt-1 leading-relaxed">{section.description}</p>
                </div>
              </div>

              <div className="p-2">
                {section.items.map((item) => (
                  <button
                    key={`${section.id}-${item.label}`}
                    onClick={() => navigate(item.path)}
                    className="w-full min-h-[72px] rounded-xl px-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors group"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-white group-hover:text-lemon-muted transition-colors">{item.label}</span>
                      <span className="block text-xs text-white/35 font-bold mt-1 leading-relaxed">{item.description}</span>
                    </span>
                    <ChevronRight size={18} className="text-white/15 group-hover:text-lemon-muted transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full md:w-auto min-h-12 flex items-center justify-center gap-3 text-red-400 hover:text-red-300',
            'font-black px-6 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition-colors',
          )}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
