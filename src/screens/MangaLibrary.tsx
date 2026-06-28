import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Star, Heart, Eye, TrendingUp, Clock, Search, Loader2, Zap, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';

type MangaDoc = Doc<"manga">;

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular', icon: TrendingUp },
  { value: 'top_rated', label: 'Top Rated', icon: Star },
  { value: 'newest', label: 'Newest', icon: Clock },
];

export default function MangaLibrary() {
  const [manga, setManga] = useState<MangaDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popular');
  const [search, setSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    if (!convex) return;
    setLoading(true);
    const q = sort === 'top_rated' ? api.manga.listPublishedByRating : api.manga.listPublished;
    convex.query(q, { limit: 100 })
      .then(setManga)
      .catch((err) => console.error('Failed to load manga library', err))
      .finally(() => setLoading(false));
  }, [sort]);

  const allGenres = [...new Set(manga.flatMap((m) => m.genres))].sort();

  const filtered = manga.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.alternativeTitle?.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedGenres.length > 0 && !selectedGenres.some((g) => m.genres.includes(g))) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 md:px-8 border-b border-white/5">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Explore
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-4xl md:text-5xl">Manga Library</h1>
            <p className="text-white/40 text-sm mt-1">{filtered.length} titles</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search manga..."
                className="w-48 bg-ink-deep border border-white/5 rounded-lg pl-9 pr-3 h-10 text-white text-sm focus:outline-none focus:border-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sort + Genre filters */}
      <div className="px-4 md:px-8 py-4 border-b border-white/5 flex flex-wrap items-center gap-4">
        <div className="flex gap-1 bg-ink-deep/50 p-1 rounded-lg border border-white/5">
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setSort(opt.value)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors",
                  sort === opt.value ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                )}><Icon size={14} /> {opt.label}</button>
            );
          })}
        </div>
        <div className="flex gap-1.5 flex-wrap flex-1">
          {allGenres.slice(0, 15).map((g) => (
            <button key={g} onClick={() => setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])}
              className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border transition-all",
                selectedGenres.includes(g) ? "bg-lemon-muted text-black border-lemon-muted" : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
              )}>{g}</button>
          ))}
          {allGenres.length > 15 && (
            <span className="text-[9px] text-white/20 self-center">+{allGenres.length - 15}</span>
          )}
        </div>
      </div>

      {/* Manga Grid */}
      <section className="px-4 md:px-8 py-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-white/20" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-white/40">
            <p className="font-display text-lg font-bold mb-2">No manga found</p>
            <p className="text-sm">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filtered.map((m) => (
              <Link key={m._id} to={`/manga/${m.slug}`} className="group flex flex-col gap-2.5">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#171717] shadow-lg shadow-black/20">
                  <img src={m.coverImage || 'https://placehold.co/300x400?text=No+Cover'} alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    <div className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-lemon-muted text-black">
                      {m.source}
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
                    <div className="flex bg-black/65 backdrop-blur-md rounded-full px-2 py-1 gap-2 text-[10px] w-full justify-center">
                      {m.rating != null && (
                        <span className="flex items-center gap-1 font-medium"><Star size={10} className="text-yellow-400" /> {m.rating.toFixed(1)}</span>
                      )}
                      {m.popularityScore != null && (
                        <span className="flex items-center gap-1 font-medium"><Heart size={10} className="text-white/70" /> {(m.popularityScore / 1000).toFixed(1)}k</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-display font-semibold text-[15px] sm:text-lg leading-tight group-hover:text-lemon-muted transition-colors line-clamp-2">{m.title}</h3>
                  <p className="text-white/55 font-medium text-xs sm:text-sm truncate">{m.author || m.source}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
