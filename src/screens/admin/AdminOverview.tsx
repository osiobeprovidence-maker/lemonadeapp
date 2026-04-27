import React from 'react';
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
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function AdminOverview() {
  const { allUsers, applications, reports, activityLog, stories } = useApp();
  const navigate = useNavigate();

  const handleExport = () => {
    alert('Mock Report Exported as CSV');
  };

  const stats = [
    { label: 'Total Users', value: allUsers.length + 1250, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%', path: '/admin/users' },
    { label: 'Total Stories', value: stories.length + 42, icon: Star, color: 'text-lemon-muted', bg: 'bg-lemon-muted/10', trend: '+5%', path: '/admin/stories' },
    { label: 'Applications', value: applications.length, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'Pending', path: '/admin/applications' },
    { label: 'Reports', value: reports.length, icon: Flag, color: 'text-red-500', bg: 'bg-red-500/10', trend: '-2%', path: '/admin/reports' },
    { label: 'Creators', value: 84, icon: PenTool, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+18%', path: '/admin/creators' },
    { label: 'Revenue', value: '₦4.2M', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', trend: '+24%', path: '/admin/payments' },
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
                <h3 className="text-2xl font-display font-black">{stat.value}</h3>
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-black",
                  stat.trend.startsWith('+') ? "text-green-500" : stat.trend === 'Pending' ? "text-orange-500" : "text-red-500"
                )}>
                  {stat.trend.startsWith('+') && <ArrowUpRight size={14} />}
                  {stat.trend.startsWith('-') && <ArrowDownRight size={14} />}
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
                 {activityLog.length > 0 ? (
                   activityLog.slice(0, 8).map((log) => (
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
                { label: 'Database Status', val: 'Operational', status: 'optimal' },
                { label: 'Studio API', val: 'Operational', status: 'optimal' },
                { label: 'CDN Connectivity', val: 'Optimal', status: 'optimal' },
                { label: 'Payment Gateway', val: 'Operational', status: 'optimal' },
                { label: 'Wallet Sync', val: '99.9% Refreshed', status: 'warning' },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-ink-deep border border-white/5 rounded-2xl flex items-center justify-between">
                   <p className="text-xs font-bold text-white/40 tracking-wide uppercase">{item.label}</p>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.val}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.status === 'optimal' ? "bg-green-500" : "bg-orange-500"
                      )} />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="p-8 bg-lemon-muted rounded-[2rem] text-black">
              <h4 className="font-black italic uppercase text-lg mb-2">Super Admin Tip</h4>
              <p className="text-xs font-bold leading-relaxed mb-4">Don't forget to review the pending creator applications before the weekend rush. High traffic expected on Sunday evening.</p>
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
