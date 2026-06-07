import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MapPin, BookOpen, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StoryCard } from '../components/ui/Cards';
import { FollowButton, SupportButton } from '../components/InteractionButtons';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';
import { shareLink } from '../lib/share';

type StudioCreator = {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  category: string | string[];
  followers: number;
  supportEnabled: boolean;
  banner?: string;
  location?: string;
  studioMembers?: Array<{ userId: string; username: string; name: string; role: string }>;
};

export default function StudioPage() {
  const { studioId } = useParams();
  const { creators, stories } = useApp();
  const [studio, setStudio] = useState<StudioCreator | null>(null);
  const [studioStories, setStudioStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'works' | 'members'>('works');

  useEffect(() => {
    if (!studioId || !convex) return;
    setLoading(true);
    Promise.all([
      convex.query(api.creators.getByStudioId, { studioId }),
      convex.query(api.stories.listByStudio, { studioId }),
    ])
      .then(([studioData, storyDocs]) => {
        setStudio(studioData as StudioCreator | null);
        setStudioStories(storyDocs || []);
      })
      .catch(() => {
        const local = Object.values(creators as Record<string, any>).find(
          (c: any) => c.id === studioId || c._id === studioId
        );
        if (local) {
          setStudio(local as StudioCreator);
          setStudioStories(stories.filter((s) => s.studioId === studioId).map((s) => ({ ...s, _externalId: s.id })));
        }
      })
      .finally(() => setLoading(false));
  }, [studioId, creators, stories]);

  const memberCreators = useMemo(() => {
    if (!studio?.studioMembers) return [];
    return studio.studioMembers.map((m) => {
      const found = Object.values(creators as Record<string, any>).find(
        (c: any) => c.username === m.username || c.id === m.userId
      );
      return { ...m, creator: found || null };
    });
  }, [studio?.studioMembers, creators]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lemon-muted border-t-transparent" />
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-3xl font-black mb-3">Studio not found</h1>
        <p className="max-w-md text-white/50 font-bold">This studio profile is not available yet.</p>
      </div>
    );
  }

  const cat = Array.isArray(studio.category) ? studio.category.join(', ') : studio.category;
  const creatorObj = { username: studio.username, name: studio.name, id: studio._id, avatar: studio.avatar, followers: studio.followers, bio: studio.bio, category: cat as any, totalReads: 0, totalStories: 0, supportEnabled: studio.supportEnabled } as any;

  return (
    <div className="flex flex-col w-full min-h-screen pb-24">
      <div className="h-64 md:h-80 bg-ink-deep relative overflow-hidden">
        <img src={studio.banner || `https://picsum.photos/seed/${studio._id}banner/1200/400`} alt="Banner" className="w-full h-full object-cover opacity-30 blur-sm scale-110" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black-core via-black-core/40 to-transparent" />
      </div>

      <div className="px-6 md:px-12 max-w-6xl mx-auto w-full -mt-32 relative z-10 flex flex-col md:flex-row gap-8 lg:gap-16">
        <div className="flex flex-col items-center md:items-start w-full md:w-80 shrink-0">
          <div className="relative mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-black-core bg-ink-deep overflow-hidden shadow-2xl relative z-10 flex items-center justify-center">
              {studio.avatar ? (
                <img src={studio.avatar} alt={studio.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Users size={48} className="text-lemon-muted" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-lemon-muted/10 blur-xl scale-110 -z-0" />
          </div>

          <div className="text-center md:text-left w-full mb-8">
            <h1 className="font-display font-black text-3xl md:text-4xl text-glow mb-1">{studio.name}</h1>
            <p className="text-white/40 font-medium mb-3">@{studio.username}</p>
            <div className="inline-flex px-3 py-1 bg-lemon-muted/10 rounded-full text-[10px] font-black uppercase tracking-widest text-lemon-muted border border-lemon-muted/20 mb-6">
              <Users size={10} className="mr-1" /> Studio
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs mx-auto md:mx-0">{studio.bio}</p>
            <div className="flex flex-col gap-3 w-full">
              <FollowButton creator={creatorObj} size="lg" className="flex-1" />
              <SupportButton creator={creatorObj} size="lg" className="flex-1" />
            </div>
          </div>

          <div className="w-full h-px bg-white/10 mb-8" />

          <div className="flex flex-col gap-4 text-sm text-white/50 w-full mb-10">
            {studio.location && <div className="flex items-center gap-3"><MapPin size={18} className="text-lemon-muted" /> {studio.location}</div>}
            <div className="flex items-center gap-3"><BookOpen size={18} className="text-lemon-muted" />{studioStories.length} {studioStories.length === 1 ? 'work' : 'works'} published</div>
            {studio.studioMembers && <div className="flex items-center gap-3"><Users size={18} className="text-lemon-muted" />{studio.studioMembers.length} {studio.studioMembers.length === 1 ? 'member' : 'members'}</div>}
          </div>

          <Button
            variant="glass"
            className="w-full"
            onClick={async () => {
              const url = `${window.location.origin}/studio/${studio._id}`;
              try {
                const res = await shareLink({ title: `${studio.name} on OWUUU`, url });
                if (res.method !== 'native') alert('Link copied!');
              } catch { alert('Unable to share.'); }
            }}
          >
            <Share2 size={16} className="mr-2" /> Share Studio
          </Button>
        </div>

        <div className="flex-1 min-w-0 pt-4 md:pt-12">
          <div className="grid grid-cols-2 rounded-2xl bg-[#141414] p-1 ring-1 ring-white/8 mb-6">
            {(['works', 'members'] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={cn('relative rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors',
                  activeTab === tab ? 'text-black' : 'text-white/45 hover:text-white/80')}>
                {activeTab === tab && <motion.span layoutId="studio-tab-pill" className="absolute inset-0 rounded-xl bg-lemon-muted" />}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          {activeTab === 'works' && (
            studioStories.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen size={48} className="mx-auto text-white/15 mb-4" />
                <p className="text-white/40 font-bold">No works published yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {studioStories.map((story) => (
                  <StoryCard key={story._id || story.externalId || story.id}
                    story={{ id: story.externalId || story._id || story.id, title: story.title,
                      coverImage: story.coverImage || '', creator: { name: studio.name, username: studio.username, avatar: studio.avatar } as any,
                      genre: story.genre, format: story.format || story.contentType || 'Manga',
                      rating: story.rating || 0, views: story.views || 0, saves: story.saves || 0,
                      episodes: story.episodes || 0, synopsis: story.synopsis || '',
                      bannerImage: story.bannerImage || '', tags: story.tags || [], isOriginal: story.isOriginal || false }} />
                ))}
              </div>
            )
          )}

          {activeTab === 'members' && (
            !studio.studioMembers || studio.studioMembers.length === 0 ? (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-white/15 mb-4" />
                <p className="text-white/40 font-bold">No members listed yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(studio.studioMembers || []).map((member, idx) => {
                  const cd = memberCreators[idx]?.creator;
                  return (
                    <div key={idx} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#141414] p-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#1A1A1A] shrink-0 ring-1 ring-white/10">
                        {cd?.avatar
                          ? <img src={cd.avatar} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          : <div className="w-full h-full flex items-center justify-center text-white/25 text-xs font-black">{member.name.slice(0, 2).toUpperCase()}</div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        {cd
                          ? <Link to={`/creator/${cd.username}`} className="text-sm font-black hover:text-lemon-muted transition-colors">{member.name}</Link>
                          : <div className="text-sm font-black">{member.name}</div>}
                        <div className="text-[10px] font-black uppercase tracking-widest text-lemon-muted">{member.role}</div>
                        {cd?.username && <div className="text-xs text-white/35">@{cd.username}</div>}
                      </div>
                      {cd && <Link to={`/creator/${cd.username}`}><Button variant="glass" size="sm" className="rounded-xl">View</Button></Link>}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
