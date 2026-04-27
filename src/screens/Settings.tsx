import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  PenTool, 
  ShieldCheck,
  LayoutDashboard,
  Moon,
  Sun,
  Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const SETTINGS_SECTIONS = [
  { 
    id: 'account',
    title: "Account", 
    icon: User, 
    desc: "Personal info, password, and privacy",
    items: ["Profile Info", "Change Password", "Privacy"] 
  },
  { 
    id: 'appearance',
    title: "Appearance", 
    icon: Palette, 
    desc: "Theme, display mode, and aesthetics",
    items: ["Theme", "Auto-Dark Mode"] 
  },
  { 
    id: 'reading',
    title: "Reading", 
    icon: BookOpen, 
    desc: "Font size, scroll mode, and layout",
    items: ["Font Size", "Line Spacing"] 
  },
  { 
    id: 'notifications',
    title: "Notifications", 
    icon: Bell, 
    desc: "Email and push notification alerts",
    items: ["Email updates", "Push notifications"] 
  },
  { 
    id: 'payments',
    title: "Payments", 
    icon: CreditCard, 
    desc: "Wallet and premium status",
    items: ["Wallet", "Premium subscription"] 
  },
  { 
    id: 'creator',
    title: "Creator", 
    icon: PenTool, 
    desc: "Support and portfolio settings",
    items: ["Support Settings", "Portfolio Info"] 
  },
  { 
    id: 'legal',
    title: "Legal", 
    icon: ShieldCheck, 
    desc: "Terms and privacy rules",
    items: ["Terms", "Privacy Policy"] 
  },
  { 
    id: 'admin',
    title: "Platform Admin", 
    icon: LayoutDashboard, 
    desc: "Internal infrastructure login",
    items: ["Admin Dashboard"],
    link: "/admin/login"
  },
];

export default function Settings() {
  const { logout, user, updateSettings } = useApp();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ themeMode: theme as any });
  };

  const handleFontSizeChange = (size: number) => {
    updateSettings({ readerFontSize: size });
  };

  const handleItemClick = (sectionId: string, itemName: string) => {
    if (sectionId === 'admin' && itemName === 'Admin Dashboard') {
      navigate('/admin/login');
      return;
    }

    const routeMap: Record<string, Record<string, string>> = {
      'account': {
        'Profile Info': '/settings/account/profile',
        'Change Password': '/settings/account/password',
        'Privacy': '/settings/account/privacy'
      },
      'appearance': {
        'Theme': '/settings/appearance',
        'Auto-Dark Mode': '/settings/appearance'
      },
      'reading': {
        'Font Size': '/settings/reading',
        'Line Spacing': '/settings/reading'
      },
      'notifications': {
        'Email updates': '/settings/notifications',
        'Push notifications': '/settings/notifications'
      },
      'payments': {
        'Wallet': '/wallet',
        'Premium subscription': '/premium'
      },
      'creator': {
        'Support Settings': '/settings/creator',
        'Portfolio Info': '/settings/creator'
      },
      'legal': {
        'Terms': '/terms',
        'Privacy Policy': '/privacy'
      }
    };

    const targetRoute = routeMap[sectionId]?.[itemName];
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-4xl mx-auto pb-32 md:pb-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display font-black text-3xl md:text-5xl">Settings</h1>
        {user && (
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <img src={user.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
            <span className="text-sm font-bold">{user.username}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
        {/* Desktop Sidebar / Section List */}
        <div className="flex flex-col gap-2">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;
            return (
              <div key={section.id} className="flex flex-col">
                <button 
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left",
                    isExpanded ? "bg-lemon-muted/10 border border-lemon-muted/20" : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isExpanded ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20" : "bg-white/5 text-white/40"
                    )}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-base md:text-lg transition-colors", isExpanded ? "text-lemon-muted" : "text-white")}>{section.title}</h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-black leading-none mt-1.5">{section.desc}</p>
                    </div>
                  </div>
                  <div className="md:hidden">
                    {isExpanded ? <ChevronDown size={18} className="text-lemon-muted" /> : <ChevronRight size={18} className="text-white/20" />}
                  </div>
                </button>

                {/* Mobile Expanded Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      className="md:hidden overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="p-5 bg-ink-deep/50 border border-white/5 rounded-2xl ml-16 mt-2 mb-4">
                        {section.id === 'appearance' ? (
                           <div className="flex flex-col gap-6">
                             <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white/80">Dark Mode</span>
                                <div className="flex bg-black-core rounded-xl p-1.5 border border-white/10 gap-1">
                                  <button onClick={() => handleThemeChange('dark')} className={cn("w-10 h-10 flex items-center justify-center rounded-lg transition-all", user?.settings.themeMode === 'dark' ? "bg-lemon-muted text-black" : "text-white/40 hover:text-white")}><Moon size={16}/></button>
                                  <button onClick={() => handleThemeChange('light')} className={cn("w-10 h-10 flex items-center justify-center rounded-lg transition-all", user?.settings.themeMode === 'light' ? "bg-lemon-muted text-black" : "text-white/40 hover:text-white")}><Sun size={16}/></button>
                                </div>
                             </div>
                           </div>
                        ) : section.id === 'reading' ? (
                          <div className="flex flex-col gap-6">
                             <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white/80">Text size</span>
                                <div className="flex items-center gap-4">
                                   <button onClick={() => handleFontSizeChange((user?.settings.readerFontSize || 18) - 2)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/5 text-lg font-bold">-</button>
                                   <span className="text-sm font-black w-6 text-center text-lemon-muted">{user?.settings.readerFontSize}</span>
                                   <button onClick={() => handleFontSizeChange((user?.settings.readerFontSize || 18) + 2)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/5 text-lg font-bold">+</button>
                                </div>
                             </div>
                           </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {section.items.map((item, i) => (
                              <button 
                                key={i} 
                                onClick={() => handleItemClick(section.id, item)}
                                className="w-full h-12 flex items-center justify-between border-b border-white/5 last:border-0 hover:text-lemon-muted transition-colors text-left text-sm font-bold text-white/60"
                              >
                                {item}
                                <ChevronRight size={14} className="text-white/10" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="mt-8 md:mt-12 pt-8 border-t border-white/10">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-red-500 hover:text-red-400 font-bold px-6 py-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl transition-colors"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>

        {/* Desktop Content Area */}
        <div className="hidden md:block">
          {expandedSection ? (
            <div className="sticky top-12">
              <div className="bg-ink-deep border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                  <h2 className="font-display font-black text-2xl mb-2">{SETTINGS_SECTIONS.find(s => s.id === expandedSection)?.title}</h2>
                  <p className="text-white/40">{SETTINGS_SECTIONS.find(s => s.id === expandedSection)?.desc}</p>
                </div>
                <div className="p-8">
                   {expandedSection === 'appearance' && (
                     <div className="flex flex-col gap-8">
                        <div>
                          <h4 className="font-bold mb-4 flex items-center gap-2"><Palette size={18} className="text-lemon-muted"/> Display Theme</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleThemeChange('dark')} className={cn("p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all", user?.settings.themeMode === 'dark' ? "bg-lemon-muted/10 border-lemon-muted" : "bg-black-core border-white/10 hover:border-white/20")}>
                               <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center"><Moon size={24}/></div>
                               <span className="font-bold">Extreme Dark</span>
                            </button>
                            <button onClick={() => handleThemeChange('light')} className={cn("p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all", user?.settings.themeMode === 'light' ? "bg-lemon-muted/10 border-lemon-muted" : "bg-white border-white/10 hover:border-white/20")}>
                               <div className="w-12 h-12 rounded-full bg-cream-soft flex items-center justify-center text-black"><Sun size={24}/></div>
                               <span className="font-bold text-black">Classic Light</span>
                            </button>
                          </div>
                        </div>
                     </div>
                   )}

                  {expandedSection === 'reading' && (
                     <div className="flex flex-col gap-8">
                        <div>
                          <h4 className="font-bold mb-4 flex items-center gap-2"><Type size={18} className="text-lemon-muted"/> Text Size</h4>
                          <div className="bg-black-core p-8 rounded-2xl border border-white/10 flex items-center gap-8">
                             <div className="flex items-center gap-4 flex-1">
                                <button onClick={() => handleFontSizeChange((user?.settings.readerFontSize || 18) - 2)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 font-bold text-xl">-</button>
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-lemon-muted transition-all" style={{ width: `${((user?.settings.readerFontSize || 18) - 12) / 16 * 100}%` }} />
                                </div>
                                <button onClick={() => handleFontSizeChange((user?.settings.readerFontSize || 18) + 2)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 font-bold text-xl">+</button>
                             </div>
                             <div className="shrink-0 font-display font-black text-3xl text-lemon-muted">{user?.settings.readerFontSize}pt</div>
                          </div>
                        </div>
                     </div>
                   )}

                   {expandedSection !== 'appearance' && expandedSection !== 'reading' && (
                     <div className="flex flex-col gap-4">
                        {SETTINGS_SECTIONS.find(s => s.id === expandedSection)?.items.map((item, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleItemClick(expandedSection!, item)}
                            className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all text-left group"
                          >
                            <span className="font-bold text-lg group-hover:text-lemon-muted transition-colors">{item}</span>
                            <ChevronRight size={20} className="text-white/10 group-hover:text-lemon-muted transition-colors" />
                          </button>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-24 border-2 border-dashed border-white/10 rounded-3xl">
              <LayoutDashboard size={64} className="mb-4" />
              <p className="font-display font-bold text-xl uppercase tracking-widest">Select a section to edit settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
