import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ChevronRight, Play, Search } from "lucide-react";
import { StoryCard, FormatBadge, GenreBadge } from "../components/ui/Cards";
import { Button } from "../components/ui/Button";
import { useStories, useTrendingStories } from "../hooks/useConvex";
import { useApp } from "../contexts/AppContext";

export default function Home() {
  const { user } = useApp();
  const stories = useStories();
  const trendingStories = useTrendingStories();

  const allStories = useMemo(() => stories || [], [stories]);
  const featured = allStories[0];

  const sections = useMemo(() => {
    const trending =
      trendingStories?.length > 0
        ? trendingStories.slice(0, 6)
        : allStories.slice(1, 7);

    return [
      { title: "Trending Now", stories: trending },
      {
        title: "Lemonade Originals",
        stories: allStories.filter((story) => story.isOriginal),
      },
      {
        title: "African Fantasy",
        stories: allStories.filter(
          (story) => story.genre === "African Fantasy",
        ),
      },
      {
        title: "Sci-Fi & Cyberpunk",
        stories: allStories.filter(
          (story) => story.genre === "Sci-Fi & Cyberpunk",
        ),
      },
    ].filter((section) => section.stories.length > 0);
  }, [allStories, trendingStories]);

  const continueReadingStory = useMemo(() => {
    if (
      !user ||
      user.isGuest ||
      !user.readingHistory ||
      user.readingHistory.length === 0
    ) {
      return null;
    }

    const latest = [...user.readingHistory].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0];

    return allStories.find((story) => story.id === latest.storyId) || null;
  }, [user, allStories]);

  if (!featured) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-black mb-3">
          No published stories yet
        </h1>
        <p className="max-w-sm text-sm text-white/50 font-bold">
          Stories published from Creator Studio will appear here when Convex is
          connected.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full overflow-x-hidden bg-[#0A0A0A] pb-8">
      <section className="relative min-h-[66svh] max-h-[75svh] md:min-h-[72vh] overflow-hidden">
        <img
          src={featured.bannerImage}
          alt={featured.title}
          className="absolute inset-0 h-full w-full object-cover object-center md:object-[center_35%]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/88 via-[#0A0A0A]/28 to-transparent hidden sm:block" />

        <div className="relative z-10 flex min-h-[66svh] max-h-[75svh] flex-col justify-end px-4 pb-5 pt-8 md:min-h-[72vh] md:px-8 md:pb-10">
          <div className="max-w-xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <FormatBadge format={featured.format} />
              <GenreBadge genre={featured.genre} />
            </div>
            <h1 className="font-display text-[34px] leading-[0.95] sm:text-5xl md:text-6xl font-black text-white max-w-[13ch]">
              {featured.title}
            </h1>
            <p className="mt-3 line-clamp-3 max-w-md text-sm leading-6 text-white/72 md:text-base">
              {featured.synopsis}
            </p>
            <div className="mt-4 flex items-center gap-2.5">
              <Link to={`/story/${featured.id}`}>
                <Button size="md" className="gap-2 px-5">
                  <Play size={15} fill="currentColor" />
                  Read
                </Button>
              </Link>
              <Button
                size="md"
                variant="glass"
                className="gap-2 px-4 bg-[#171717]/80"
              >
                <Bookmark size={15} />
                Save
              </Button>
              <Link
                to="/explore"
                className="ml-auto h-10 w-10 rounded-full bg-[#171717]/90 border border-white/10 flex items-center justify-center text-white/75 sm:hidden"
                aria-label="Search stories"
              >
                <Search size={18} />
              </Link>
            </div>
            {/* Rewards (streak & spin) moved to /rewards page */}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-8 pt-5">
        {continueReadingStory && (
          <section className="px-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-black">
                Continue Reading
              </h2>
              <ChevronRight size={18} className="text-white/35" />
            </div>
            <Link
              to={`/story/${continueReadingStory.id}`}
              className="group flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-[#171717] p-3 shadow-lg shadow-black/20"
            >
              <div className="h-[76px] w-[58px] shrink-0 overflow-hidden rounded-xl bg-[#111111]">
                <img
                  src={continueReadingStory.coverImage}
                  alt={continueReadingStory.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-lemon-muted">
                    {user?.readingHistory
                      ?.find((item) => item.storyId === continueReadingStory.id)
                      ?.chapterId?.split("-")
                      ?.pop()
                      ?.toUpperCase() || "Chapter 1"}
                  </span>
                  <span className="shrink-0 text-[11px] font-bold text-white/42">
                    Keep reading
                  </span>
                </div>
                <h3 className="truncate font-display text-base font-bold">
                  {continueReadingStory.title}
                </h3>
                <p className="mt-0.5 truncate text-xs text-white/45">
                  {continueReadingStory.creator.name}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/70">
                  <div className="h-full w-[34%] rounded-full bg-lemon-muted" />
                </div>
              </div>
            </Link>
          </section>
        )}

        {sections.map((section) => (
          <section key={section.title} className="px-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-black leading-none">
                {section.title}
              </h2>
              <button className="shrink-0 text-[11px] font-black uppercase tracking-wider text-lemon-muted/85">
                See all
              </button>
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 hide-scrollbar">
              {section.stories.map((story) => (
                <div
                  key={story.id}
                  className="w-[132px] shrink-0 snap-start sm:w-[170px] md:w-[190px]"
                >
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
