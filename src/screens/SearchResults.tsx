import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_STORIES } from '../data/mock';
import { StoryCard } from '../components/ui/Cards';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeSort, setActiveSort] = useState('Trending');

  const sorts = ['Trending', 'Newest', 'Most Read', 'Highest Rated'];

  const filtered = MOCK_STORIES.filter(s => 
    !query || s.title.toLowerCase().includes(query.toLowerCase()) || 
    s.creator.name.toLowerCase().includes(query.toLowerCase())
  );

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
          placeholder="Search..."
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

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {filtered.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
