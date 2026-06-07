import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  BookMarked, 
  PenTool, 
  Search, 
  Bell, 
  Settings as SettingsIcon, 
  Wallet, 
  ChevronRight, 
  Crown, 
  UserCircle,
  Gift,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AppContext';
import { SensitiveActionWrapper } from './SensitiveActionWrapper';
import { AppSkeleton } from './ui/Skeleton';

export default function NavigationLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isGuest, contentLoading } = useAuth();
  const isStudio = location.pathname.startsWith('/studio');
  const userRole = user?.role || (isGuest ? 'reader' : 'reader');
  const isCreatorMode = userRole === 'creator' || isStudio;

  // Navigation Items by User Role
  const readerNav = [
    { name: 'Home', path: '/home', icon: Home, sensitive: false },
    { name: 'Explore', path: '/explore', icon: Compass, sensitive: false },
    { name: 'Library', path: '/library', icon: BookMarked, sensitive: true },
    { name: 'Wallet', path: '/wallet', icon: Wallet, sensitive: true },
    { name: 'Profile', path: '/profile', icon: UserCircle, sensitive: true },
  ];

  const creatorNav = [
    { name: 'Home', path: '/home', icon: Home, sensitive: false },
    { name: 'Explore', path: '/explore', icon: Compass, sensitive: false },
    { name: 'Studio', path: '/studio', icon: PenTool, sensitive: true },
    { name: 'Wallet', path: '/wallet', icon: Wallet, sensitive: true },
    { name: 'Profile', path: '/profile', icon: UserCircle, sensitive: true },
  ];

  const currentNav = isCreatorMode ? creatorNav : readerNav;

  useEffect(() => {
    if (!drawerOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [drawerOpen]);

  // Desktop sidebar items
  const mainNav = [
    { name: 'Home', path: '/home', icon: Home, sensitive: false },
    { name: 'Explore', path: '/explore', icon: Compass, sensitive: false },
    { name: 'Library', path: '/library', icon: BookMarked, sensitive: true },
    { name: 'Studio', path: '/studio', icon: PenTool, sensitive: true },
  ];

  const desktopExtra = [
    { name: 'Wallet', path: '/wallet', icon: Wallet, sensitive: true },
    { name: 'Rewards', path: '/rewards', icon: Gift, sensitive: false },
    { name: 'Notifications', path: '/notifications', icon: Bell, sensitive: true },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, sensitive: false },
  ];

  const appNav = isStudio ? [
    { name: 'Dashboard', path: '/studio', icon: Home },
    { name: 'Upload', path: '/studio/upload', icon: PenTool },
    { name: 'Wallet', path: '/studio/wallet', icon: Wallet },
    { name: 'Reader App', path: '/home', icon: Compass },
  ] : mainNav;

  // Pages where nav components are hidden
  const hideNavPages = ['/', '/onboarding', '/auth'];
  const isReaderView = location.pathname.startsWith('/read/');
  const shouldHideNav = hideNavPages.includes(location.pathname) || isReaderView;

  if (contentLoading) {
    return <AppSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full bg-black-core">
      {/* Desktop Sidebar */}
      {!shouldHideNav && (
        <aside id="desktop-sidebar" className="hidden lg:flex flex-col w-64 border-r border-ink-deep bg-black-core p-6 z-20">
          <Link to="/home" id="sidebar-logo" className="mb-10 font-display font-black text-2xl tracking-tighter text-lemon-muted">
            OWUUU
          </Link>
          
          <nav id="desktop-main-nav" className="flex-1 flex flex-col gap-2">
            <div className="text-xs uppercase tracking-widest text-[#666] font-semibold mb-2 mt-4 ml-3">Menu</div>
            {appNav.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}

            {!isStudio && (
              <>
                <div className="text-xs uppercase tracking-widest text-[#666] font-semibold mb-2 mt-8 ml-3">Account</div>
                {desktopExtra.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </>
            )}
          </nav>
          
          <div className="mt-auto">
            {isAuthenticated ? (
              <Link to="/profile" id="sidebar-profile-link" className="flex items-center gap-3 p-3 hover:bg-ink-deep rounded-2xl transition relative group">
                <div className="relative">
                  <img src={user?.avatar} alt="User" className={cn("w-10 h-10 rounded-full object-cover transition-all shadow-lg", user?.isPremium ? "ring-2 ring-lemon-muted ring-offset-2 ring-offset-black" : "group-hover:ring-lemon-muted/50")} referrerPolicy="no-referrer" />
                  {user?.isPremium && (
                    <div className="absolute -top-1 -right-1 bg-lemon-muted text-black rounded-full p-0.5 shadow-lg border border-black">
                      <Crown size={8} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm truncate">{user?.name}</span>
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest truncate">View Profile</span>
                </div>
                <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={14} className="text-lemon-muted" />
                </div>
              </Link>
            ) : (
              <Link to="/auth" className="flex items-center gap-3 p-3 hover:bg-ink-deep rounded-2xl transition group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <UserCircle size={22} className="text-white/40" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Sign In</span>
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">To access full features</span>
                </div>
              </Link>
            )}
          </div>
        </aside>
      )}

      <div className="flex-1 min-w-0 w-full flex flex-col relative h-full">
        {/* Mobile Top Bar */}
        {!shouldHideNav && (
          <>
            <div id="mobile-top-bar" className="lg:hidden sticky top-0 left-0 right-0 h-14 bg-[#0A0A0A]/92 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-40">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={drawerOpen}
                aria-controls="mobile-menu-drawer"
                onClick={() => setDrawerOpen(true)}
                className="h-9 w-9 rounded-2xl bg-[#171717] text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <Menu size={20} />
              </button>
              <Link to="/home" id="mobile-logo" className="font-display font-black text-[15px] tracking-tight text-lemon-muted uppercase">
                OWUUU
              </Link>
              <Link
                to="/explore"
                aria-label="Search stories"
                className="h-9 w-9 rounded-2xl bg-[#171717] text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <Search size={18} />
              </Link>
            </div>
            <AnimatePresence>
              {drawerOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                  onClick={() => setDrawerOpen(false)}
                >
                  <motion.aside
                    id="mobile-menu-drawer"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile menu"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    className="absolute left-0 top-0 bottom-0 flex w-[80%] max-w-xs flex-col overflow-y-auto border-r border-white/10 bg-[#111] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl shadow-black/70"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <Link to="/home" onClick={() => setDrawerOpen(false)} className="font-display text-xl font-black text-lemon-muted">
                        OWUUU
                      </Link>
                      <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setDrawerOpen(false)}
                        className="p-2 rounded-2xl bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <nav className="flex flex-col gap-2">
                      {currentNav.map((item) => (
                        <SensitiveActionWrapper key={item.path} intent={item.sensitive ? item.name.toLowerCase() : undefined}>
                          <NavLink
                            to={item.path}
                            className={({ isActive }) => cn(
                              "flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-colors",
                              isActive ? "bg-lemon-muted/10 text-lemon-muted" : "text-white/80 hover:bg-white/5 hover:text-white"
                            )}
                            onClick={() => setDrawerOpen(false)}
                          >
                            <item.icon size={18} />
                            {item.name}
                          </NavLink>
                        </SensitiveActionWrapper>
                      ))}
                    </nav>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <div className="mb-3 text-xs uppercase tracking-widest text-white/40">More</div>
                      <div className="flex flex-col gap-2">
                        {desktopExtra.map((item) => (
                          <SensitiveActionWrapper key={item.path} intent={item.sensitive ? item.name.toLowerCase() : undefined}>
                            <NavLink
                              to={item.path}
                              className={({ isActive }) => cn(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                                isActive ? "bg-lemon-muted/10 text-lemon-muted" : "text-white/70 hover:bg-white/5 hover:text-white"
                              )}
                              onClick={() => setDrawerOpen(false)}
                            >
                              <item.icon size={18} />
                              {item.name}
                            </NavLink>
                          </SensitiveActionWrapper>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto border-t border-white/10 pt-5">
                      <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Account</div>
                      {isAuthenticated ? (
                        <Link to="/profile" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 rounded-3xl p-4 bg-white/5 hover:bg-white/10 transition-colors">
                          <img src={user?.avatar} alt="User avatar" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-semibold">{user?.name}</p>
                            <p className="text-xs text-white/50">View profile</p>
                          </div>
                        </Link>
                      ) : (
                        <Link to="/auth" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 rounded-3xl p-4 bg-white/5 hover:bg-white/10 transition-colors">
                          <UserCircle size={24} />
                          <div>
                            <p className="font-semibold">Sign In</p>
                            <p className="text-xs text-white/50">Access your library</p>
                          </div>
                        </Link>
                      )}
                    </div>
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Main Content Area */}
        <main 
          className={cn(
            "flex-1 min-w-0 w-full relative overflow-y-auto overflow-x-hidden hide-scrollbar",
            !shouldHideNav ? "pb-[calc(22px+env(safe-area-inset-bottom))] lg:pb-0" : ""
          )}
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>

      </div>
    </div>
  );
}

function NavItem({ item }: { item: any, key?: React.Key }) {
  const location = useLocation();
  const isActive = location.pathname === item.path || (item.path !== '/home' && location.pathname.startsWith(item.path));
  const Icon = item.icon;

  return (
    <SensitiveActionWrapper intent={item.sensitive ? item.name.toLowerCase() : undefined}>
      <NavLink
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all relative group",
          isActive ? "text-lemon-muted font-medium bg-lemon-muted/5" : "text-white/60 hover:text-white hover:bg-ink-deep"
        )}
      >
        <Icon size={20} className={cn("transition-colors", isActive ? "text-lemon-muted" : "text-white/50 group-hover:text-white")} />
        <span>{item.name}</span>
      </NavLink>
    </SensitiveActionWrapper>
  )
}
