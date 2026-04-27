import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  PenTool, 
  FileText, 
  Flag, 
  CreditCard, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  BadgeCheck,
  ChevronRight,
  TrendingUp,
  Box
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { label: 'Analytics', icon: TrendingUp, path: '/admin/analytics' },
  { label: 'Activity', icon: FileText, path: '/admin/activity' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Creators', icon: PenTool, path: '/admin/creators' },
  { label: 'Applications', icon: FileText, path: '/admin/applications' },
  { label: 'Stories', icon: Box, path: '/admin/stories' },
  { label: 'Reports', icon: Flag, path: '/admin/reports' },
  { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { label: 'DropSomething', icon: ExternalLink, path: '/admin/dropsomething' },
  { label: 'Premium', icon: Star, path: '/admin/premium' },
  { label: 'Moderators', icon: ShieldCheck, path: '/admin/moderators', superAdminOnly: true },
  { label: 'Featured Content', icon: BadgeCheck, path: '/admin/featured' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { adminSession, adminLogout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const filteredNavItems = NAV_ITEMS.filter(item => 
    !item.superAdminOnly || adminSession?.role === 'super_admin'
  );

  return (
    <div className="flex min-h-screen bg-black-core text-white font-sans selection:bg-lemon-muted selection:text-black">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-ink-deep border-r border-white/5 sticky top-0 h-screen overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-lemon-muted rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-xl">L</span>
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-tight leading-none">LEMONADE</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-lemon-muted mt-1">Admin Panel</p>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl mb-8 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Users size={20} className="text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{adminSession?.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                   {adminSession?.role === 'super_admin' && (
                     <span className="text-[9px] font-black uppercase tracking-wider text-lemon-muted bg-lemon-muted/10 px-1.5 py-0.5 rounded">Super Admin</span>
                   )}
                   {adminSession?.role !== 'super_admin' && (
                     <span className="text-[9px] font-black uppercase tracking-wider text-white/40 bg-white/5 px-1.5 py-0.5 rounded">Moderator</span>
                   )}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl transition-all group",
                    isActive 
                      ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={20} className={cn(isActive ? "text-black" : "group-hover:text-lemon-muted")} />
                  <span className="text-sm font-bold">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 pt-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-ink-deep border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-lemon-muted rounded-lg flex items-center justify-center">
             <span className="text-black font-black text-sm">L</span>
           </div>
           <h1 className="font-display font-black text-base tracking-tight">LEMONADE ADMIN</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-white/60"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-ink-deep z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-lemon-muted rounded-lg flex items-center justify-center">
                     <span className="text-black font-black text-sm">L</span>
                   </div>
                   <h1 className="font-display font-black text-base tracking-tight uppercase">Dashboard</h1>
                </div>
                <button onClick={closeMobileMenu} className="p-2 -mr-2 text-white/40">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="p-4 bg-white/5 rounded-2xl mb-6 border border-white/5">
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">User</p>
                  <p className="text-sm font-bold truncate text-lemon-muted">{adminSession?.email}</p>
                  <p className="text-[10px] font-black uppercase text-white/40 mt-1">{adminSession?.role?.replace('_', ' ')}</p>
                </div>

                <nav className="flex flex-col gap-1">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl transition-all",
                          isActive 
                            ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10" 
                            : "text-white/40 hover:text-white"
                        )}
                      >
                        <Icon size={20} />
                        <span className="text-base font-bold">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6 mt-auto border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-4 rounded-xl text-red-400 bg-red-400/5 transition-all"
                >
                  <LogOut size={20} />
                  <span className="text-base font-bold">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col pt-16 lg:pt-0 min-w-0">
        <header className="hidden lg:flex h-20 bg-ink-deep/50 backdrop-blur-xl border-b border-white/5 px-10 items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-2">
              <span className="text-white/40 text-sm">Dashboard</span>
              <ChevronRight size={14} className="text-white/20" />
              <span className="text-sm font-bold capitalize">{location.pathname.split('/').pop() || 'Overview'}</span>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <TrendingUp size={12} className="text-lemon-muted" />
                Live: {Math.floor(Math.random() * 100) + 50} Online
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-xs font-bold leading-none">{adminSession?.email.split('@')[0]}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-lemon-muted mt-1">Super Admin</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-lemon-muted flex items-center justify-center text-black font-black">
                   R
                 </div>
              </div>
           </div>
        </header>

        <section className="flex-1 p-6 lg:p-10">
          {children}
        </section>
      </main>
    </div>
  );
}
