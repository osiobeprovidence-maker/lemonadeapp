import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Users, Calendar, Download, Zap, Crown, UserPlus, Clock, MoreVertical, Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminPremium() {
  const { allUsers } = useApp();
  const navigate = useNavigate();
  const premiumUsers = allUsers.filter(u => u.premiumStatus === 'premium');

  const stats = [
    { label: 'Active Subscribers', value: '422', icon: Crown, color: 'text-lemon-muted' },
    { label: 'Trial Members', value: '1,208', icon: Clock, color: 'text-blue-500' },
    { label: 'Conversion Rate', value: '18.4%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Churn Rate', value: '2.1%', icon: Zap, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Premium Ecosystem</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Subscription metrics and member management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-ink-deep border border-white/5 rounded-[2rem] space-y-4">
             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/5", stat.color)}>
                <stat.icon size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                <h3 className="text-2xl font-display font-black">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
           <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-lg font-bold">Premium Subscribers</h3>
              <div className="relative group">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                 <input 
                   type="text" 
                   placeholder="Search members..." 
                   className="h-9 bg-black border border-white/5 rounded-full pl-9 pr-4 text-xs font-bold text-white focus:outline-none focus:border-lemon-muted transition-all"
                 />
              </div>
           </div>
            <div className="divide-y divide-white/5">
              {premiumUsers.map((u) => (
                <div key={u.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                   <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/admin/users/${u.id}`)}>
                      <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl border border-white/10 group-hover:border-lemon-muted transition-colors" />
                      <div>
                         <p className="font-bold text-sm group-hover:text-lemon-muted transition-colors">@{u.username}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Subscribed: Mar 12, 2026</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-lemon-muted bg-lemon-muted/10 px-2 py-1 rounded">Yearly Plan</span>
                      <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <MoreVertical size={16} />
                      </button>
                   </div>
                </div>
              ))}
              {premiumUsers.length === 0 && (
                <div className="p-20 text-center text-white/20 italic">No premium users found.</div>
              )}
           </div>
        </div>

        <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] p-8">
           <h3 className="text-xl font-display font-black uppercase italic mb-8">Revenue Forecast</h3>
           <div className="space-y-8">
              {[
                { label: 'Monthly MRR', value: '₦1.2M', progress: 75, color: 'bg-lemon-muted' },
                { label: 'Yearly ARR', value: '₦14.4M', progress: 60, color: 'bg-blue-500' },
                { label: 'Trial Conversion', value: '18%', progress: 85, color: 'bg-green-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                   <div className="flex items-end justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40">{item.label}</p>
                      <p className="text-lg font-display font-black">{item.value}</p>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.progress}%` }} />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                 <TrendingUp size={20} className="text-green-500" />
                 <h4 className="font-bold text-sm">Growth Target</h4>
              </div>
              <p className="text-xs text-white/40 font-medium leading-relaxed">Reach 500 active yearly subscribers by the end of Q2 to unlock platform expansion phases.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
