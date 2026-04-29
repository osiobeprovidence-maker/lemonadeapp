import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { MOCK_STORIES, Genre, Format } from '../data/mock';
import { StoryCard } from '../components/ui/Cards';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/AppContext';

export default function Explore() {
  const { stories } = useApp();
  const [activeFormat, setActiveFormat] = useState<Format | 'All'>('All');
  const [activeCategory, setActiveCategory] = useState<Genre | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const formats: (Format | 'All')[] = ['All', 'Manga', 'Manhwa', 'Webcomic', 'Novel'];
  const categories: (Genre | 'All')[] = ['All', 'Action', 'Romance', 'Horror', 'Sci-Fi & Cyberpunk', 'African Fantasy', 'Drama', 'Mystery'];

  const filtered = stories.filter(s => {
    if (activeFormat !== 'All' && s.format !== activeFormat) return false;
    if (activeCategory !== 'All' && s.genre !== activeCategory) return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12">
      <h1 className="font-display font-black text-4xl mb-6">Explore</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-white/40" />
        </div>
        <input 
          type="text" 
          placeholder="Search stories, creators, or genres..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-14 bg-ink-deep border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-lemon-muted transition-colors font-medium"
        />
      </form>

      {/* Format Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
        {formats.map(f => (
          <button 
            key={f}
            onClick={() => setActiveFormat(f)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors",
              activeFormat === f ? "bg-white text-black" : "bg-ink-deep text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {categories.map(c => (
           <button 
            key={c}
            onClick={() => setActiveCategory(c)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors",
              activeCategory === c ? "bg-lemon-muted text-black font-bold" : "border border-white/20 text-white/60 hover:text-white hover:border-white/50"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {filtered.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-white/50">
            No stories found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
