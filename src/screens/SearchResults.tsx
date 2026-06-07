import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Search, BookOpen, ArrowUp, CheckCircle2, Sparkles, TrendingUp, Plus, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { StoryCard } from '../components/ui/Cards';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AppContext';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

const CONTENT_TYPES = ['manga', 'manhwa', 'webtoon', 'novel', 'comic', 'other'] as const;

function RequestContentModal({ query, onClose }: { query: string; onClose: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(query);
  const [type, setType] = useState<typeof CONTENT_TYPES[number]>('manga');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user?.id || user.isGuest) {
      setError('Please sign in to request content.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await convex.mutation(api.contentRequests.createRequest, {
        userId: user.id,
        title: title.trim(),
        type,
        description: description.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {submitted ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 size={64} className="mx-auto text-lemon-muted mb-4" />
              </motion.div>
              <h3 className="font-display font-black text-2xl mb-2">Request Submitted!</h3>
              <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">
                We'll review your request and notify you when it's available. Popular requests get priority!
              </p>
              <Button onClick={onClose}>Done</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-black text-xl">Request Content</h3>
                  <p className="text-white/40 text-xs mt-1">Can't find what you're looking for? Request it!</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-200 font-bold">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Solo Leveling, One Piece..."
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-medium focus:outline-none focus:border-lemon-muted transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2 block">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                          type === t
                            ? 'bg-lemon-muted text-black'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Why do you want this? Any details that help us find it..."
                    className="w-full h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-lemon-muted transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <button onClick={onClose} className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function EmptyState({ query, onRequestOpen }: { query: string; onRequestOpen: () => void }) {
  const suggestions = useMemo(() => [
    { icon: <TrendingUp size={16} />, text: 'Try broader keywords' },
    { icon: <Search size={16} />, text: 'Check the spelling' },
    { icon: <BookOpen size={16} />, text: 'Browse by genre in Explore' },
  ], []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <Search size={40} className="text-white/20" />
      </div>
      
      <h2 className="font-display font-black text-2xl md:text-3xl mb-2 text-center">
        No results found
      </h2>
      <p className="text-white/40 text-sm md:text-base text-center max-w-md mb-8">
        {query
          ? `We couldn't find anything matching "${query}". Try different keywords or request the content you're looking for.`
          : 'No stories available yet. Check back soon!'}
      </p>

      {query && (
        <div className="w-full max-w-sm mb-8">
          <div className="grid gap-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-lemon-muted">{s.icon}</span>
                <span className="text-sm text-white/60 font-medium">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onRequestOpen}
        className="group flex items-center gap-2 px-6 py-3.5 bg-lemon-muted text-black rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-lemon-muted/20"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
        Request {query ? 'This Content' : 'Content'}
      </button>
    </motion.div>
  );
}

export default function SearchResults() {
  const { stories } = useApp();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeSort, setActiveSort] = useState('Trending');
  const [requestOpen, setRequestOpen] = useState(false);

  const sorts = ['Trending', 'Newest', 'Most Read', 'Highest Rated'];

  const filtered = useMemo(() => {
    const results = stories.filter(s => 
      !query || s.title.toLowerCase().includes(query.toLowerCase()) || 
      s.creator.name.toLowerCase().includes(query.toLowerCase()) ||
      s.genre.toLowerCase().includes(query.toLowerCase())
    );

    switch (activeSort) {
      case 'Newest':
        return [...results].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'Most Read':
        return [...results].sort((a, b) => (b.reads || 0) - (a.reads || 0));
      case 'Highest Rated':
        return [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return results;
    }
  }, [stories, query, activeSort]);

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12">
      <div className="relative mb-8 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-white/40" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search manga, webtoons, novels..."
          className="w-full h-14 bg-ink-deep border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-lemon-muted transition-colors font-medium text-lg"
        />
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold">
          {query ? `Results for "${query}"` : 'All Stories'} <span className="text-white/40 text-lg">({filtered.length})</span>
        </h2>
        
        <div className="flex gap-2 bg-ink-deep/50 p-1 rounded-xl border border-white/5">
           {sorts.map(sort => (
             <button
               key={sort}
               onClick={() => setActiveSort(sort)}
               className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeSort === sort ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
             >
               {sort}
             </button>
           ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {filtered.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <EmptyState query={query} onRequestOpen={() => setRequestOpen(true)} />
      )}

      {requestOpen && (
        <RequestContentModal query={query} onClose={() => setRequestOpen(false)} />
      )}
    </div>
  );
}
