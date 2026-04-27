import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  ExternalLink, 
  Coffee, 
  Heart, 
  Award, 
  Trophy, 
  Star, 
  BookOpen, 
  Users, 
  LayoutGrid, 
  Image as ImageIcon, 
  Send, 
  MessageSquare, 
  Briefcase, 
  Globe, 
  PenTool, 
  X,
  Plus,
  Check,
  ChevronRight,
  ArrowRight,
  Share2,
  Eye,
  Lock
} from 'lucide-react';
import { MOCK_CREATORS, MOCK_STORIES, Creator, Story, GalleryItem, CreatorActivity, PortfolioAchievement } from '../data/mock';
import { Button } from '../components/ui/Button';
import { FollowButton, SupportButton } from '../components/InteractionButtons';
import { cn } from '../lib/utils';
import { FormatBadge, GenreBadge } from '../components/ui/Cards';

// --- Sub-Components ---

const PortfolioHero = ({ creator }: { creator: Creator }) => {
  return (
    <div className="relative w-full min-h-[400px] md:min-h-[500px] flex items-end pb-12 overflow-hidden">
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        <img 
          src={creator.banner || `https://picsum.photos/seed/${creator.id}/1500/600`} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-40 brightness-75 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black-core via-black-core/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-lemon-muted rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <img 
              src={creator.avatar} 
              alt={creator.name} 
              className="w-28 h-28 md:w-48 md:h-48 rounded-full border-4 border-black-core bg-ink-deep object-cover shadow-2xl relative z-10" 
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 text-center md:text-left pb-2">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
              <h1 className="font-display font-black text-3xl md:text-6xl text-glow bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                {creator.name}
              </h1>
              <span className="px-3 py-1 bg-lemon-muted/10 border border-lemon-muted/20 text-lemon-muted text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap">
                {creator.category}
              </span>
            </div>
            
            <p className="text-white/80 text-base md:text-xl font-medium mb-4 italic line-clamp-2 md:line-clamp-none">
              "{creator.tagline || creator.bio}"
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/50 text-xs md:text-sm mb-6 md:mb-8">
              {creator.location && (
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-lemon-muted" /> {creator.location}</span>
              )}
              <span className="flex items-center gap-1.5"><Globe size={14} /> English, Yoruba</span>
              <span className="flex items-center gap-1.5"><PenTool size={14} /> Worldbuilder</span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <FollowButton creator={creator} size="lg" className="flex-1 sm:min-w-[140px]" />
                <SupportButton creator={creator} size="lg" className="flex-1 sm:min-w-[200px]" />
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start mt-2 sm:mt-0">
                <Button variant="glass" size="lg" className="bg-white/5 flex-1 sm:flex-none">
                  <MessageSquare size={18} className="mr-2" /> Collaborate
                </Button>
                {creator.dropsomethingUrl && (
                  <a 
                    href={`https://dropsomething.sbs/${creator.dropsomethingUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-lemon-muted transition-colors whitespace-nowrap"
                  >
                    View Drop <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreatorStatsStrip = ({ creator }: { creator: Creator }) => {
  return (
    <div className="bg-ink-deep/30 border-y border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Followers</span>
            <span className="font-display font-black text-2xl text-white">{(creator.followers / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Total Reads</span>
            <span className="font-display font-black text-2xl text-white">{(creator.totalReads / 1000000).toFixed(1)}M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Series</span>
            <span className="font-display font-black text-2xl text-white">{creator.totalStories}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Completion Rate</span>
            <span className="font-display font-black text-2xl text-white">92%</span>
          </div>
          <div className="hidden lg:flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Studios Worked</span>
             <span className="font-display font-black text-2xl text-white">4</span>
          </div>
          <div className="hidden lg:flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Global Impact</span>
             <span className="font-display font-black text-2xl text-lemon-muted">High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedWorkCard = ({ story, isLarge = false }: { story: Story, isLarge?: boolean, key?: React.Key }) => {
  return (
    <Link 
      to={`/story/${story.id}`} 
      className={cn(
        "group relative flex flex-col bg-ink-deep border border-white/5 rounded-3xl overflow-hidden hover:border-lemon-muted/50 transition-all duration-500",
        isLarge ? "md:flex-row md:h-[450px]" : "h-full"
      )}
    >
      <div className={cn(
        "relative overflow-hidden shrink-0",
        isLarge ? "w-full md:w-[40%] h-64 md:h-auto" : "aspect-[3/4] w-full"
      )}>
        <img 
          src={story.coverImage} 
          alt={story.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black-core via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 left-4">
          <FormatBadge format={story.format} className="bg-black/80 backdrop-blur-md" />
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <GenreBadge genre={story.genre} />
          {story.isOriginal && (
            <span className="px-2 py-0.5 rounded-full bg-lemon-muted text-black text-[9px] font-black uppercase tracking-widest">Original</span>
          )}
        </div>
        
        <h3 className={cn(
          "font-display font-black mb-3 group-hover:text-lemon-muted transition-colors",
          isLarge ? "text-3xl md:text-5xl leading-tight" : "text-2xl"
        )}>
          {story.title}
        </h3>
        
        <p className="text-white/60 text-sm mb-8 line-clamp-3 leading-relaxed">
          {story.synopsis}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm font-bold text-white/40">
             <span className="flex items-center gap-1.5"><Eye size={16} /> {(story.views / 1000).toFixed(0)}k</span>
             <span className="flex items-center gap-1.5"><Star size={16} className="text-lemon-muted fill-lemon-muted" /> {story.rating}</span>
          </div>
          <div className="flex items-center gap-2 text-white group-hover:text-lemon-muted transition-colors font-bold text-xs uppercase tracking-widest">
            Explore Story <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const PortfolioGalleryGrid = ({ items }: { items: GalleryItem[] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item, i) => (
        <div 
          key={i} 
          className={cn(
            "group relative rounded-2xl overflow-hidden cursor-zoom-in",
            i % 5 === 0 ? "md:col-span-2 md:row-span-2 aspect-square" : "aspect-square"
          )}
        >
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black-core via-black-core/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-[10px] font-black uppercase tracking-widest text-lemon-muted mb-1">{item.category}</p>
            <h5 className="font-bold text-sm text-white">{item.title}</h5>
            <p className="text-[10px] text-white/50">{item.project}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const SupportCreatorBlock = ({ creator }: { creator: Creator }) => {
  return (
    <div className="bg-gradient-to-br from-ink-deep to-black border border-lemon-muted/20 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
        <Coffee size={240} />
      </div>
      
      <div className="max-w-2xl relative z-10">
        <h2 className="font-display font-black text-3xl md:text-5xl mb-6 leading-tight">
          Back the next <span className="text-lemon-muted">chapter.</span>
        </h2>
        <p className="text-white/60 text-lg mb-10 leading-relaxed">
          Your support directly funds creative production, world-building, and high-quality storytelling. Help independent creators build the next global franchise.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6">
           <SupportButton creator={creator} size="lg" className="w-full md:w-auto h-16 px-12" />
           <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img 
                  key={i} 
                  src={`https://picsum.photos/seed/supporter${i}/100/100`} 
                  className="w-10 h-10 rounded-full border-2 border-black object-cover" 
                  alt="Supporter"
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-black bg-ink-deep flex items-center justify-center text-[10px] font-black italic">
                +42
              </div>
           </div>
           <p className="text-white/40 text-xs font-medium">Joined by 42 recent supporters</p>
        </div>

        {!creator.supportEnabled && (
           <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
              <X size={18} className="text-white/30" />
              <p className="text-sm text-white/50">This creator has not connected their support system yet.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const CollaborationModal = ({ isOpen, onClose, creatorName }: { isOpen: boolean, onClose: () => void, creatorName: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black-core/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-ink-deep border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Briefcase size={120} />
        </div>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <h2 className="font-display font-black text-2xl md:text-3xl mb-2">Request Collaboration</h2>
        <p className="text-white/50 text-sm mb-8">Direct inquiry to <span className="text-lemon-muted">{creatorName}</span></p>

        <form className="flex flex-col gap-5 relative z-10" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
           <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Name</label>
                 <input type="text" placeholder="Full Name" className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lemon-muted/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Email Address</label>
                 <input type="email" placeholder="email@example.com" className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lemon-muted/50 transition-colors" />
              </div>
           </div>

           <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Reason for Inquiry</label>
              <select className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lemon-muted/50 transition-colors appearance-none">
                 <option>Brand Partnership</option>
                 <option>Animation Adaptation</option>
                 <option>Studio Engagement</option>
                 <option>Creative Collaboration</option>
                 <option>Other / Personal Inquiry</option>
              </select>
           </div>

           <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Message</label>
              <textarea placeholder="Tell us about your project..." rows={4} className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lemon-muted/50 transition-colors resize-none" />
           </div>

           <Button fullWidth size="lg" className="bg-lemon-muted text-black font-black mt-4">
             <Send size={18} className="mr-2" /> Send Request
           </Button>
        </form>
      </motion.div>
    </div>
  );
};

const CreatorActivityFeed = ({ activities }: { activities: CreatorActivity[] }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'release': return <BookOpen size={16} className="text-lemon-muted" />;
      case 'milestone': return <Trophy size={16} className="text-orange-500" />;
      case 'artwork': return <ImageIcon size={16} className="text-cyan-400" />;
      default: return <Plus size={16} />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {activities.map((activity, i) => (
        <div key={i} className="flex gap-4 items-start p-4 bg-white/5 border border-white/5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
            {getIcon(activity.type)}
          </div>
          <div>
            <p className="text-sm text-white/80 font-medium mb-1">{activity.content}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{activity.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Components ---

const AchievementBadge = ({ achievement }: { achievement: PortfolioAchievement, key?: React.Key }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
      {achievement.icon}
    </div>
    <div>
      <p className="font-display font-bold text-lg text-white">{achievement.name}</p>
      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Verified Badge</p>
    </div>
  </div>
);

const PortfolioFilterTabs = ({ categories, activeCategory, onSelect }: { categories: string[], activeCategory: string, onSelect: (cat: string) => void }) => (
  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
    {categories.map(cat => (
      <button 
        key={cat}
        onClick={() => onSelect(cat)}
        className={cn(
        "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
        activeCategory === cat ? "bg-white text-black" : "bg-white/5 text-white/40 hover:bg-white/10"
        )}
      >
        {cat}
      </button>
    ))}
  </div>
);

// --- Main Page ---

export default function CreatorPortfolioPage() {
  const { username } = useParams<{ username: string }>();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  // For mock purposes, find creator by ID or username
  const creator = useMemo(() => {
    return Object.values(MOCK_CREATORS).find(c => c.username === username || c.id === username) || MOCK_CREATORS.ovo;
  }, [username]);

  const creatorStories = useMemo(() => {
    return MOCK_STORIES.filter(s => s.creator.id === creator.id);
  }, [creator.id]);

  const categories = ['All', 'Manga', 'Manhwa', 'Webcomic', 'Novel', 'Concept Art', 'Character Design', 'Animation'];

  const filteredStories = useMemo(() => {
    if (activeCategory === 'All') return creatorStories;
    if (['Manga', 'Manhwa', 'Webcomic', 'Novel'].includes(activeCategory)) {
        return creatorStories.filter(s => s.format === activeCategory);
    }
    return [];
  }, [activeCategory, creatorStories]);

  const filteredGallery = useMemo(() => {
    if (activeCategory === 'All') return creator.galleryItems || [];
    if (['Concept Art', 'Character Design', 'Animation'].includes(activeCategory)) {
        return (creator.galleryItems || []).filter(item => item.category === activeCategory);
    }
    return (creator.galleryItems || []); // Show all for story categories or filter by project?
  }, [activeCategory, creator.galleryItems]);

  const featuredStory = filteredStories[0];
  const otherStories = filteredStories.slice(1);

  return (
    <div className="flex flex-col w-full min-h-screen bg-black-core pb-24 selection:bg-lemon-muted selection:text-black">
      
      <PortfolioHero creator={creator} />
      
      <CreatorStatsStrip creator={creator} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-24">
        
        {/* Sections Grid */}
        <div className="flex flex-col lg:flex-row gap-20">
          
          <div className="flex-1 min-w-0">
            {/* Bio Section */}
            <section className="mb-24">
              <div className="flex flex-col md:flex-row gap-12">
                 <div className="flex-1">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-lemon-muted mb-4">About the Creator</h2>
                    <h3 className="font-display font-black text-4xl mb-6">Creative Soul. Digital Architect.</h3>
                    <p className="text-white/60 text-lg leading-relaxed mb-8">
                       {creator.fullBio || creator.bio}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-8">
                       <div>
                          <h4 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
                             <Award size={18} className="text-lemon-muted" /> Creative Focus
                          </h4>
                          <p className="text-white/50 text-sm leading-relaxed">
                             {creator.creativeMission || "Exploring high-concept narratives through an African lens."}
                          </p>
                       </div>
                       <div>
                          <h4 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
                             <Star size={18} className="text-lemon-muted" /> Signature Style
                          </h4>
                          <p className="text-white/50 text-sm leading-relaxed">
                             {creator.style || "Atmospheric, cinematic, and deeply textural visuals."}
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="w-full md:w-72 shrink-0 flex flex-col gap-8">
                    <div>
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Core Genres</h5>
                       <div className="flex flex-wrap gap-2 text-xs font-bold text-white/60">
                          {(creator.genres || ["Action", "Sci-Fi"]).map(g => (
                            <span key={g} className="px-3 py-1.5 bg-ink-deep border border-white/10 rounded-lg">{g}</span>
                          ))}
                       </div>
                    </div>
                    <div>
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Key Influences</h5>
                       <ul className="text-sm font-medium text-white/50 flex flex-col gap-2">
                          {(creator.influences || ["Classic Manga", "Urban Life"]).map(i => (
                            <li key={i} className="flex items-center gap-2 h-8">
                               <div className="w-1.5 h-1.5 rounded-full bg-lemon-muted/50" />
                               {i}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
            </section>

            {/* Featured Works */}
            <section className="mb-24">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-lemon-muted mb-2">Portfolio</h2>
                    <h3 className="font-display font-black text-4xl">Featured Narrative Works</h3>
                  </div>
                  <PortfolioFilterTabs 
                    categories={categories} 
                    activeCategory={activeCategory} 
                    onSelect={setActiveCategory} 
                  />
                </div>

              <div className="flex flex-col gap-8">
                 {featuredStory && <FeaturedWorkCard story={featuredStory} isLarge={true} />}
                 <div className="grid md:grid-cols-2 gap-8">
                    {otherStories.map(story => (
                      <FeaturedWorkCard key={story.id} story={story} />
                    ))}
                 </div>
              </div>
            </section>

            {/* Creative Gallery */}
            <section className="mb-24">
               <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-lemon-muted mb-2">Archive</h2>
                  <h3 className="font-display font-black text-4xl">Creative Visual Gallery</h3>
                </div>
                <Button variant="outline" className="border-white/10">View All Media</Button>
              </div>
              
              <PortfolioGalleryGrid items={filteredGallery} />
            </section>

          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-96 shrink-0 flex flex-col gap-12">
            
            {/* Stats / Achievements */}
            <div className="bg-ink-deep border border-white/5 rounded-[32px] p-8">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-8 border-b border-white/5 pb-4">Creator Achievements</h4>
              <div className="flex flex-col gap-6">
                 {(creator.achievements || []).map((ach, i) => (
                    <AchievementBadge key={i} achievement={ach} />
                 ))}
                 <div className="flex items-center gap-4 opacity-30">
                    <div className="w-12 h-12 rounded-2xl border border-dashed border-white/20 flex items-center justify-center">
                       <Plus size={18} />
                    </div>
                    <div>
                       <p className="font-bold text-white/50 text-sm">Next Milestone...</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Support Block Small */}
            <div className="bg-gradient-to-b from-lemon-muted to-lemon-muted/80 rounded-[32px] p-8 text-black shadow-2xl shadow-lemon-muted/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                  <Coffee size={140} />
               </div>
               <h4 className="font-display font-black text-2xl mb-4 leading-tight">Back the creative future.</h4>
               <p className="font-medium text-black/70 mb-8 text-sm">Join the 1,245 fans directly enabling this creator's work.</p>
               <SupportButton creator={creator} size="lg" className="w-full bg-black text-white hover:bg-black/90 h-14" />
            </div>

            {/* Activity Feed */}
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">Recent Activity</h4>
               <CreatorActivityFeed activities={creator.recentActivity || []} />
            </div>

            {/* Collaboration Card */}
            <div className="bg-ink-deep border border-white/5 rounded-[32px] p-8">
               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase size={24} className="text-white/50" />
               </div>
               <h4 className="font-display font-black text-2xl mb-2">Work with the Creator</h4>
               <p className="text-white/50 text-sm mb-8 leading-relaxed">Interested in brand partnerships, studios, or collaborations?</p>
               
               <div className="flex flex-col gap-3 mb-8">
                  {[
                    { label: 'Brand Partnerships', open: creator.collaborationStatus?.openForBrand },
                    { label: 'Studio Projects', open: creator.collaborationStatus?.openForStudio },
                    { label: 'Animation Adaptations', open: creator.collaborationStatus?.openForAnimation },
                    { label: 'Creative Commissions', open: creator.collaborationStatus?.openForCommissions }
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between items-center text-xs">
                       <span className="text-white/40">{stat.label}</span>
                       <span className={cn(
                        "px-2 py-0.5 rounded-full font-black uppercase tracking-widest text-[9px]",
                        stat.open ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white/20"
                       )}>
                         {stat.open ? 'OPEN' : 'BUSY'}
                       </span>
                    </div>
                  ))}
               </div>

               <Button 
                fullWidth 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 font-black h-14"
                onClick={() => setIsCollabModalOpen(true)}
               >
                 Inquire Now
               </Button>
            </div>

          </aside>

        </div>

        {/* Large Support Section */}
        <section className="mt-40 mb-20">
           <SupportCreatorBlock creator={creator} />
        </section>

      </main>

      <CollaborationModal 
        isOpen={isCollabModalOpen} 
        onClose={() => setIsCollabModalOpen(false)} 
        creatorName={creator.name} 
      />

      {/* Sticky Bottom Support for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black-core via-black-core to-transparent md:hidden z-[60]">
         <SupportButton creator={creator} size="lg" fullWidth className="h-16 shadow-2xl shadow-lemon-muted/20" />
      </div>

    </div>
  );
}
