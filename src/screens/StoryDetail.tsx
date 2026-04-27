import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, Share, Play, Eye, MoreHorizontal, Coffee, Lock, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FormatBadge, GenreBadge, LockedContentCTA, SupportStatusBadge } from '../components/ui/Cards';
import { FollowButton, SupportButton } from '../components/InteractionButtons';
import { SensitiveActionWrapper } from '../components/SensitiveActionWrapper';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';

export default function StoryDetail() {
  const { id } = useParams();
  const { stories, user, creators, unlockChapter, saveStory, unsaveStory } = useApp();
  const story = stories.find(s => s.id === id) || stories[0];
  const [activeTab, setActiveTab] = useState<'chapters' | 'about' | 'comments'>('chapters');

  const isSaved = user?.savedStories.includes(story.id);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      unsaveStory(story.id);
    } else {
      saveStory(story.id);
    }
  };

  const handleUnlock = (e: React.MouseEvent, chapterId: string, price: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (user && user.walletBalance >= price) {
      unlockChapter(story.id, chapterId, price);
    } else {
      // Navigate to wallet or show modal
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black-core">
      {/* Cinematic Banner */}
      <div className="relative w-full h-[50vh] min-h-[400px]">
         <div className="absolute inset-0 image-mask z-10">
           <img src={story.bannerImage} alt={story.title} className="w-full h-full object-cover blur-sm opacity-50" referrerPolicy="no-referrer" />
           <div className="absolute inset-0 bg-black/40" />
         </div>

         {/* Content overlay */}
         <div className="absolute inset-0 z-20 p-6 md:p-12 flex flex-col md:flex-row gap-6 md:gap-10 mt-16 md:mt-24">
            <div className="w-32 md:w-56 shrink-0 aspect-[3/4] rounded-xl overflow-hidden self-center md:self-start shadow-2xl ring-1 ring-white/10">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left mt-4 md:mt-0 max-w-2xl">
              <div className="flex gap-2 mb-3">
                <FormatBadge format={story.format} />
                <GenreBadge genre={story.genre} />
              </div>

              <h1 className="font-display font-black text-4xl md:text-5xl leading-tight mb-2">
                {story.title}
              </h1>
              
              <Link to={`/creator/${story.creator.username}`} className="flex items-center gap-2 mb-6 hover:text-lemon-muted transition-colors">
                <img src={story.creator.avatar} alt={story.creator.name} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                <span className="font-medium text-white/80">{story.creator.name}</span>
              </Link>

              <div className="flex items-center gap-6 text-sm font-medium text-white/70 mb-8 w-full justify-center md:justify-start">
                 <div className="flex items-center gap-1.5"><Star size={16} className="text-lemon-muted fill-lemon-muted" /> {story.rating}</div>
                 <div className="flex items-center gap-1.5"><Eye size={16} /> {(story.views/1000).toFixed(0)}k</div>
                 <div className="flex items-center gap-1.5"><Heart size={16} /> {(story.saves/1000).toFixed(0)}k</div>
                 <div className="flex items-center gap-1.5">{story.episodes} Chapters</div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
                 <Link to={`/read/${story.id}/1`}>
                   <Button size="lg" className="pl-6 pr-8"><Play size={18} className="mr-2" /> Read Chapter 1</Button>
                 </Link>
                 <SensitiveActionWrapper intent="save story" payload={{ storyId: story.id }} onClick={toggleSave}>
                   <Button size="icon" variant={isSaved ? "primary" : "glass"}>
                     {isSaved ? <Check size={20} /> : <Heart size={20} className={isSaved ? 'fill-black' : ''} />}
                   </Button>
                 </SensitiveActionWrapper>
                 <Button size="icon" variant="glass"><Share size={20} /></Button>
                 <Button size="icon" variant="glass"><MoreHorizontal size={20} /></Button>
              </div>
            </div>
         </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-black-core/90 backdrop-blur-2xl border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] animate-slide-up">
        <div className="flex items-center gap-3">
          <Link to={`/read/${story.id}/1`} className="flex-1">
            <Button fullWidth size="lg" className="shadow-lg shadow-lemon-muted/10">
              <Play size={18} className="mr-2" /> Start Reading
            </Button>
          </Link>
          <SensitiveActionWrapper intent="save story" payload={{ storyId: story.id }} onClick={toggleSave}>
            <Button size="icon" variant={isSaved ? "primary" : "glass"} className="w-14 h-14 shrink-0 bg-white/5 border-white/10">
              {isSaved ? <Check size={22} /> : <Heart size={22} />}
            </Button>
          </SensitiveActionWrapper>
          <SupportButton creator={story.creator} size="lg" className="w-14 h-14 shrink-0" showLabel={false} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 mt-32 md:mt-12 pb-24">
        {/* Creator Section */}
        <div className="bg-gradient-to-br from-ink-deep to-black border border-white/10 rounded-3xl p-6 md:p-8 mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lemon-muted/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
            <div className="shrink-0">
               <div className="relative">
                <img src={story.creator.avatar} alt={story.creator.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-black group-hover:border-lemon-muted transition-colors duration-500" referrerPolicy="no-referrer" />
                {story.creator.supportEnabled && (
                  <div className="absolute -bottom-1 -right-1 bg-lemon-muted rounded-full p-2 text-black shadow-xl">
                    <Coffee size={16} />
                  </div>
                )}
               </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                <h3 className="font-display font-black text-2xl md:text-3xl">{story.creator.name}</h3>
                {user?.supportHistory.some(s => s.creatorId === story.creator.username) && <SupportStatusBadge status="supported" />}
              </div>
              <p className="text-white/60 mb-4 max-w-lg">{story.creator.bio}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
                <FollowButton creator={story.creator} />
                <SupportButton creator={story.creator} />
                <Link to={`/creator/${story.creator.username}/portfolio`}>
                  <Button variant="glass" size="md">View Portfolio <ArrowRight size={16} className="ml-2" /></Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-3 justify-center text-right">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Followers</p>
                <p className="font-display font-black text-2xl">{(creators[story.creator.username]?.followers ?? 0).toLocaleString() || (story.creator.followers ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Total Reads</p>
                <p className="font-display font-black text-2xl">{(story.creator.totalReads/1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Alert */}
        {!story.creator.supportEnabled && (
          <div className="flex items-center justify-between bg-ink-deep border border-warning/20 rounded-2xl p-4 mb-10 w-full opacity-60 grayscale scale-95 origin-center">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/5 text-white/30 rounded-full flex items-center justify-center">
                 <Coffee size={18} />
               </div>
               <div>
                 <p className="font-semibold text-sm text-white/40">Support not connected</p>
                 <p className="text-white/20 text-xs">Tell the creator to join DropSomething!</p>
               </div>
             </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/10 mb-8">
          {(['chapters', 'about', 'comments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-sm font-bold uppercase tracking-wider relative transition-colors",
                activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lemon-muted" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'chapters' && (
            <div className="flex flex-col gap-3">
              
              <div className="mb-4">
                 <LockedContentCTA price={10} />
              </div>

              {[...Array(5)].map((_, i) => {
                const chapterId = `c${i+1}`;
                const isPaid = i > 2; // Mock logic: first 3 free, rest paid
                const isEarlyAccess = i === 4;
                const isUnlocked = !isPaid || user?.unlockedChapters.includes(`${story.id}-${chapterId}`) || user?.isPremium;
                const price = isEarlyAccess ? 15 : 5;

                return (
                  <Link 
                    key={i} 
                    to={isUnlocked ? `/read/${story.id}/${i+1}` : '#'} 
                    className={cn(
                      "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-ink-deep hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10 group gap-4 relative overflow-hidden",
                      !isUnlocked && "cursor-default"
                    )}
                  >
                    {!isUnlocked && <div className="absolute inset-0 bg-gradient-to-r from-lemon-muted/5 to-transparent pointer-events-none" />}
                    
                    <div className="flex items-center gap-4 relative z-10 w-full">
                       <div className="w-12 h-12 bg-black rounded-lg overflow-hidden shrink-0 relative">
                          <img src={story.coverImage} className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                            {isUnlocked ? <Play size={16} className="text-white fill-white" /> : <Lock size={16} className="text-white" />}
                          </div>
                          {!isUnlocked && (
                            <div className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                              <Lock size={10} className="text-lemon-muted" />
                            </div>
                          )}
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-0.5">
                           <h4 className={cn("font-semibold text-base", !isUnlocked ? 'text-white/80' : 'text-white')}>Chapter {i + 1}</h4>
                           {!isUnlocked && <span className="px-1.5 py-0.5 rounded-sm bg-lemon-muted/10 text-lemon-muted text-[8px] font-black uppercase tracking-wider">Locked</span>}
                           {isEarlyAccess && <span className="px-1.5 py-0.5 rounded-sm bg-orange-600/20 text-orange-400 text-[8px] font-black uppercase tracking-wider">Early Access</span>}
                           {isUnlocked && isPaid && <span className="px-1.5 py-0.5 rounded-sm bg-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-wider">Unlocked</span>}
                         </div>
                         <p className="text-xs text-white/50">{5 - i} days ago • {story.format === 'Novel' ? '15 min read' : '50 panels'}</p>
                       </div>

                       <div className="shrink-0 mt-2 sm:mt-0 ml-auto">
                          {!isUnlocked ? (
                            <SensitiveActionWrapper intent="unlock chapter">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-lemon-muted/30 text-lemon-muted hover:bg-lemon-muted hover:text-black"
                                onClick={(e) => handleUnlock(e, chapterId, price)}
                              >
                                Unlock ({price}C)
                              </Button>
                            </SensitiveActionWrapper>
                          ) : (
                            <Button size="sm" variant={i === 0 ? "primary" : "secondary"}>Read</Button>
                          )}
                       </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="flex flex-col gap-6 text-white/80 leading-relaxed font-medium">
              <p>{story.synopsis}</p>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {story.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-ink-deep rounded-full text-xs font-semibold">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
             <div className="flex flex-col gap-6">
                <SensitiveActionWrapper intent="comment">
                  <div className="flex gap-3">
                    <img src="https://picsum.photos/seed/user1/100" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <input type="text" placeholder="Add a comment..." className="w-full bg-ink-deep border border-white/10 border-b-2 border-b-lemon-muted rounded-tl-xl rounded-tr-xl px-4 py-3 text-sm focus:outline-none" />
                    </div>
                  </div>
                </SensitiveActionWrapper>
                
                <div className="flex gap-4">
                  <img src="https://picsum.photos/seed/user2/100" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                  <div className="flex-1 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">chidi_99</span>
                      <span className="text-xs text-white/40">2 hours ago</span>
                    </div>
                    <p className="text-white/80 text-sm mb-3">Wow this series is amazing, really captured the lagos vibe!</p>
                    <div className="flex items-center gap-4 text-white/40 text-xs font-medium">
                      <button className="flex items-center gap-1 hover:text-white"><Heart size={14} /> 45</button>
                      <button className="hover:text-white">Reply</button>
                    </div>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
