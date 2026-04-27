import React, { useState } from 'react';
import { MOCK_READERS, MOCK_BADGES, MOCK_STORIES, MOCK_CREATORS } from '../data/mock';
import { Button } from '../components/ui/Button';
import { MapPin, Calendar, Edit3, Settings, Crown, Flame, Share2, Award, Lock, Trophy, Heart, Coffee, Wallet, ChevronRight, LogIn, UserPlus } from 'lucide-react';
import { AchievementBadge, PremiumBadge, StoryCard } from '../components/ui/Cards';
import { FollowButton } from '../components/InteractionButtons';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AppContext';
import { SensitiveActionWrapper } from '../components/SensitiveActionWrapper';

export default function ReaderProfile() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const reader = MOCK_READERS.current;
  const isPremium = user?.isPremium || false;
  const savedStories = MOCK_STORIES.slice(0, 3);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'following' | 'badges' | 'premium' | 'activity'>('overview');
  const tabs = ['overview', 'library', 'following', 'badges', 'premium', 'activity'] as const;

  if (isGuest) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/20">
          <Settings size={48} />
        </div>
        <h1 className="font-display font-black text-3xl mb-2">My Profile</h1>
        <p className="text-white/50 mb-10 max-w-sm">Sign in to track your reading progress, follow your favorite creators, and manage your library.</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button onClick={() => navigate('/auth?mode=signin')} className="w-full" size="lg">
            <LogIn size={18} className="mr-2" /> Sign In
          </Button>
          <Button onClick={() => navigate('/auth?mode=signup')} variant="secondary" className="w-full" size="lg">
            <UserPlus size={18} className="mr-2" /> Create Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen pb-32 md:pb-24">
      {/* Banner */}
      <div className="h-48 md:h-64 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-black to-emerald-900/40 opacity-80" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="glass" className="bg-white/5 border-white/10"><Edit3 size={14} className="mr-2" /> Change Banner</Button>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-6xl mx-auto w-full -mt-20 relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* Sidebar Info */}
        <div className="flex flex-col items-center md:items-start w-full md:w-80 shrink-0">
          <div className="relative mb-6 group">
            <img 
              src={user?.avatar || reader.avatar} 
              alt={user?.name || reader.username} 
              className={cn(
                "w-36 h-36 md:w-44 md:h-44 rounded-full border-4 bg-ink-deep object-cover shadow-2xl relative z-10",
                isPremium ? "border-lemon-muted" : "border-black-core"
              )} 
              referrerPolicy="no-referrer" 
            />
            {isPremium && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
                <PremiumBadge className="px-3 py-1 shadow-xl shadow-lemon-muted/20" />
              </div>
            )}
            <SensitiveActionWrapper intent="edit profile">
              <button className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Edit3 className="text-white mb-1" size={24} />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Update</span>
              </button>
            </SensitiveActionWrapper>
          </div>
          
          <div className="text-center md:text-left w-full">
            <h1 className="font-display font-black text-3xl mb-1 flex items-center justify-center md:justify-start gap-2">
              {user?.name || reader.displayName}
            </h1>
            <p className="text-white/40 font-medium mb-6">@{user?.username || reader.username}</p>

            <p className="text-white/80 text-sm mb-8 leading-relaxed max-w-xs mx-auto md:mx-0 font-medium">
              {reader.bio}
            </p>

            <div className="flex flex-col gap-3 w-full mb-10">
              <SensitiveActionWrapper intent="edit profile">
                <Button fullWidth variant="outline" className="border-white/10 font-bold">Edit Profile</Button>
              </SensitiveActionWrapper>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/wallet" className="block">
                  <Button variant="glass" className="w-full bg-white/5 font-bold"><Wallet size={18} className="mr-2 shrink-0" /> Wallet </Button>
                </Link>
                <Link to="/settings" className="block">
                  <Button variant="glass" className="w-full bg-white/5 font-bold"><Settings size={18} className="mr-2 shrink-0" /> Settings</Button>
                </Link>
              </div>
            </div>

            <div className="w-full bg-ink-deep/50 rounded-3xl p-5 border border-white/5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Lemonade Stats</span>
                <Trophy size={16} className="text-lemon-muted" />
              </div>
              <div className="flex flex-col gap-4">
                 <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Chapters Read</span>
                      <span className="font-display font-black text-white text-lg">{reader.totalChaptersRead}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-lemon-muted w-[75%] shadow-[0_0_8px_#E8C547]" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2">
                     <Flame size={18} className="text-orange-500" />
                     <span className="text-xs font-bold uppercase tracking-widest">Daily Streak</span>
                   </div>
                   <span className="font-display font-black text-orange-500">{reader.readingStreak} Days</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 mt-6 md:mt-24 min-w-0">
          
          {/* Custom Tabs */}
          <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors whitespace-nowrap",
                  activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="profile-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lemon-muted shadow-[0_0_10px_#E8C547]" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[500px]">
             {activeTab === 'overview' && (
                <div className="flex flex-col gap-12 animate-fade-in">
                  
                  {/* Premium Status Card */}
                  {!isPremium ? (
                    <div className="bg-gradient-to-br from-ink-deep to-black-core border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-2xl">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-lemon-muted/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                       <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                          <div className="w-16 h-16 rounded-2xl bg-lemon-muted text-black flex items-center justify-center shrink-0 shadow-xl shadow-lemon-muted/10 transform -rotate-3 group-hover:rotate-0 transition-transform">
                            <Crown size={32} />
                          </div>
                          <div>
                            <h3 className="font-display font-black text-2xl md:text-3xl mb-1">Go Premium</h3>
                            <p className="text-white/50 text-sm md:text-base font-medium">Support the creative ecosystem and get early access.</p>
                          </div>
                       </div>
                       <Link to="/wallet" className="w-full md:w-auto">
                         <Button size="lg" className="w-full bg-white text-black hover:bg-lemon-muted transition-colors font-black uppercase tracking-wider">Upgrade</Button>
                       </Link>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-lemon-muted/10 to-black-core border border-lemon-muted/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(232,197,71,0.08),transparent_70%)]" />
                       <div className="flex items-center gap-6 relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-lemon-muted/10 text-lemon-muted flex items-center justify-center shrink-0 border border-lemon-muted/20 shadow-inner">
                            <Crown size={32} />
                          </div>
                          <div>
                            <h3 className="font-display font-black text-2xl">Premium Status: Active</h3>
                            <p className="text-white/50 font-medium tracking-tight">You have unrestricted access to all creative drops.</p>
                          </div>
                       </div>
                       <Link to="/wallet">
                         <Button variant="glass" size="md" className="font-bold border-white/10 hover:border-lemon-muted text-white">Manage Billing</Button>
                       </Link>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-display font-bold text-xl mb-6">Favorite Genres</h3>
                      <div className="flex flex-wrap gap-2">
                         {reader.favoriteGenres.map(genre => (
                           <div key={genre} className="px-4 py-2 rounded-xl bg-ink-deep border border-white/5 text-sm font-semibold hover:border-lemon-muted/30 transition-colors">
                             {genre}
                           </div>
                         ))}
                      </div>
                    </div>
                    <div>
                       <div className="flex items-center justify-between mb-6">
                         <h3 className="font-display font-bold text-xl">Top Badges</h3>
                         <button onClick={() => setActiveTab('badges')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">View All &rarr;</button>
                       </div>
                       <div className="flex gap-4">
                          {reader.badges.slice(0, 3).map(id => {
                            const badge = MOCK_BADGES[id];
                            return badge ? (
                              <div key={id} className="w-16 h-16 rounded-2xl bg-ink-deep border border-white/5 flex items-center justify-center text-3xl group cursor-help transition-all hover:bg-lemon-muted/10 hover:border-lemon-muted/30 shadow-lg" title={badge.name}>
                                {badge.icon}
                              </div>
                            ) : null;
                          })}
                          <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 border-dashed flex items-center justify-center text-white/10">
                            <Lock size={16} />
                          </div>
                       </div>
                    </div>
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-6">
                       <h3 className="font-display font-bold text-xl">Reading Library</h3>
                       <button onClick={() => setActiveTab('library')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Full Library &rarr;</button>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                       {savedStories.map(story => (
                         <StoryCard key={story.id} story={story} />
                       ))}
                     </div>
                  </div>

                </div>
             )}

             {activeTab === 'following' && (
               <div className="flex flex-col gap-4 animate-fade-in">
                  <h3 className="font-display font-bold text-2xl mb-4">Followed Creators</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                     {reader.followedCreators.map(id => {
                        const creator = Object.values(MOCK_CREATORS).find(c => c.id === id);
                        if (!creator) return null;
                        return (
                          <div key={id} className="flex items-center justify-between p-4 bg-ink-deep/50 border border-white/5 rounded-3xl hover:border-white/20 transition-all group">
                             <Link to={`/creator/${creator.username}`} className="flex items-center gap-4 flex-1">
                                <img src={creator.avatar} alt={creator.name} className="w-14 h-14 rounded-full object-cover group-hover:ring-4 ring-lemon-muted/20 transition-all duration-300" referrerPolicy="no-referrer" />
                                <div>
                                  <h4 className="font-display font-bold text-lg tracking-tight group-hover:text-lemon-muted transition-colors">{creator.name}</h4>
                                  <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black">{creator.category} • {(creator.followers/1000).toFixed(1)}k</p>
                                </div>
                             </Link>
                             <FollowButton creator={creator} size="sm" />
                          </div>
                        )
                     })}
                  </div>
               </div>
             )}

             {activeTab === 'library' && (
               <div className="animate-fade-in">
                  <h3 className="font-display font-bold text-2xl mb-8">Full Library</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {MOCK_STORIES.map(story => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
               </div>
             )}

             {activeTab === 'badges' && (
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                 {Object.values(MOCK_BADGES).map(badge => {
                   const isUnlocked = reader.badges.includes(badge.id);
                   return (
                     <div key={badge.id} className={cn(
                       "flex flex-col items-center text-center p-8 rounded-3xl border transition-all duration-500",
                       isUnlocked ? "bg-ink-deep border-white/10 hover:border-lemon-muted group shadow-xl" : "bg-black-core border-white/5 opacity-50 grayscale"
                     )}>
                        <div className={cn("text-5xl mb-4 transition-transform duration-500", isUnlocked && "group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_rgba(232,197,71,0.3)]")}>{badge.icon}</div>
                        <h4 className="font-display font-bold text-base mb-1">{badge.name}</h4>
                        <p className="text-[10px] text-white/40 leading-relaxed font-medium min-h-[30px]">{badge.description}</p>
                        {!isUnlocked && (
                          <div className="mt-4 px-3 py-1 bg-white/5 rounded-full flex items-center gap-2">
                             <Lock size={10} className="text-white/30" />
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Locked</span>
                          </div>
                        )}
                     </div>
                   );
                 })}
               </div>
             )}

             {activeTab === 'premium' && (
               <div className="animate-fade-in flex flex-col gap-10">
                  <div className="max-w-xl">
                    <h3 className="font-display font-bold text-3xl mb-4">Subscription</h3>
                    <p className="text-white/60 mb-8 font-medium">Manage your membership, billing cycles, and premium features.</p>
                    
                    <div className="bg-ink-deep border border-lemon-muted/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 p-6 opacity-10">
                         <Crown size={120} />
                       </div>
                       
                       <div className="flex items-center gap-4 mb-8">
                         <div className="w-12 h-12 bg-lemon-muted rounded-2xl flex items-center justify-center text-black shadow-xl shadow-lemon-muted/20">
                           <Crown size={24} />
                         </div>
                         <div>
                           <h4 className="font-display font-bold text-xl">Lemonade Premium</h4>
                           <p className="text-lemon-muted text-sm font-black uppercase tracking-widest">{isPremium ? 'Yearly' : 'Monthly'} Plan • $6.99/mo</p>
                         </div>
                       </div>

                       <div className="flex flex-col gap-4 mb-8">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/50 font-medium">Next Billing Date</span>
                            <span className="font-bold text-white">November 26, 2024</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/50 font-medium">Payment Method</span>
                            <span className="font-bold text-white flex items-center gap-2 underline decoration-white/20 underline-offset-4">Visa ending in 4421 <ChevronRight size={14} /></span>
                          </div>
                       </div>

                       <div className="flex flex-col sm:flex-row gap-4">
                          <Button fullWidth className="bg-white text-black hover:bg-lemon-muted font-black uppercase tracking-wider">Update Details</Button>
                          <Button fullWidth variant="outline" className="border-white/10 hover:border-red-500/50 hover:text-red-500 font-bold">Cancel Subscription</Button>
                       </div>
                    </div>
                  </div>
               </div>
             )}

             {activeTab === 'activity' && (
                <div className="flex flex-col gap-4 animate-fade-in max-w-2xl">
                  <h3 className="font-display font-bold text-2xl mb-4">Activity Timeline</h3>
                  {[1,2,3,4,5].map(i => (
                     <div key={i} className="flex gap-5 p-5 rounded-3xl bg-ink-deep/30 border border-white/5 items-center hover:bg-ink-deep/60 transition-all cursor-default">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex flex-col items-center justify-center shrink-0 border border-white/5">
                          {i % 3 === 0 ? <Heart size={20} className="text-lemon-muted" /> : i % 3 === 1 ? <Coffee size={20} className="text-orange-400" /> : <Flame size={20} className="text-orange-500" />}
                       </div>
                       <div className="flex-1">
                         <p className="text-sm text-white/90 font-bold leading-tight mb-1">
                           {i % 3 === 0 ? "Saved 'Lagos 2099' to your library." : 
                            i % 3 === 1 ? "Supported 'AdaVerse' with a coffee!" : 
                            "Reached a 12-day reading streak! Keep going!"}
                         </p>
                         <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{i} {i === 1 ? 'hour' : 'days'} ago</p>
                       </div>
                     </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
