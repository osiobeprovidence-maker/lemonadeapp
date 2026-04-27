import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  BadgeCheck, 
  GripVertical, 
  Plus, 
  Trash2, 
  Star, 
  TrendingUp, 
  Box, 
  PenTool,
  ArrowUp,
  ArrowDown,
  Layout
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminFeatured() {
  const { stories } = useApp();
  const [featuredStories, setFeaturedStories] = useState(stories.filter(s => s.isFeatured));
  
  // Just mock reordering since we are in dev preview and stories come from context
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...featuredStories];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setFeaturedStories(newItems);
  };

  const moveDown = (index: number) => {
    if (index === featuredStories.length - 1) return;
    const newItems = [...featuredStories];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setFeaturedStories(newItems);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Featured Content</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Curate the platform homepage experience</p>
        </div>
        <button className="h-12 px-6 bg-lemon-muted text-black rounded-xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
           <Plus size={18} />
           Feature More
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Active Featured stories</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{featuredStories.length} Curated Items</span>
           </div>

           <div className="space-y-3">
              {featuredStories.map((story, index) => (
                <motion.div 
                  layout
                  key={story.id} 
                  className="p-6 bg-ink-deep border border-white/5 rounded-3xl flex items-center gap-6 group hover:border-lemon-muted/20 transition-all"
                >
                   <div className="flex flex-col gap-1 text-white/20">
                      <button onClick={() => moveUp(index)} className="hover:text-lemon-muted transition-colors"><ArrowUp size={16}/></button>
                      <button onClick={() => moveDown(index)} className="hover:text-lemon-muted transition-colors"><ArrowDown size={16}/></button>
                   </div>
                   
                   <div className="w-16 h-20 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0">
                      <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                   </div>

                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-lg leading-tight">{story.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <PenTool size={12} className="text-white/20" />
                        <span className="text-xs font-bold text-white/40">@{story.creator.username}</span>
                      </div>
                   </div>

                   <div className="hidden md:flex flex-col items-end gap-2 px-6">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 text-white/40 rounded border border-white/5">{story.genre}</span>
                      <div className="flex items-center gap-1.5 text-lemon-muted">
                         <Star size={12} fill="currentColor" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Featured</span>
                      </div>
                   </div>

                   <button className="w-11 h-11 rounded-xl bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center">
                      <Trash2 size={18} />
                   </button>
                </motion.div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Homepage Modules</h3>
           <div className="space-y-4">
              {[
                { label: 'Hero Section', active: 'Featured stories', icon: Star },
                { label: 'Trending', active: 'Most clicked', icon: TrendingUp },
                { label: 'Originals', active: 'Studio curated', icon: BadgeCheck },
                { label: 'New Drops', active: 'Recent published', icon: Box },
                { label: 'Featured Creators', active: 'Manual choice', icon: Layout },
              ].map((module, i) => (
                <div key={i} className="p-6 bg-ink-deep border border-white/5 rounded-[2rem] hover:border-white/20 transition-all group">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-lemon-muted transition-colors">
                            <module.icon size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-sm">{module.label}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{module.active}</p>
                         </div>
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-lemon-muted hover:underline">Edit</button>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[3rem] text-center">
              <p className="text-xs font-bold text-white/30 italic">Changes to featured content reflect instantly on the user marketplace homepage.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
