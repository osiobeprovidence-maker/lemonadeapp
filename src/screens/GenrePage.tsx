import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StoryCard } from '../components/ui/Cards';
import { useApp } from '../contexts/AppContext';
import { ALL_GENRES } from '../data/types';

export default function GenrePage() {
  const { genre } = useParams<{ genre: string }>();
  const { stories } = useApp();

  const genreName = genre ? decodeURIComponent(genre) : '';

  const genreStories = useMemo(() => {
    return stories.filter(s =>
      s.genre === genreName ||
      (s.genres && s.genres.includes(genreName)) ||
      (s.tags && s.tags.includes(genreName))
    ).sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [stories, genreName]);

  const topStories = genreStories.slice(0, 10);
  const allStories = genreStories;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 md:px-8">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} />
          Back to Explore
        </Link>
        <h1 className="font-display font-black text-4xl md:text-5xl mb-2">{genreName}</h1>
        <p className="text-white/40 text-sm">
          {allStories.length} {allStories.length === 1 ? 'title' : 'titles'} in this genre
        </p>
      </div>

      {/* Top Stories */}
      {topStories.length > 0 && (
        <section className="px-4 mb-8 md:px-8">
          <h2 className="font-display font-black text-xl mb-4">Top {genreName} Titles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {topStories.slice(0, 5).map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* All Stories */}
      <section className="px-4 pb-12 md:px-8">
        <h2 className="font-display font-black text-xl mb-4">All {genreName}</h2>
        {allStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {allStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-white/40">
            No stories found in this genre yet.
          </div>
        )}
      </section>
    </div>
  );
}
