import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Maximize, Minimize } from 'lucide-react';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

export default function MangaReader() {
  const { slug, chapterNumber } = useParams<{ slug: string; chapterNumber: string }>();
  const [manga, setManga] = useState<any>(null);
  const [chapter, setChapter] = useState<any>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function loadPages(ch: any) {
    if (!ch?.externalId) return;
    setPagesLoading(true);
    try {
      const result = await convex.action(api.mangaChapters.getChapterPages, { externalId: ch.externalId, chapterId: ch._id });
      setPages(result.pages || []);
    } catch { setPages([]); }
    finally { setPagesLoading(false); }
  }

  useEffect(() => {
    if (!slug || !chapterNumber || !convex) return;
    setLoading(true);
    const chNum = parseFloat(chapterNumber);
    if (isNaN(chNum)) return;

    convex.query(api.manga.getBySlug, { slug })
      .then((item) => {
        if (!item || item.status !== "published") { setManga(null); return; }
        setManga(item);
        return convex.query(api.mangaChapters.listByMangaId, { mangaId: item._id });
      })
      .then((chs) => {
        if (!chs) return;
        setAllChapters(chs);
        const found = chs.find((c: any) => c.chapterNumber === chNum);
        const ch = found || chs[0] || null;
        setChapter(ch);
        setCurrentIndex(chs.findIndex((c: any) => c._id === ch?._id));
        if (ch) loadPages(ch);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, chapterNumber]);

  const goToChapter = useCallback((dir: number) => {
    const next = currentIndex + dir;
    if (next < 0 || next >= allChapters.length) return;
    const nextCh = allChapters[next];
    window.history.pushState({}, '', `/manga/${slug}/chapter/${nextCh.chapterNumber}`);
    setChapter(nextCh);
    setCurrentIndex(next);
    loadPages(nextCh);
  }, [currentIndex, allChapters, slug]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToChapter(-1);
      if (e.key === 'ArrowRight') goToChapter(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goToChapter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!manga || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 bg-black">
        <p className="text-white/40 font-bold">Chapter not found</p>
        <Link to={`/manga/${slug}`} className="text-lemon-muted text-sm hover:underline">Back to manga</Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col bg-black min-h-screen ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex items-center justify-between px-4 h-14 bg-[#0a0a0a] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <Link to={`/manga/${slug}`} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-xs font-bold text-white truncate max-w-[200px] md:max-w-[400px]">{manga.title}</p>
            <p className="text-[10px] text-white/40">Ch. {chapter.chapterNumber}{chapter.title ? ` — ${chapter.title}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{currentIndex + 1}/{allChapters.length}</span>
          <button onClick={() => setFullscreen(!fullscreen)} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
            {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {pagesLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
          ) : pages.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-white/30 font-bold">No pages available</div>
          ) : (
            pages.map((url: string, i: number) => (
              <div key={i} className="flex flex-col">
                {i > 0 && <div className="h-px bg-white/5" />}
                <img src={url} alt={`Page ${i + 1}`} className="w-full h-auto" loading="lazy" referrerPolicy="no-referrer" crossOrigin="anonymous" />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 h-16 bg-[#0a0a0a] border-t border-white/5 shrink-0">
        <button onClick={() => goToChapter(-1)} disabled={currentIndex <= 0}
          className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 text-white/70 font-bold text-xs hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Ch. {chapter.chapterNumber}</span>
        <button onClick={() => goToChapter(1)} disabled={currentIndex >= allChapters.length - 1}
          className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 text-white/70 font-bold text-xs hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}