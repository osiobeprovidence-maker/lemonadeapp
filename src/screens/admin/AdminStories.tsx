import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Search, 
  Filter, 
  Eye, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
  Flag,
  Settings
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminStories() {
  const { stories } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'featured' | 'reported' | 'removed'>('all');

  const filteredStories = stories.filter(s => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'featured') return s.isFeatured;
    // Mock statuses for filtering
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Story Management</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Monitor trends and content quality</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lemon-muted transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search stories or creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-14 pr-6 text-white font-bold focus:outline-none focus:border-lemon-muted/50 transition-all"
          />
        </div>
        <div className="flex bg-ink-deep p-1.5 rounded-2xl border border-white/5 gap-1 overflow-x-auto scrollbar-hide">
          {(['all', 'published', 'featured', 'reported', 'removed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
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
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Story Content</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Creator</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Stats</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Featured</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStories.map((s) => (
              <tr key={s.id} className="hover:bg-white/[0.01] transition-all group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-16 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0">
                        <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <div className="cursor-pointer" onClick={() => navigate(`/admin/stories/${s.id}`)}>
                        <p className="font-bold text-white group-hover:text-lemon-muted transition-colors">{s.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/5 text-white/40 rounded border border-white/5">{s.format}</span>
                           <span className="text-[10px] text-white/20">•</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.genre}</span>
                        </div>
                     </div>
                  </div>
                </td>
                <td className="p-6">
                   <div 
                    className="flex items-center gap-2 cursor-pointer group/creator"
                    onClick={() => navigate(`/admin/creators/${s.creator.username}`)}
                   >
                       <img src={s.creator.avatar} alt={s.creator.name} className="w-8 h-8 rounded-full border border-white/10 group-hover/creator:border-lemon-muted transition-colors" />
                       <span className="text-sm font-bold text-white/60 group-hover/creator:text-white transition-colors">@{s.creator.username}</span>
                   </div>
                </td>
                <td className="p-6">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase">
                         <Eye size={12} className="text-white/20"/> {(s.reads ?? 0).toLocaleString()} Reads
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase">
                         <Clock size={12} className="text-white/20"/> {s.chapters} Chaps
                      </div>
                   </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Published</span>
                   </div>
                </td>
                <td className="p-6">
                   <button 
                    onClick={() => navigate('/admin/featured/editor')}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                      s.isFeatured ? "bg-lemon-muted/10 text-lemon-muted" : "text-white/10 hover:bg-white/5 hover:text-white"
                    )}
                   >
                      <Star size={16} fill={s.isFeatured ? "currentColor" : "none"} />
                   </button>
                </td>
                <td className="p-6">
                   <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/stories/${s.id}`)}
                        className="w-10 h-10 rounded-xl bg-lemon-muted/10 text-lemon-muted flex items-center justify-center hover:bg-lemon-muted hover:text-black transition-all"
                        title="Moderate Story"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Flag story "${s.title}" for review? (Mock)`)) {
                             // mock action
                          }
                        }}
                        className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-orange-500/5"
                        title="Flag Content"
                      >
                        <AlertTriangle size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Remove story "${s.title}" from platform? (Mock)`)) {
                             // mock action
                          }
                        }}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                        title="Delete Story"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredStories.map((s) => (
          <div key={s.id} className="bg-ink-deep border border-white/5 p-6 rounded-3xl space-y-6">
            <div className="flex items-start gap-4" onClick={() => navigate(`/admin/stories/${s.id}`)}>
              <div className="w-16 h-24 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0">
                 <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-white line-clamp-1 group-hover:text-lemon-muted">{s.title}</h4>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.format}</span>
                    <span className="text-[10px] text-white/10">•</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">{s.genre}</span>
                 </div>
                 <div className="mt-4 flex items-center gap-2">
                    <img src={s.creator.avatar} alt={s.creator.name} className="w-5 h-5 rounded-full" />
                    <span className="text-[10px] font-bold text-white/60">@{s.creator.username}</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-b border-white/5 py-4">
               <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Reads</p>
                  <p className="text-xs font-black text-white">{s.reads > 1000 ? (s.reads/1000).toFixed(1) + 'k' : s.reads}</p>
               </div>
               <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Chapters</p>
                  <p className="text-xs font-black text-white">{s.chapters}</p>
               </div>
               <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Status</p>
                  <p className="text-[9px] font-black uppercase text-green-500">Live</p>
               </div>
            </div>

            <div className="flex gap-2">
               <button 
                onClick={() => navigate(`/admin/stories/${s.id}`)}
                className="flex-1 h-12 bg-lemon-muted text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <Settings size={16} /> Moderate
               </button>
               <button 
                onClick={() => {
                   if(confirm('Flag story?')) alert('Flagged (Mock)');
                }}
                className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center border border-orange-500/20"
               >
                 <Flag size={20} />
               </button>
               <button 
                onClick={() => {
                   if(confirm('Remove story?')) alert('Removed (Mock)');
                }}
                className="w-12 h-12 bg-red-100/5 text-red-400 rounded-xl flex items-center justify-center border border-red-400/20"
               >
                 <Trash2 size={20} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
