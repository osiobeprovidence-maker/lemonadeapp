import React, { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Grid3X3, List, Flame, Sparkles, TrendingUp, Clock, Star, BookOpen } from 'lucide-react';
import { StoryCard, GenreBadge } from '../components/ui/Cards';
import { cn } from '../lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ALL_GENRES, ALL_CONTENT_TYPES, ALL_MODERN_FANTASY_TAGS, ALL_ROMANCE_TAGS } from '../data/types';
import type { Genre, ContentType } from '../data/types';

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending', icon: Flame },
  { value: 'newest', label: 'Newest', icon: Sparkles },
  { value: 'popular', label: 'Most Read', icon: TrendingUp },
  { value: 'top_rated', label: 'Top Rated', icon: Star },
  { value: 'recently_updated', label: 'Recently Updated', icon: Clock },
];

const STATUS_OPTIONS = ['All', 'Ongoing', 'Completed', 'Hiatus', 'Cancelled'];

export default function Explore() {
  const { stories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeType, setActiveType] = useState<ContentType | 'All'>('All');
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [activeSort, setActiveSort] = useState(searchParams.get('sort') || 'trending');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let results = [...stories];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.creator.name.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        (s.genres && s.genres.some(g => g.toLowerCase().includes(q))) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(q))) ||
        (s.author && s.author.toLowerCase().includes(q))
      );
    }

    // Content type filter
    if (activeType !== 'All') {
      results = results.filter(s =>
        s.contentType === activeType || s.format === activeType
      );
    }

    // Genre filter
    if (activeGenre !== 'All') {
      results = results.filter(s =>
        s.genre === activeGenre ||
        (s.genres && s.genres.includes(activeGenre)) ||
        (s.tags && s.tags.includes(activeGenre))
      );
    }

    // Status filter
    if (activeStatus !== 'All') {
      results = results.filter(s =>
        s.publicationStatus === activeStatus.toLowerCase()
      );
    }

    // Sort
    switch (activeSort) {
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'popular':
        results.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'top_rated':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'recently_updated':
        results.sort((a, b) => {
          const aDate = new Date(a.lastChapterAt || a.updatedAt || 0).getTime();
          const bDate = new Date(b.lastChapterAt || b.updatedAt || 0).getTime();
          return bDate - aDate;
        });
        break;
      case 'trending':
      default:
        results.sort((a, b) => (b.weeklyViews || b.views || 0) - (a.weeklyViews || a.views || 0));
        break;
    }

    return results;
  }, [stories, searchQuery, activeType, activeGenre, activeStatus, activeSort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const activeFilterCount = [activeType !== 'All', activeGenre !== 'All', activeStatus !== 'All'].filter(Boolean).length;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5 px-4 pt-6 pb-3 md:px-8">
        <h1 className="font-display font-black text-3xl md:text-4xl mb-4">Explore</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-white/40" />
          </div>
          <input
            type="text"
            placeholder="Search manga, webtoons, novels, authors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-ink-deep border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-lemon-muted transition-colors font-medium"
          />
        </form>

        {/* Content Type Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          <button
            onClick={() => setActiveType('All')}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all",
              activeType === 'All'
                ? "bg-lemon-muted text-black"
                : "bg-ink-deep text-white/60 border border-white/10 hover:bg-white/10"
            )}
          >
            All
          </button>
          {ALL_CONTENT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                activeType === type
                  ? "bg-lemon-muted text-black"
                  : "bg-ink-deep text-white/60 border border-white/10 hover:bg-white/10"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort + Filter Bar */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex gap-1 bg-ink-deep/50 p-1 rounded-xl border border-white/5 overflow-x-auto hide-scrollbar flex-1">
            {SORT_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveSort(opt.value)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    activeSort === opt.value
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  <Icon size={12} />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-colors relative",
              showFilters || activeFilterCount > 0
                ? "bg-lemon-muted text-black"
                : "bg-ink-deep border border-white/10 text-white/60"
            )}
          >
            <Filter size={14} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="px-4 py-4 border-b border-white/5 bg-[#0F0F0F] md:px-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/40">Filters</h3>
            <button
              onClick={() => { setActiveGenre('All'); setActiveStatus('All'); setActiveType('All'); }}
              className="text-xs text-lemon-muted font-bold hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveStatus(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeStatus === s
                      ? "bg-lemon-muted text-black"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Genres</label>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(activeGenre === g ? 'All' : g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeGenre === g
                      ? "bg-lemon-muted text-black"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Modern Fantasy Tags */}
          <div className="mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Modern Fantasy Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_MODERN_FANTASY_TAGS.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveGenre(activeGenre === t ? 'All' : t)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeGenre === t
                      ? "bg-lemon-muted text-black"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Romance Tags */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Romance Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_ROMANCE_TAGS.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveGenre(activeGenre === t ? 'All' : t)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeGenre === t
                      ? "bg-lemon-muted text-black"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-4 pt-6 pb-12 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/50 font-medium">
            {filtered.length} {filtered.length === 1 ? 'title' : 'titles'} found
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filtered.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-white/10 mb-4" />
            <h2 className="font-display font-black text-xl mb-2">No results found</h2>
            <p className="text-white/40 text-sm max-w-sm">
              Try adjusting your filters or search terms. You can also request content you can't find.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
