import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STORIES } from '../data/mock';
import { StoryCard, FormatBadge } from '../components/ui/Cards';
import { Button } from '../components/ui/Button';
import { useStories, useTrendingStories, useCurrentUser } from '../hooks/useConvex';
import { Loader } from 'lucide-react';

export default function Home() {
  const { user } = useCurrentUser();
  const stories = useStories();
  const trendingStories = useTrendingStories();
  const [isLoadingStories, setIsLoadingStories] = useState(false);

  // Use real stories from Convex if available, fallback to mock
  const allStories = stories?.length > 0 ? stories : MOCK_STORIES;
  const featured = allStories[0];
  
  // Organize stories into sections
  const sections = useMemo(() => {
    const trending = trendingStories?.length > 0 ? trendingStories.slice(0, 4) : allStories.slice(1, 5);
    
    return [
      { title: "Trending Now", stories: trending },
      { title: "Lemonade Originals", stories: allStories.filter(s => s.isOriginal) },
      { title: "African Fantasy", stories: allStories.filter(s => s.genre === "African Fantasy") },
      { title: "Sci-Fi & Cyberpunk", stories: allStories.filter(s => s.genre === "Sci-Fi & Cyberpunk") },
    ].filter(section => section.stories.length > 0);
  }, [allStories, trendingStories]);

  if (!featured) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px]">
        <img 
          src={featured.bannerImage} 
          alt={featured.title} 
          className="absolute w-full h-full object-cover" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black-core via-black-core/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black-core/80 via-black-core/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col items-start max-w-3xl">
          <FormatBadge format={featured.format} className="mb-4" />
          <h1 className="font-display font-black text-5xl md:text-7xl mb-2 tracking-tighter leading-none text-white">
            {featured.title}
          </h1>
          <p className="text-white/70 text-sm md:text-base font-medium max-w-lg mb-6 leading-relaxed hidden sm:block">
            {featured.synopsis}
          </p>
          <div className="flex gap-4">
            <Link to={`/story/${featured.id}`}>
               <Button size="lg" className="px-10">Read Now</Button>
            </Link>
            <Button size="lg" variant="glass">Save</Button>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="flex flex-col gap-12 mt-8">
        
        {/* Continue Reading - Custom horizontal scroll item */}
        {allStories.length > 1 && (
          <section className="px-6 md:px-12">
            <h2 className="font-display font-bold text-2xl mb-4">Continue Reading</h2>
            <Link to={`/story/${allStories[1].id}`} className="group flex items-center gap-4 bg-ink-deep p-4 rounded-2xl border border-white/5 hover:border-lemon-muted/30 transition-colors w-full max-w-xl">
               <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-black">
                 <img src={allStories[1].coverImage} alt="Story" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
               </div>
               <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-lemon-muted uppercase tracking-wider">Chapter 1</span>
                    <span className="text-xs text-white/50">0%</span>
                  </div>
                  <h3 className="font-display font-bold text-lg truncate">{allStories[1].title}</h3>
                  <div className="w-full h-1 bg-black rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-lemon-muted w-[0%]" />
                  </div>
               </div>
            </Link>
          </section>
        )}

        {/* Story Sections */}
        {sections.map((section, idx) => (
          <section key={idx} className="pl-6 md:pl-12">
             <div className="flex items-center justify-between pr-6 md:pr-12 mb-4">
               <h2 className="font-display font-bold text-2xl">{section.title}</h2>
               <button className="text-sm font-medium text-white/50 hover:text-white transition-colors">See all</button>
             </div>
             <div className="flex overflow-x-auto gap-4 pb-6 pr-6 md:pr-12 hide-scrollbar snap-x snap-mandatory">
                {section.stories.map(story => (
                  <div key={story.id} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <StoryCard story={story} />
                  </div>
                ))}
             </div>
          </section>
        ))}
      </div>
    </div>
  );
}
                ))}
             </div>
          </section>
        ))}
        
      </div>
    </div>
  );
}
