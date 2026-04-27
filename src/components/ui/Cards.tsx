import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Play, Lock, Crown, Check, BookOpen, Users, Star, Flame, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Story, Genre, Reader, Badge, Creator } from '../../data/mock';
import { Button } from './Button';

export function FormatBadge({ format, className }: { format: string, className?: string }) {
  return (
    <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-black", className)}>
      {format}
    </div>
  );
}

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-lemon-muted text-black flex items-center gap-1", className)}>
      <Crown size={10} /> Premium
    </div>
  );
}

export function AchievementBadge({ badge, className }: { badge: Badge, className?: string, key?: React.Key }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 p-4 bg-ink-deep rounded-2xl border border-white/5 hover:border-lemon-muted/30 transition-colors text-center group", className)}>
      <div className="text-3xl group-hover:scale-110 transition-transform">{badge.icon}</div>
      <div>
        <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
        <p className="text-[10px] text-white/50">{badge.description}</p>
      </div>
    </div>
  );
}

export function SupportStatusBadge({ status }: { status: 'supported' | 'top-supporter' | 'none' }) {
  if (status === 'none') return null;
  
  return (
    <div className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1",
      status === 'top-supporter' ? "bg-orange-500 text-white" : "bg-lemon-muted/20 text-lemon-muted border border-lemon-muted/30"
    )}>
      {status === 'top-supporter' ? <Trophy size={10} /> : <Heart size={10} />}
      {status === 'top-supporter' ? "Top Supporter" : "Supported"}
    </div>
  );
}

export function CreatorStatsCard({ creator }: { creator: Creator }) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
        <div className="text-white/40 mb-1"><Users size={14} className="mx-auto" /></div>
        <div className="font-display font-bold text-base">{(creator.followers / 1000).toFixed(1)}k</div>
        <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Followers</div>
      </div>
      <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
        <div className="text-white/40 mb-1"><BookOpen size={14} className="mx-auto" /></div>
        <div className="font-display font-bold text-base">{(creator.totalReads / 1000000).toFixed(1)}M</div>
        <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Reads</div>
      </div>
      <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
        <div className="text-white/40 mb-1"><Star size={14} className="mx-auto" /></div>
        <div className="font-display font-bold text-base">{creator.totalStories}</div>
        <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Stories</div>
      </div>
    </div>
  );
}

export function ReaderProfileCard({ reader }: { reader: Reader }) {
  const isPremium = reader.premiumStatus === 'Premium Reader';
  
  return (
    <div className="bg-ink-deep border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
      {isPremium && (
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <Crown size={80} />
        </div>
      )}
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <img src={reader.avatar} alt={reader.username} className={cn(
            "w-16 h-16 rounded-full object-cover border-2",
            isPremium ? "border-lemon-muted" : "border-white/10"
          )} referrerPolicy="no-referrer" />
          {isPremium && (
            <div className="absolute -bottom-1 -right-1 bg-lemon-muted rounded-full p-1 text-black shadow-lg">
              <Crown size={10} />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-display font-bold text-xl">{reader.displayName}</h3>
          <p className="text-white/50 text-sm">@{reader.username}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Streak</span>
          </div>
          <div className="font-display font-bold text-2xl">{reader.readingStreak} Days</div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-lemon-muted" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Chapters</span>
          </div>
          <div className="font-display font-bold text-2xl">{reader.totalChaptersRead}</div>
        </div>
      </div>
    </div>
  );
}

export function GenreBadge({ genre, className }: { genre: Genre, className?: string }) {
  const colorMap: Record<Genre, string> = {
    "Action": "bg-[#CC5500]",
    "Romance": "bg-[#D08C99]",
    "Horror": "bg-[#8A0303]",
    "Sci-Fi & Cyberpunk": "bg-[#8A2BE2]",
    "African Fantasy": "bg-[#046307]",
    "Drama": "bg-[#6E8E9B]",
    "Mystery": "bg-[#1f2937]"
  };

  return (
    <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white", colorMap[genre], className)}>
      {genre}
    </div>
  );
}

export function LockedContentCTA({ price }: { price?: number }) {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-ink-deep to-black border border-lemon-muted/20 rounded-xl mt-4">
      <div className="flex items-center gap-3 w-full md:w-auto text-center md:text-left">
        <div className="w-10 h-10 rounded-full bg-lemon-muted/10 text-lemon-muted flex items-center justify-center shrink-0 mx-auto md:mx-0">
          <Lock size={18} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-white">This chapter is locked</h4>
          <p className="text-xs text-white/50">Unlock directly or upgrade to Premium to read.</p>
        </div>
      </div>
      <div className="flex w-full md:w-auto items-center justify-center md:justify-end gap-3">
        {price && <span className="text-xs font-bold text-white/60">{price} Coins</span>}
        <Link to="/premium" className="w-full md:w-auto">
          <Button size="sm" className="w-full">Upgrade to Premium</Button>
        </Link>
      </div>
    </div>
  );
}

export function PremiumPlanCard({ 
  name, 
  price, 
  period, 
  features, 
  isPopular, 
  isActive 
}: { 
  name: string, 
  price: string, 
  period: string, 
  features: string[], 
  isPopular?: boolean,
  isActive?: boolean
}) {
  return (
    <div className={cn(
      "relative p-6 rounded-3xl border flex flex-col h-full",
      isActive ? "bg-white/5 border-lemon-muted/50" : isPopular ? "bg-gradient-to-b from-ink-deep to-black border-lemon-muted" : "bg-ink-deep border-white/10"
    )}>
      {isPopular && !isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-lemon-muted text-black text-[10px] font-black uppercase tracking-wider rounded-full">
          Most Popular
        </div>
      )}
      {isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-full">
          Current Plan
        </div>
      )}
      
      <h3 className="font-display font-bold text-xl mb-2">{name}</h3>
      <div className="flex items-end gap-1 mb-6">
        <span className="font-display font-black text-4xl text-lemon-muted">{price}</span>
        <span className="text-white/40 text-sm mb-1 font-medium">{period}</span>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 mb-8">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <Check size={16} className="text-lemon-muted shrink-0 mt-0.5" />
            <span className="text-sm text-white/70">{feature}</span>
          </div>
        ))}
      </div>
      
      <Button 
        variant={isActive ? "outline" : isPopular ? "primary" : "secondary"} 
        fullWidth
        className={isActive ? "opacity-50 pointer-events-none" : ""}
      >
        {isActive ? "Active Plan" : "Choose Plan"}
      </Button>
    </div>
  );
}

export function StoryCard({ story, className }: { story: Story, className?: string, key?: React.Key }) {
  return (
    <Link to={`/story/${story.id}`} className={cn("group flex flex-col gap-3", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink-deep">
        <img 
          src={story.coverImage} 
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {story.isOriginal && (
            <div className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-lemon-muted text-black">
              Original
            </div>
          )}
          <FormatBadge format={story.format} />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <div className="flex bg-black/60 backdrop-blur-md rounded-full px-2 py-1 gap-3 text-xs w-full justify-center">
            <span className="flex items-center gap-1 font-medium"><Heart size={12} className="text-white/70" /> {(story.saves / 1000).toFixed(1)}k</span>
            <span className="flex items-center gap-1 font-medium"><Eye size={12} className="text-white/70" /> {(story.views / 1000).toFixed(1)}k</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-0.5">
        <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-lemon-muted transition-colors">{story.title}</h3>
        <p className="text-white/60 font-medium text-sm">{story.creator.name}</p>
      </div>
    </Link>
  );
}

export function HorizontalStoryCard({ story, className }: { story: Story, className?: string, key?: React.Key }) {
  return (
    <Link to={`/story/${story.id}`} className={cn("group flex items-center gap-4 bg-ink-deep/50 hover:bg-ink-deep p-3 rounded-2xl transition-colors", className)}>
       <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-black">
        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
       </div>
       <div className="flex-1 flex flex-col min-w-0">
         <div className="flex items-center gap-2 mb-1">
            <FormatBadge format={story.format} className="text-[8px] px-1.5 py-0" />
         </div>
         <h4 className="font-display font-semibold text-base truncate">{story.title}</h4>
         <p className="text-sm text-white/50 truncate mb-1">{story.creator.name}</p>
         <div className="flex items-center gap-3 text-xs text-white/40">
           <span className="flex items-center gap-1"><Heart size={10} /> {(story.saves / 1000).toFixed(1)}k</span>
           <span>•</span>
           <span>{story.episodes} Chapters</span>
         </div>
       </div>
    </Link>
  )
}
