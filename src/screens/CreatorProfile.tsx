import React from 'react';
import { MOCK_STORIES, MOCK_CREATORS } from '../data/mock';
import { CreatorStatsCard, StoryCard } from '../components/ui/Cards';
import { Button } from '../components/ui/Button';
import { FollowButton, SupportButton } from '../components/InteractionButtons';
import { MapPin, Link as LinkIcon, Calendar, Share2, MoreHorizontal, LayoutGrid, Info, Star, Heart } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function CreatorProfile() {
  const { username } = useParams();
  // Use first creator if username not found for mock purposes
  const creator = Object.values(MOCK_CREATORS).find(c => c.username === username || c.id === username) || MOCK_CREATORS.ovo;
  const creatorStories = MOCK_STORIES.filter(s => s.creator.id === creator.id);
  const featuredStory = creatorStories[0]; // Simple logic for featured
  const [activeTab, setActiveTab] = React.useState<'works' | 'about'>('works');

  return (
    <div className="flex flex-col w-full min-h-screen pb-24">
      {/* Banner */}
      <div className="h-64 md:h-80 bg-ink-deep relative overflow-hidden">
        <img src={`https://picsum.photos/seed/${creator.id}banner/1200/400`} alt="Banner" className="w-full h-full object-cover opacity-30 blur-sm scale-110" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black-core via-black-core/40 to-transparent" />
      </div>

      <div className="px-6 md:px-12 max-w-6xl mx-auto w-full -mt-32 relative z-10 flex flex-col md:flex-row gap-8 lg:gap-16">
        
        {/* Sidebar Info */}
        <div className="flex flex-col items-center md:items-start w-full md:w-80 shrink-0">
          <div className="relative mb-6">
            <img src={creator.avatar} alt={creator.name} className="w-40 h-40 rounded-full border-4 border-black-core bg-ink-deep object-cover shadow-2xl relative z-10" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 rounded-full bg-lemon-muted/10 blur-xl scale-110 -z-0" />
          </div>
          
          <div className="text-center md:text-left w-full mb-8">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="font-display font-black text-3xl md:text-4xl text-glow">{creator.name}</h1>
            </div>
            <p className="text-white/40 font-medium mb-3">@{creator.username}</p>
            <div className="inline-flex px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/5 mb-6">
              {creator.category}
            </div>
            
            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs mx-auto md:mx-0">
              {creator.bio}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <FollowButton creator={creator} size="lg" className="flex-1" />
                <SupportButton creator={creator} size="lg" className="flex-1" />
              </div>
              <Link to={`/creator/${creator.username}/portfolio`} className="w-full">
                <Button fullWidth variant="outline" className="border-white/10">
                  <LayoutGrid size={18} className="mr-2" /> View Portfolio
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full h-px bg-white/10 mb-8" />

          <div className="flex flex-col gap-4 text-sm text-white/50 w-full mb-10">
            {creator.location && <div className="flex items-center gap-3"><MapPin size={18} className="text-lemon-muted" /> {creator.location}</div>}
            <div className="flex items-center gap-3"><LinkIcon size={18} /> <a href={`https://${creator.username}.art`} className="underline underline-offset-4 hover:text-white transition-colors">{creator.username}.art</a></div>
            <div className="flex items-center gap-3"><Calendar size={18} /> Joined October 2024</div>
          </div>

          <div className="flex gap-2 w-full">
            <Button variant="glass" size="icon" className="flex-1"><Share2 size={18} /></Button>
            <Button variant="glass" size="icon" className="flex-1"><MoreHorizontal size={18} /></Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 md:mt-24">
          
          <CreatorStatsCard creator={creator} />

          {/* Tabs */}
          <div className="flex gap-8 border-b border-white/10 mt-12 mb-8 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('works')}
              className={cn(
                "pb-4 text-sm font-bold uppercase tracking-wider relative transition-colors flex items-center gap-2",
                activeTab === 'works' ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              <LayoutGrid size={16} /> Works
              {activeTab === 'works' && (
                <motion.div layoutId="creator-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lemon-muted" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={cn(
                "pb-4 text-sm font-bold uppercase tracking-wider relative transition-colors flex items-center gap-2",
                activeTab === 'about' ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              <Info size={16} /> About
              {activeTab === 'about' && (
                <motion.div layoutId="creator-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lemon-muted" />
              )}
            </button>
          </div>

          <div className="animate-fade-in">
             {activeTab === 'works' && (
                <div className="flex flex-col gap-12">
                   {/* Featured Section */}
                   {featuredStory && (
                     <div className="relative group cursor-pointer">
                        <div className="absolute -inset-1 bg-gradient-to-r from-lemon-muted to-transparent rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <Link to={`/story/${featuredStory.id}`} className="relative flex flex-col md:flex-row gap-6 bg-ink-deep/50 border border-white/5 rounded-3xl p-6 overflow-hidden">
                           <div className="w-full md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shrink-0">
                             <img src={featuredStory.coverImage} alt={featuredStory.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                           </div>
                           <div className="flex-1 flex flex-col justify-center">
                             <div className="flex items-center gap-2 mb-3">
                               <div className="px-2 py-0.5 rounded bg-lemon-muted/10 text-lemon-muted text-[10px] font-black uppercase tracking-widest border border-lemon-muted/20">Featured Work</div>
                             </div>
                             <h3 className="font-display font-black text-3xl mb-3 group-hover:text-lemon-muted transition-colors">{featuredStory.title}</h3>
                             <p className="text-white/60 text-sm line-clamp-3 mb-6 max-w-lg">{featuredStory.synopsis}</p>
                             <div className="flex items-center gap-4 text-sm font-bold text-white/40">
                               <span className="flex items-center gap-1.5"><Star size={16} className="text-lemon-muted fill-lemon-muted" /> {featuredStory.rating}</span>
                               <span className="flex items-center gap-1.5"><Heart size={16} /> {(featuredStory.saves/1000).toFixed(0)}k</span>
                             </div>
                           </div>
                        </Link>
                     </div>
                   )}

                   <div>
                     <h4 className="font-display font-bold text-xl mb-6">Published Series</h4>
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {creatorStories.map(story => (
                          <StoryCard key={story.id} story={story} />
                        ))}
                     </div>
                   </div>
                </div>
             )}

             {activeTab === 'about' && (
               <div className="max-w-2xl text-white/70 leading-relaxed text-lg">
                 <p className="mb-6">{creator.bio}</p>
                 <p>Building neo-African worlds where tradition meets cyberpunk. Every story is a love letter to the grit and magic of our continent.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
