import React, { useState } from 'react';
import { MOCK_STORIES } from '../data/mock';
import { HorizontalStoryCard } from '../components/ui/Cards';
import { cn } from '../lib/utils';
import { Bookmark, Clock, Download, Unlock } from 'lucide-react';

export default function Library() {
  const [activeTab, setActiveTab] = useState<'reading' | 'saved' | 'downloads' | 'unlocked'>('reading');

  const tabs = [
    { id: 'reading', label: 'Continue Reading', icon: Clock },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'unlocked', label: 'Unlocked', icon: Unlock },
  ] as const;

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
        {MOCK_STORIES.slice(0, activeTab === 'reading' ? 2 : activeTab === 'saved' ? 4 : 1).map(story => (
          <HorizontalStoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
