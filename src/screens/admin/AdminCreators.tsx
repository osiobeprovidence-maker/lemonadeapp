import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PenTool, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  Users,
  Box,
  Eye,
  Star,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminCreators() {
  const { creators, updateUserStatus } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'featured'>('all');

  const creatorList = Object.values(creators) as any[];

  const filteredCreators = creatorList.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'active') return !c.isSuspended;
    if (filter === 'suspended') return c.isSuspended;
    // Assuming we might have a featured flag in future
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Creators</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Manage platform talent and content engines</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lemon-muted transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-14 pr-6 text-white font-bold focus:outline-none focus:border-lemon-muted/50 transition-all"
          />
        </div>
        <div className="flex bg-ink-deep p-1.5 rounded-2xl border border-white/5 gap-1">
          {(['all', 'active', 'suspended', 'featured'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10" : "text-white/40 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:block bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Creator</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Category</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Followers</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Stories</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Dropsomething</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCreators.map((c) => (
              <tr key={c.username} className="hover:bg-white/[0.01] transition-all group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                     <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                     <div>
                        <div className="flex items-center gap-1">
                           <p className="font-bold text-white group-hover:text-lemon-muted transition-colors">{c.name}</p>
                           {c.isVerified && <ShieldCheck size={14} className="text-blue-400" />}
                        </div>
                        <p className="text-xs text-white/30 font-medium">@{c.username}</p>
                     </div>
                  </div>
                </td>
                <td className="p-6">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 py-1 bg-white/5 rounded border border-white/5">
                     {c.category}
                   </span>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2 text-white/60">
                      <Users size={14} />
                      <span className="text-sm font-bold">{(c.followers ?? 0).toLocaleString()}</span>
                   </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2 text-white/60">
                      <Box size={14} />
                      <span className="text-sm font-bold">12</span>
                   </div>
                </td>
                <td className="p-6">
                   {c.dropSomethingUrl ? (
                     <div className="inline-flex items-center gap-2 px-2 py-1 bg-lemon-muted/10 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-lemon-muted animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-lemon-muted">Connected</span>
                     </div>
                   ) : (
                     <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/10">Disabled</span>
                   )}
                </td>
                <td className="p-6">
                   <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/creators/${c.username}`)}
                        className="w-10 h-10 rounded-xl bg-lemon-muted/10 text-lemon-muted flex items-center justify-center hover:bg-lemon-muted hover:text-black transition-all"
                        title="View Admin Profile"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to suspend @${c.username}? (Mock)`)) {
                             // mock action
                          }
                        }}
                        className="w-10 h-10 rounded-xl bg-red-400/10 text-red-400 flex items-center justify-center hover:bg-red-400 hover:text-white transition-all shadow-lg shadow-red-400/10"
                        title="Suspend Creator"
                      >
                        <ShieldAlert size={18} />
                      </button>
                      <div className="relative group/menu">
                        <button className="w-10 h-10 rounded-xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                          <MoreVertical size={18} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-ink-deep border border-white/10 rounded-2xl shadow-2xl z-50 py-2 opacity-0 scale-95 pointer-events-none group-focus-within/menu:opacity-100 group-focus-within/menu:scale-100 group-focus-within/menu:pointer-events-auto transition-all origin-top-right">
                           <button 
                            onClick={() => navigate('/admin/featured/editor')}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3"
                           >
                              <Star size={16} className="text-lemon-muted" />
                              Feature Creator
                           </button>
                           <button 
                            onClick={() => alert(`Creator access removed for @${c.username} (Mock)`)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3 text-red-400"
                           >
                              <AlertTriangle size={16} />
                              Remove Access
                           </button>
                        </div>
                      </div>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view would follow same pattern as AdminUsers */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredCreators.map((c) => (
          <div key={c.username} className="bg-ink-deep border border-white/5 p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-2xl object-cover bg-black-core border border-white/10" />
                 <div>
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-white">{c.name}</p>
                      {c.isVerified && <ShieldCheck size={14} className="text-blue-400" />}
                    </div>
                    <p className="text-xs text-white/30 font-medium">@{c.username}</p>
                 </div>
              </div>
              <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-white/30">
                 {c.category}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
               <div className="p-3 bg-white/5 rounded-2xl flex flex-col items-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Followers</p>
                  <p className="text-xs font-black text-white">{c.followers > 1000 ? (c.followers / 1000).toFixed(1) + 'k' : c.followers}</p>
               </div>
               <div className="p-3 bg-white/5 rounded-2xl flex flex-col items-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Stories</p>
                  <p className="text-xs font-black text-white">12</p>
               </div>
               <div className="p-3 bg-white/5 rounded-2xl flex flex-col items-center overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1 whitespace-nowrap">Support</p>
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1",
                    c.dropSomethingUrl ? "bg-lemon-muted shadow-lg shadow-lemon-muted/50" : "bg-white/10"
                  )} />
               </div>
            </div>

            <div className="flex gap-2">
               <button 
                onClick={() => navigate(`/admin/creators/${c.username}`)}
                className="flex-1 h-12 bg-lemon-muted text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <Eye size={16} /> Manage
               </button>
               <button 
                onClick={() => navigate(`/creator/${c.username}/portfolio`)}
                className="flex-1 h-12 bg-white/5 border border-white/5 text-white/80 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <PenTool size={16} /> Portfolio
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
