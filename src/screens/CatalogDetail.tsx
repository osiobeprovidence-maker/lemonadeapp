import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Eye, ExternalLink, BookOpen, Calendar, Globe, User, Loader2, Tag } from 'lucide-react';
import { cn } from '../lib/utils';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

const TYPE_COLORS: Record<string, string> = {
  manga: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  manhwa: 'bg-green-500/10 text-green-400 border-green-500/20',
  manhua: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  novel: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  light_novel: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  webtoon: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function CatalogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !convex) return;
    setLoading(true);
    convex.query(api.externalContent.getBySlug, { slug })
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p className="text-white/40 font-bold text-lg">Content not found</p>
        <Link to="/explore" className="text-lemon-muted text-sm hover:underline">Back to explore</Link>
      </div>
    );
  }

  const type = item.contentDetection || 'other';
  const typeColor = TYPE_COLORS[type] || 'bg-white/5 text-white/40 border-white/10';
  const formatLabel = (fmt: string) => fmt?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'N/A';

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-72 overflow-hidden">
        {item.bannerImage ? (
          <img src={item.bannerImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-ink-deep to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Back */}
        <Link to={`/${type === 'light_novel' ? 'novel' : type === 'webtoon' ? 'webtoon' : type === 'manhwa' ? 'manga' : type}`} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-8 -mt-24 relative z-10 pb-8">
        {/* Cover */}
        <div className="shrink-0 w-40 md:w-56">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#171717] shadow-2xl shadow-black/50 border border-white/10">
            <img
              src={item.coverImage || 'https://placehold.co/300x400?text=No+Cover'}
              alt={item.titleRomaji}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-16 lg:pt-0 lg:self-end">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn('text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border', typeColor)}>
              {type}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">
              {formatLabel(item.format)}
            </span>
            {item.isAdult && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                18+
              </span>
            )}
          </div>

          <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl leading-tight text-white">
            {item.titleRomaji || 'Untitled'}
          </h1>
          {item.titleEnglish && (
            <p className="text-lg text-white/40 font-medium mt-1">{item.titleEnglish}</p>
          )}
          {item.titleNative && (
            <p className="text-base text-white/30 font-medium">{item.titleNative}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-4 text-sm text-white/50 flex-wrap">
            {item.author && (
              <span className="flex items-center gap-1.5">
                <User size={14} /> {item.author}
              </span>
            )}
            {item.artist && item.artist !== item.author && (
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> {item.artist}
              </span>
            )}
            {item.chapterCount != null && (
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} /> {item.chapterCount} {item.chapterCount === 1 ? 'chapter' : 'chapters'}
              </span>
            )}
            {item.volumeCount != null && (
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} /> {item.volumeCount} {item.volumeCount === 1 ? 'volume' : 'volumes'}
              </span>
            )}
            {item.status && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {formatLabel(item.status)}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            {item.averageScore != null && (
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-yellow-400" fill="currentColor" />
                <span className="font-black text-lg text-yellow-400">{(item.averageScore / 10).toFixed(1)}</span>
                {item.meanScore != null && (
                  <span className="text-xs text-white/30">/10</span>
                )}
              </div>
            )}
            {item.popularity != null && (
              <div className="flex items-center gap-1.5">
                <Heart size={16} className="text-white/40" />
                <span className="font-bold text-white/60">{item.popularity.toLocaleString()}</span>
              </div>
            )}
            {item.favorites != null && (
              <div className="flex items-center gap-1.5">
                <Eye size={16} className="text-white/40" />
                <span className="font-bold text-white/60">{item.favorites.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-6">
            {item.externalUrl && (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 h-12 bg-lemon-muted text-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ExternalLink size={16} /> View on AniList
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="px-4 md:px-8 pb-16 space-y-8">
        {/* Description */}
        {item.description && (
          <section>
            <h2 className="font-display font-black text-xl mb-3 text-white">Synopsis</h2>
            <p className="text-white/60 leading-relaxed max-w-3xl">
              {item.description.replace(/<[^>]*>/g, '')}
            </p>
          </section>
        )}

        {/* Genres */}
        {item.genres?.length > 0 && (
          <section>
            <h2 className="font-display font-black text-xl mb-3 text-white">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {item.genres.map((g: string) => (
                <span key={g} className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 text-white/60 border border-white/10">
                  {g}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <section>
            <h2 className="font-display font-black text-xl mb-3 text-white">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((t: string) => (
                <span key={t} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10">
                  <Tag size={10} /> {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Details grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {item.countryOfOrigin && (
            <div className="bg-ink-deep border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Origin</p>
              <p className="font-bold text-white">{item.countryOfOrigin}</p>
            </div>
          )}
          {item.source && (
            <div className="bg-ink-deep border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Source</p>
              <p className="font-bold text-white">{formatLabel(item.source)}</p>
            </div>
          )}
          {item.startDate && (
            <div className="bg-ink-deep border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Start Date</p>
              <p className="font-bold text-white">{item.startDate}</p>
            </div>
          )}
          {item.endDate && (
            <div className="bg-ink-deep border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">End Date</p>
              <p className="font-bold text-white">{item.endDate}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
