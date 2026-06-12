import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Flame, TrendingUp, Star, Clock, Heart, Eye } from 'lucide-react';
import { StoryCard } from '../components/ui/Cards';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';
import type { Story } from '../data/types';

const TYPE_LABELS: Record<string, string> = {
  manga: 'Manga',
  manhwa: 'Manhwa',
  manhua: 'Manhua',
  webtoon: 'Webtoon',
  comic: 'Comics',
  novel: 'Novels',
  'light-novel': 'Light Novels',
};

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending', icon: Flame },
  { value: 'popular', label: 'Most Read', icon: TrendingUp },
  { value: 'top_rated', label: 'Top Rated', icon: Star },
  { value: 'newest', label: 'Newest', icon: Clock },
];

const TYPE_TO_CONTENT: Record<string, string> = {
  manga: 'manga',
  manhwa: 'manhwa',
  manhua: 'manhua',
  webtoon: 'webtoon',
  comic: 'comic',
  novel: 'novel',
  'light-novel': 'light_novel',
};

function normalizeExternalContent(item: any): Story {
  return {
    id: `ext_${item.urlSlug || item._id}`,
    title: item.titleRomaji || item.titleEnglish || 'Untitled',
    alternativeTitles: item.alternativeTitles,
    creator: { name: item.author || item.publisher || 'AniList', id: '', username: '', avatar: '', followers: 0, bio: '', category: 'Writer' as const, totalReads: 0, totalStories: 0, supportEnabled: false },
    genre: item.genres?.[0] || 'Other',
    genres: item.genres,
    format: item.contentDetection || item.format,
    contentType: item.contentDetection as any,
    rating: item.averageScore ? item.averageScore / 10 : 0,
    ratingCount: item.meanScore,
    views: item.popularity || 0,
    saves: item.favorites || 0,
    followers: item.favorites,
    episodes: item.chapterCount || 0,
    synopsis: item.description || '',
    description: item.description,
    coverImage: item.coverImage || '',
    bannerImage: item.bannerImage || '',
    author: item.author,
    artist: item.artist,
    tags: item.tags || [],
    isFeatured: false,
    isOriginal: false,
    status: 'published' as const,
  };
}

export default function TypePage() {
  const { type } = useParams<{ type: string }>();
  const { stories } = useApp();
  const [activeSort, setActiveSort] = useState('trending');
  const [externalStories, setExternalStories] = useState<any[]>([]);
  const [loadingExternal, setLoadingExternal] = useState(true);

  const typeName = type || 'manga';
  const typeLabel = TYPE_LABELS[typeName] || typeName;

  useEffect(() => {
    const contentType = TYPE_TO_CONTENT[typeName];
    if (!convex) return;
    setLoadingExternal(true);
    convex.query(api.externalContent.listPublishedByPopularity, { contentType, limit: 50 })
      .then(setExternalStories)
      .catch(() => {})
      .finally(() => setLoadingExternal(false));
  }, [typeName]);

  const typeStories = useMemo(() => {
    const normalized = typeName.toLowerCase().replace('-', '_').replace('light novel', 'light_novel');
    let results = stories.filter(s => {
      const ct = (s.contentType || '').toLowerCase().replace(' ', '_');
      const fmt = (s.format || '').toLowerCase().replace(' ', '_');
      return ct === normalized || fmt === normalized ||
        ct === typeName.toLowerCase() || fmt === typeName.toLowerCase();
    });

    const externalNormalized = externalStories.map(normalizeExternalContent);
    results = [...results, ...externalNormalized];

    switch (activeSort) {
      case 'newest':
        results = [...results].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'popular':
        results = [...results].sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'top_rated':
        results = [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'trending':
      default:
        results = [...results].sort((a, b) => (b.weeklyViews || b.views || 0) - (a.weeklyViews || a.views || 0));
        break;
    }

    return results;
  }, [stories, typeName, activeSort, externalStories]);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 md:px-8">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} />
          Back to Explore
        </Link>
        <h1 className="font-display font-black text-4xl md:text-5xl mb-2">{typeLabel}</h1>
        <p className="text-white/40 text-sm">
          {typeStories.length} {typeStories.length === 1 ? 'title' : 'titles'}
        </p>
      </div>

      {/* Sort */}
      <div className="px-4 mb-6 md:px-8">
        <div className="flex gap-1 bg-ink-deep/50 p-1 rounded-xl border border-white/5 overflow-x-auto hide-scrollbar">
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setActiveSort(opt.value)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                  activeSort === opt.value
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Icon size={14} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stories Grid */}
      <section className="px-4 pb-12 md:px-8">
        {typeStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {typeStories.map(story => {
              const isExternal = story.id.startsWith('ext_');
              const extSlug = isExternal ? story.id.replace('ext_', '') : '';
              return isExternal ? (
                <Link
                  key={story.id}
                  to={`/catalog/${extSlug}`}
                  className="group flex flex-col gap-2.5"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#171717] shadow-lg shadow-black/20">
                    <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                    <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                      <div className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-lemon-muted text-black">
                        Imported
                      </div>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end opacity-100 sm:opacity-0 transform sm:translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      <div className="flex bg-black/65 backdrop-blur-md rounded-full px-2 py-1 gap-2 text-[10px] w-full justify-center">
                        <span className="flex items-center gap-1 font-medium"><Heart size={12} className="text-white/70" /> {(story.saves / 1000).toFixed(1)}k</span>
                        <span className="flex items-center gap-1 font-medium"><Eye size={12} className="text-white/70" /> {(story.views / 1000).toFixed(1)}k</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-display font-semibold text-[15px] sm:text-lg leading-tight group-hover:text-lemon-muted transition-colors line-clamp-2">{story.title}</h3>
                    <p className="text-white/55 font-medium text-xs sm:text-sm truncate">{(story as any).author || 'AniList'}</p>
                  </div>
                </Link>
              ) : (
                <StoryCard key={story.id} story={story} />
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-white/40">
            <p className="font-display text-lg font-bold mb-2">No {typeLabel.toLowerCase()} available yet</p>
            <p className="text-sm">Check back soon or explore other content types.</p>
          </div>
        )}
      </section>
    </div>
  );
}
