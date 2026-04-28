import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Eye, UserPlus, DollarSign, BookOpen, MessageCircle, Coffee, ExternalLink, Settings as SettingsIcon, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MOCK_STORIES } from '../data/mock';
import { useCurrentUser, useStories } from '../hooks/useConvex';

export default function CreatorDashboard() {
  const { user, firebaseUid } = useCurrentUser();
  const creatorStories = useStories(user?._id);
  
  // Use real stories if available, fallback to mock
  const myStories = creatorStories && creatorStories.length > 0 
    ? creatorStories.slice(0, 6) 
    : MOCK_STORIES.slice(0, 3);
  
  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalReads = myStories.reduce((sum, story) => sum + (story.views || 0), 0);
    const followers = user?.followers?.length || 0;
    const activeStories = myStories.filter(s => s.status === 'published').length;
    
    return [
      { label: "Total Reads", value: totalReads.toLocaleString(), icon: Eye, color: "text-blue-400" },
      { label: "Followers", value: followers.toLocaleString(), icon: UserPlus, color: "text-green-400" },
      { label: "Earnings (30d)", value: "$4,250", icon: DollarSign, color: "text-lemon-muted" },
      { label: "Active Stories", value: activeStories.toString(), icon: BookOpen, color: "text-purple-400" },
    ];
  }, [myStories, user]);

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="font-display font-black text-4xl mb-1">Creator Studio</h1>
          <p className="text-white/50">Welcome back, {user?.name || 'Creator'}.</p>
        </div>
        <Link to="/studio/upload">
          <Button className="pl-4 pr-6">
            <Plus size={18} className="mr-2" /> Upload New Story
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-ink-deep border border-white/5 p-5 rounded-2xl flex flex-col items-start gap-4 h-full relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Icon size={64} className={stat.color} />
               </div>
               <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${stat.color}`}>
                 <Icon size={20} />
               </div>
               <div>
                 <p className="text-sm text-white/50 mb-1">{stat.label}</p>
                 <h3 className="font-display font-bold text-3xl">{stat.value}</h3>
               </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
           <div className="flex items-center justify-between mb-6">
             <h2 className="font-display font-bold text-2xl">My Stories</h2>
             <button className="text-sm text-lemon-muted font-medium hover:underline">View All</button>
           </div>
           
           {creatorStories === null ? (
             <div className="flex flex-col gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center gap-4 bg-ink-deep p-4 rounded-2xl border border-white/5 animate-pulse">
                   <div className="w-16 h-20 rounded-xl bg-white/10" />
                   <div className="flex-1 space-y-2">
                     <div className="h-4 bg-white/10 rounded w-3/4" />
                     <div className="h-3 bg-white/10 rounded w-1/2" />
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="flex flex-col gap-4">
               {myStories.length > 0 ? (
                 myStories.map(story => (
                   <Link key={story.id} to={`/story/${story.id}`} className="flex items-center gap-4 bg-ink-deep p-4 rounded-2xl border border-white/5 hover:border-lemon-muted/50 transition-colors group">
                     <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-black">
                       <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="font-display font-semibold text-lg truncate">{story.title}</h4>
                       <p className="text-sm text-white/50 mb-2">{story.chapters?.length || 1} Published Chapters</p>
                       <div className="flex gap-4 text-xs font-medium text-white/40">
                         <span className="flex items-center gap-1"><Eye size={12}/> {(story.views ?? 0).toLocaleString()}</span>
                         <span className="flex items-center gap-1"><DollarSign size={12}/> 1.2K</span>
                       </div>
                     </div>
                     <ChevronRight className="text-white/20 group-hover:text-lemon-muted" />
                   </Link>
                 ))
               ) : (
                 <div className="text-center py-8 text-white/50">
                   <p>No stories published yet. Start creating!</p>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
           {/* Recent Comments */}
           <div className="bg-ink-deep border border-white/5 rounded-3xl p-6">
             <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><MessageCircle size={18} className="text-lemon-muted" /> New Comments</h3>
             <div className="flex flex-col gap-5">
               {[1,2,3].map(i => (
                 <div key={i} className="flex gap-3 pb-5 border-b border-white/5 last:border-0 last:pb-0">
                    <img src={`https://picsum.photos/seed/user${i}/100`} className="w-8 h-8 rounded-full bg-white/10 shrink-0" referrerPolicy="no-referrer" />
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-xs">
                        <span className="font-bold">reader_{i}99</span>
                        <span className="text-white/40">on Lagos 2099 Ch.4</span>
                      </div>
                      <p className="text-sm text-white/80 line-clamp-2">This is the best chapter yet. I can't believe what happened at the end!</p>
                    </div>
                 </div>
               ))}
             </div>
             <Button variant="outline" size="sm" fullWidth className="mt-6 text-white/70">View All Comments</Button>
           </div>

           {/* DropSomething Support Section */}
           <div className="bg-gradient-to-br from-[#1A1A1A] to-black border border-lemon-muted/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Coffee size={120} />
             </div>
             
             <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-lemon-muted text-black rounded-2xl flex items-center justify-center shadow-lg shadow-lemon-muted/10">
                  <Coffee size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">Creator Support</h3>
                  <p className="text-white/50 text-sm">Powered by DropSomething</p>
                </div>
             </div>

             <div className="flex flex-col gap-6 relative z-10">
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">DropSomething Handle</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">dropsomething.sbs/</span>
                       <input 
                         type="text" 
                         defaultValue="ovo_studios" 
                         className="w-full bg-black border border-white/10 rounded-xl py-3 pl-[145px] pr-4 text-sm font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors" 
                       />
                    </div>
                    <Button variant="primary" className="bg-lemon-muted text-black">Save</Button>
                  </div>
               </div>

               <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-0.5">Status</p>
                      <p className="text-sm font-bold">Support Button Enabled</p>
                    </div>
                  </div>
                  <Link to="/creator/ovo_studios/portfolio">
                    <Button variant="outline" size="sm" className="bg-black/40 border-white/10">View Portfolio</Button>
                  </Link>
               </div>

               <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-ink-deep p-4 rounded-2xl">
                    <p className="text-xs text-white/40 mb-1">Support Clicks (30d)</p>
                    <p className="font-display font-bold text-2xl">1,245</p>
                  </div>
                  <div className="bg-ink-deep p-4 rounded-2xl">
                    <p className="text-xs text-white/40 mb-1">Est. Revenue</p>
                    <p className="font-display font-bold text-2xl text-lemon-muted">$840.00</p>
                  </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
