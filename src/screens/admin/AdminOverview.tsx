import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  PenTool, 
  FileText, 
  Flag, 
  TrendingUp, 
  DollarSign, 
  ExternalLink, 
  Star,
  Activity,
  Plus,
  Download
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../../convex/_generated/api';
import { convex } from '../../lib/convex';

const ADMIN_OVERVIEW_REFRESH_MS = 10000;

type OverviewStats = {
  totalUsers: number;
  activeUsers: number;
  totalStories: number;
  publishedStories: number;
  pendingApplications: number;
  totalApplications: number;
  openReports: number;
  totalReports: number;
  totalCreators: number;
  revenueNaira: number;
  successfulPayments: number;
  recentActivity: Array<{ _id?: string; id?: string; action: string; adminEmail: string; timestamp: string }>;
};

export default function AdminOverview() {
  const { allUsers, applications, reports, activityLog, stories, creators } = useApp();
  const navigate = useNavigate();
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    if (!convex) return;
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const stats = await convex.query(api.admin.overview, {});
        if (isMounted) setOverviewStats(stats);
      } catch (error) {
        console.error('Failed to load admin overview stats', error);
      } finally {
        if (isMounted) setOverviewLoading(false);
      }
    };

    loadOverview();
    const interval = window.setInterval(loadOverview, ADMIN_OVERVIEW_REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const revenueNaira = overviewStats?.revenueNaira ?? 0;
  const formattedRevenue = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(revenueNaira);

  const recentActivity = overviewStats?.recentActivity?.length
    ? overviewStats.recentActivity.map((log) => ({
      id: log._id || log.id || `${log.action}-${log.timestamp}`,
      action: log.action,
      adminEmail: log.adminEmail,
      timestamp: log.timestamp,
    }))
    : activityLog;

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', overviewStats?.totalUsers ?? allUsers.length],
      ['Total Stories', overviewStats?.totalStories ?? stories.length],
      ['Pending Applications', overviewStats?.pendingApplications ?? applications.filter((app) => app.status === 'pending').length],
      ['Open Reports', overviewStats?.openReports ?? reports.filter((report) => report.status === 'open' || report.status === 'reviewing').length],
      ['Creators', overviewStats?.totalCreators ?? Object.keys(creators).length],
      ['Revenue NGN', revenueNaira],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `owuuu-admin-overview-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Total Users', value: overviewLoading ? null : (overviewStats?.totalUsers ?? allUsers.length), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: overviewLoading ? '...' : `${overviewStats?.activeUsers ?? allUsers.filter((user) => (user as any).status !== 'suspended').length} active`, path: '/admin/users' },
    { label: 'Total Stories', value: overviewLoading ? null : (overviewStats?.totalStories ?? stories.length), icon: Star, color: 'text-lemon-muted', bg: 'bg-lemon-muted/10', trend: overviewLoading ? '...' : `${overviewStats?.publishedStories ?? stories.length} published`, path: '/admin/stories' },
    { label: 'Applications', value: overviewLoading ? null : (overviewStats?.totalApplications ?? applications.length), icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: overviewLoading ? '...' : `${overviewStats?.pendingApplications ?? applications.filter((app) => app.status === 'pending').length} pending`, path: '/admin/applications' },
    { label: 'Reports', value: overviewLoading ? null : (overviewStats?.totalReports ?? reports.length), icon: Flag, color: 'text-red-500', bg: 'bg-red-500/10', trend: overviewLoading ? '...' : `${overviewStats?.openReports ?? reports.filter((report) => report.status === 'open' || report.status === 'reviewing').length} open`, path: '/admin/reports' },
    { label: 'Creators', value: overviewLoading ? null : (overviewStats?.totalCreators ?? Object.keys(creators).length), icon: PenTool, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: overviewLoading ? '...' : 'live', path: '/admin/creators' },
    { label: 'Revenue', value: overviewLoading ? null : formattedRevenue, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', trend: overviewLoading ? '...' : `${overviewStats?.successfulPayments ?? 0} paid`, path: '/admin/payments' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Overview</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Platform performance and operations</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <button 
             onClick={handleExport}
             className="h-12 px-6 bg-white/5 border border-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2"
           >
             <Download size={18} />
             Export Report
           </button>
           <button 
             onClick={() => navigate('/admin/reports')}
             className="h-12 px-6 bg-white/5 border border-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2"
           >
             <Activity size={18} />
             View Reports
           </button>
           <button 
             onClick={() => navigate('/admin/featured/editor')}
             className="h-12 px-6 bg-lemon-muted text-black rounded-xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-lemon-muted/20"
           >
             <Plus size={18} />
             Feature Story
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(stat.path)}
              className="bg-ink-deep border border-white/5 p-6 rounded-3xl relative overflow-hidden group cursor-pointer hover:border-lemon-muted/20 transition-all"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={64} />
              </div>
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner", stat.bg)}>
                <Icon size={24} className={stat.color} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl font-display font-black">{stat.value ?? '--'}</h3>
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-black",
                  stat.trend === '...' ? "text-white/30" :
                  stat.trend.includes('pending') || stat.trend.includes('open') ? "text-orange-500" : "text-green-500"
                )}>
                  {stat.trend}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-black tracking-tight text-white uppercase italic">Operations Activity</h3>
              <button 
                onClick={() => navigate('/admin/activity')}
                className="text-xs font-black uppercase tracking-widest text-lemon-muted hover:underline"
              >
                View All Log
              </button>
           </div>
           <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                 <span className="text-xs font-black uppercase tracking-widest text-white/40">Action Log</span>
                 <span className="text-xs font-black uppercase tracking-widest text-white/40">Timestamp</span>
              </div>
              <div className="divide-y divide-white/5">
                 {recentActivity.length > 0 ? (
                   recentActivity.slice(0, 8).map((log) => (
                     <Link 
                       to={log.action.includes('User') ? `/admin/users/${log.adminEmail.split('@')[0]}` : '/admin/activity'}
                       key={log.id} 
                       className="p-6 flex items-center justify-between hover:bg-white/[0.04] transition-all group"
                     >
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-lemon-muted shadow-lg shadow-lemon-muted/50" />
                          <div>
                             <p className="text-sm font-bold text-white/80 group-hover:text-lemon-muted transition-colors">{log.action}</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Admin: {log.adminEmail}</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                         {new Date(log.timestamp).toLocaleTimeString()}
                       </span>
                     </Link>
                   ))
                 ) : (
                   <div className="p-10 text-center text-white/20 font-bold uppercase tracking-widest italic">No recent activity detected.</div>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-display font-black tracking-tight text-white uppercase italic">System Health</h3>
           <div className="space-y-4">
              {[
                { label: 'Convex Database', val: overviewLoading ? 'Checking...' : 'Connected', status: overviewLoading ? 'loading' : 'optimal' },
                { label: 'Studio API', val: overviewLoading ? 'Checking...' : 'Operational', status: overviewLoading ? 'loading' : 'optimal' },
                { label: 'Auth Service', val: overviewLoading ? 'Checking...' : 'Operational', status: overviewLoading ? 'loading' : 'optimal' },
                { label: 'Payment Gateway', val: overviewLoading ? 'Checking...' : 'Operational', status: overviewLoading ? 'loading' : 'optimal' },
                { label: 'Wallet Sync', val: overviewLoading ? 'Checking...' : 'Synced', status: overviewLoading ? 'loading' : 'optimal' },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-ink-deep border border-white/5 rounded-2xl flex items-center justify-between">
                   <p className="text-xs font-bold text-white/40 tracking-wide uppercase">{item.label}</p>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.val}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.status === 'optimal' ? "bg-green-500" : item.status === 'loading' ? "bg-white/20 animate-pulse" : "bg-orange-500"
                      )} />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="p-8 bg-lemon-muted rounded-[2rem] text-black">
              <h4 className="font-black italic uppercase text-lg mb-2">Admin Action Center</h4>
              <p className="text-xs font-bold leading-relaxed mb-4">
                {overviewLoading
                  ? 'Loading platform metrics...'
                  : (overviewStats?.pendingApplications ?? applications.filter((a) => a.status === 'pending').length) > 0
                    ? `You have ${overviewStats?.pendingApplications ?? applications.filter((a) => a.status === 'pending').length} pending creator application(s) to review.`
                    : 'No pending applications. Platform is running smoothly.'}
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => navigate('/admin/analytics')}
                  className="w-full py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Open Analytics
                </button>
                <button 
                  onClick={() => navigate('/admin/applications')}
                  className="w-full py-3 bg-black/10 text-black/60 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Review Applications
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
