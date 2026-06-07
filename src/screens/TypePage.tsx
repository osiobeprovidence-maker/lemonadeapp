import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Flame, TrendingUp, Star, Clock } from 'lucide-react';
import { StoryCard } from '../components/ui/Cards';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';

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

export default function TypePage() {
  const { type } = useParams<{ type: string }>();
  const { stories } = useApp();
  const [activeSort, setActiveSort] = useState('trending');

  const typeName = type || 'manga';
  const typeLabel = TYPE_LABELS[typeName] || typeName;

  const typeStories = useMemo(() => {
    const normalized = typeName.toLowerCase().replace('-', '_').replace('light novel', 'light_novel');
    let results = stories.filter(s => {
      const ct = (s.contentType || '').toLowerCase().replace(' ', '_');
      const fmt = (s.format || '').toLowerCase().replace(' ', '_');
      return ct === normalized || fmt === normalized ||
        ct === typeName.toLowerCase() || fmt === typeName.toLowerCase();
    });

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
  }, [stories, typeName, activeSort]);

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
            {typeStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
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
