import React from 'react';
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
  Plus, 
  UserCircle,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AppContext';
import { SensitiveActionWrapper } from './SensitiveActionWrapper';

export default function NavigationLayout() {
  const location = useLocation();
  const { user, isAuthenticated, isGuest } = useAuth();
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

  // Desktop sidebar items
  const mainNav = [
    { name: 'Home', path: '/home', icon: Home, sensitive: false },
    { name: 'Explore', path: '/explore', icon: Compass, sensitive: false },
    { name: 'Library', path: '/library', icon: BookMarked, sensitive: true },
    { name: 'Studio', path: '/studio', icon: PenTool, sensitive: true },
  ];

  const desktopExtra = [
    { name: 'Wallet', path: '/wallet', icon: Wallet, sensitive: true },
    { name: 'Notifications', path: '/notifications', icon: Bell, sensitive: true },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, sensitive: false },
  ];

  const appNav = isStudio ? [
    { name: 'Dashboard', path: '/studio', icon: Home },
    { name: 'Upload', path: '/studio/upload', icon: PenTool },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Reader App', path: '/home', icon: Compass },
  ] : mainNav;

  // Pages where nav components are hidden
  const hideNavPages = ['/', '/onboarding', '/auth'];
  const isReaderView = location.pathname.startsWith('/read/');
  const shouldHideNav = hideNavPages.includes(location.pathname) || isReaderView;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black-core">
      {/* Desktop Sidebar */}
      {!shouldHideNav && (
        <aside id="desktop-sidebar" className="hidden md:flex flex-col w-64 border-r border-ink-deep bg-black-core p-6 z-20">
          <Link to="/home" id="sidebar-logo" className="mb-10 font-display font-black text-2xl tracking-tighter text-lemon-muted">
            LEMONADE<span className="text-white">.</span>
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
                <img src={user?.avatar} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-lemon-muted/50 transition-all shadow-lg" referrerPolicy="no-referrer" />
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

      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Mobile Top Bar */}
        {!shouldHideNav && (
          <div id="mobile-top-bar" className="md:hidden sticky top-0 left-0 right-0 h-16 bg-black-core/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40">
            <Link to="/home" id="mobile-logo" className="font-display font-black text-xl tracking-tighter text-lemon-muted">
              LEMONADE<span className="text-white">.</span>
            </Link>
            <div className="flex items-center gap-5">
              <SensitiveActionWrapper intent="studio">
                <Link to="/studio" id="mobile-studio-trigger" className="text-white/70 hover:text-white transition-colors">
                  <PenTool size={22} />
                </Link>
              </SensitiveActionWrapper>
              <Link to="/notifications" id="mobile-notifications-trigger" className="text-white/70 hover:text-white transition-colors relative">
                <Bell size={22} />
                {user?.notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-lemon-muted rounded-full animate-pulse" />
                )}
              </Link>
              <Link to="/settings" id="mobile-settings-link" className="text-white/70 hover:text-white transition-colors">
                <SettingsIcon size={22} />
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main 
          className={cn(
            "flex-1 relative overflow-y-auto overflow-x-hidden hide-scrollbar",
            !shouldHideNav ? "pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-0" : ""
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

        {/* Mobile FAB */}
        {!shouldHideNav && (
           <div id="mobile-fab-container" className="md:hidden fixed right-6 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[51]">
              {isCreatorMode ? (
                <Link to="/studio/upload" id="fab-studio-upload">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 bg-lemon-muted rounded-full flex items-center justify-center text-black shadow-2xl shadow-lemon-muted/20 border-2 border-black/10"
                  >
                    <Plus size={28} />
                  </motion.button>
                </Link>
              ) : (
                <Link to="/explore" id="fab-reader-explore">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 bg-lemon-muted rounded-full flex items-center justify-center text-black shadow-2xl shadow-lemon-muted/20 border-2 border-black/10"
                  >
                    <Search size={28} />
                  </motion.button>
                </Link>
              )}
           </div>
        )}

        {/* Mobile Bottom Nav */}
        {!shouldHideNav && (
          <div id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-black-core/90 backdrop-blur-2xl border-t border-white/5 z-50 px-4 py-2 pt-3 flex items-center justify-around pb-[calc(8px+env(safe-area-inset-bottom))]">
            {currentNav.map((item) => {
              const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
              const Icon = item.icon;
              return (
                <SensitiveActionWrapper key={item.path} intent={item.sensitive ? item.name.toLowerCase() : undefined}>
                  <NavLink
                    id={`nav-item-${item.name.toLowerCase()}`}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all relative",
                      isActive ? "text-lemon-muted" : "text-white/40 hover:text-white"
                    )}
                  >
                    <div className="relative">
                      <Icon size={24} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                      {isActive && (
                        <motion.div 
                          layoutId="mobile-nav-dot" 
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-lemon-muted rounded-full" 
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </div>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "opacity-100" : "opacity-0 invisible h-0")}>
                      {item.name}
                    </span>
                  </NavLink>
                </SensitiveActionWrapper>
              );
            })}
          </div>
        )}
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
