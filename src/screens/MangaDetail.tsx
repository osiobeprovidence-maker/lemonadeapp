import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Eye, ExternalLink, BookOpen, Calendar, Globe, User, Loader2, Tag, Clock, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';

type MangaDoc = Doc<"manga">;

export default function MangaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [manga, setManga] = useState<MangaDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<any[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  useEffect(() => {
    if (!slug || !convex) return;
    setLoading(true);
    convex.query(api.manga.getBySlug, { slug })
      .then((item) => {
        setManga(item?.status === "published" ? item : null);
        if (item?.status === "published") {
          setChaptersLoading(true);
          convex.query(api.mangaChapters.listByMangaId, { mangaId: item._id })
            .then(setChapters)
            .catch(() => {})
            .finally(() => setChaptersLoading(false));
        }
      })
      .catch(() => setManga(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p className="text-white/40 font-bold text-lg">Manga not found</p>
        <Link to="/manga/library" className="text-lemon-muted text-sm hover:underline">Browse Manga Library</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-72 overflow-hidden">
        {manga.bannerImage ? (
          <img src={manga.bannerImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-ink-deep to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <Link to="/manga/library" className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-8 -mt-24 relative z-10 pb-8">
        {/* Cover */}
        <div className="shrink-0 w-40 md:w-56">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#171717] shadow-2xl shadow-black/50 border border-white/10">
            <img src={manga.coverImage || 'https://placehold.co/300x400?text=No+Cover'} alt={manga.title}
              className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-16 lg:pt-0 lg:self-end">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-lemon-muted/10 text-lemon-muted border border-lemon-muted/20">{manga.source}</span>
            {manga.chapters != null && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">
                <BookOpen size={10} /> {manga.chapters} {manga.chapters === 1 ? 'chapter' : 'chapters'}
              </span>
            )}
            {manga.volumes != null && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">
                {manga.volumes} {manga.volumes === 1 ? 'volume' : 'volumes'}
              </span>
            )}
          </div>

          <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl leading-tight text-white">{manga.title}</h1>
          {manga.alternativeTitle && (
            <p className="text-lg text-white/40 font-medium mt-1">{manga.alternativeTitle}</p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm text-white/50 flex-wrap">
            {manga.author && <span className="flex items-center gap-1.5"><User size={14} /> {manga.author}</span>}
            {manga.artist && manga.artist !== manga.author && <span className="flex items-center gap-1.5"><Eye size={14} /> {manga.artist}</span>}
            {manga.releaseYear && <span className="flex items-center gap-1.5"><Calendar size={14} /> {manga.releaseYear}</span>}
            {manga.countryOfOrigin && <span className="flex items-center gap-1.5"><Globe size={14} /> {manga.countryOfOrigin}</span>}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            {manga.rating != null && (
              <div className="flex items-center gap-1.5">
                <Star size={18} className="text-yellow-400" fill="currentColor" />
                <span className="font-black text-xl text-yellow-400">{manga.rating.toFixed(1)}</span>
              </div>
            )}
            {manga.popularityScore != null && (
              <div className="flex items-center gap-1.5">
                <Heart size={16} className="text-white/40" />
                <span className="font-bold text-white/60">{manga.popularityScore.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Read button */}
          {chapters.length > 0 && (
            <Link
              to={`/manga/${manga.slug}/chapter/${chapters[0].chapterNumber}`}
              className="inline-flex items-center gap-2 px-6 h-12 bg-lemon-muted text-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            >
              <BookOpen size={16} /> Start Reading
            </Link>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 pb-16 space-y-8">
        {/* Synopsis */}
        {manga.synopsis && (
          <section>
            <h2 className="font-display font-black text-xl mb-3 text-white">Synopsis</h2>
            <p className="text-white/60 leading-relaxed max-w-3xl">{manga.synopsis}</p>
          </section>
        )}

        {/* Genres */}
        {manga.genres.length > 0 && (
          <section>
            <h2 className="font-display font-black text-xl mb-3 text-white">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {manga.genres.map((g) => (
                <Link key={g} to={`/manga/library?genre=${g}`}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                >{g}</Link>
              ))}
            </div>
          </section>
        )}

        {/* Themes */}
        {manga.themes.length > 0 && (
          <section>
            <h2 className="font-display font-black text-xl mb-3 text-white">Themes</h2>
            <div className="flex flex-wrap gap-2">
              {manga.themes.map((t) => (
                <span key={t} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10">
                  <Tag size={10} /> {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Details Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {manga.language && (
            <div className="bg-ink-deep border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Language</p>
              <p className="font-bold text-white">{manga.language}</p>
            </div>
          )}
          {manga.countryOfOrigin && (
            <div className="bg-ink-deep border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Origin</p>
              <p className="font-bold text-white">{manga.countryOfOrigin}</p>
            </div>
          )}
          {manga.releaseYear && (
            <div className="bg-ink-deep border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Release Year</p>
              <p className="font-bold text-white">{manga.releaseYear}</p>
            </div>
          )}
          {manga.chapters != null && (
            <div className="bg-ink-deep border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Chapters</p>
              <p className="font-bold text-white">{manga.chapters}</p>
            </div>
          )}
        </section>

        {/* Chapters */}
        <section>
          <h2 className="font-display font-black text-xl mb-4 text-white flex items-center gap-2">
            <BookOpen size={20} /> Chapters
            {chaptersLoading && <Loader2 size={14} className="animate-spin text-white/30" />}
            {!chaptersLoading && chapters.length > 0 && (
              <span className="text-sm font-bold text-white/30">({chapters.length})</span>
            )}
          </h2>
          {chapters.length === 0 ? (
            <p className="text-white/30 text-sm">No chapters available yet.</p>
          ) : (
            <div className="grid gap-2 max-w-2xl">
              {chapters.map((ch) => (
                <Link
                  key={ch._id}
                  to={`/manga/${manga.slug}/chapter/${ch.chapterNumber}`}
                  className="flex items-center justify-between p-4 bg-ink-deep border border-white/5 rounded-xl hover:border-white/10 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-lemon-muted/10 group-hover:text-lemon-muted transition-all">
                      <BookOpen size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Chapter {ch.chapterNumber}</p>
                      {ch.title && <p className="text-xs text-white/40">{ch.title}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{ch.pages?.length || 0} pages</span>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
