import React, { useState, useMemo } from 'react';
import { MOCK_STORIES } from '../data/mock';
import { HorizontalStoryCard } from '../components/ui/Cards';
import { cn } from '../lib/utils';
import { Bookmark, Clock, Download, Unlock, Loader } from 'lucide-react';
import { useCurrentUser, useSavedStories } from '../hooks/useConvex';

import { useApp } from '../contexts/AppContext';

export default function Library() {
  const { user, stories } = useApp();
  const savedStories = useSavedStories(user?.id);
  const [activeTab, setActiveTab] = useState<'reading' | 'saved' | 'downloads' | 'unlocked'>('reading');

  const tabs = [
    { id: 'reading', label: 'Continue Reading', icon: Clock },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'unlocked', label: 'Unlocked', icon: Unlock },
  ] as const;

  // Get stories for active tab
  const displayStories = useMemo(() => {
    switch (activeTab) {
      case 'saved':
        return savedStories?.length > 0 ? savedStories : [];
      case 'reading':
        if (!user || user.isGuest) return stories.slice(0, 2);
        // Map reading history to story objects
        return user.readingHistory
          .map(entry => stories.find(s => s.id === entry.storyId))
          .filter((s): s is NonNullable<typeof s> => s !== undefined)
          .slice(0, 10);
      case 'downloads':
        return []; // TODO: Load downloaded stories
      case 'unlocked':
        if (!user || user.isGuest) return [];
        return stories.filter(s => user.unlockedChapters.some(uc => uc.startsWith(s.id)));
      default:
        return [];
    }
  }, [activeTab, savedStories, user, stories]);

  const isLoading = activeTab === 'saved' && savedStories === null;

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12">
      <h1 className="font-display font-black text-4xl mb-8">Library</h1>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap border",
                isActive 
                  ? "bg-white text-black border-white" 
                  : "bg-ink-deep text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center p-8">
            <Loader className="animate-spin" />
          </div>
        ) : displayStories && displayStories.length > 0 ? (
          displayStories.map((story: any) => (
            <HorizontalStoryCard key={story.id} story={story} />
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-white/60">No items to show for this tab.</div>
        )}
      </div>
    </div>
  );
}
