import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, ChevronRight, Play, Search, Flame, Clock, Star, BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { StoryCard, FormatBadge, GenreBadge } from "../components/ui/Cards";
import { Button } from "../components/ui/Button";
import SegmentedSwitch from "../components/ui/SegmentedSwitch";
import { useStories, useTrendingStories } from "../hooks/useConvex";
import { useApp } from "../contexts/AppContext";
import { ALL_CONTENT_TYPES } from "../data/types";
import type { ContentCategory } from "../data/types";

const SWITCH_OPTIONS = [
  { value: "global" as ContentCategory, label: "Global" },
  { value: "original" as ContentCategory, label: "Originals" },
];

export default function Home() {
  const { user, contentCategory, setContentCategory } = useApp();
  const stories = useStories();
  const trendingStories = useTrendingStories();
  const navigate = useNavigate();

  const allStories = useMemo(() => stories || [], [stories]);

  const filteredStories = useMemo(() => {
    if (contentCategory === "original") {
      return allStories.filter((s) => s.contentCategory === "original");
    }
    return allStories;
  }, [allStories, contentCategory]);

  const featured = filteredStories[0] || (!contentCategory || contentCategory === "global" ? allStories[0] : null);

  const sections = useMemo(() => {
    const trending =
      trendingStories?.length > 0
        ? trendingStories.slice(0, 10)
        : [...filteredStories].sort((a, b) => (b.weeklyViews || b.views || 0) - (a.weeklyViews || a.views || 0)).slice(0, 10);

    const newReleases = [...filteredStories]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);

    const popularThisWeek = [...filteredStories]
      .sort((a, b) => (b.weeklyViews || 0) - (a.weeklyViews || 0))
      .slice(0, 10);

    const recentlyUpdated = [...filteredStories]
      .sort((a, b) => {
        const aDate = new Date(a.lastChapterAt || a.updatedAt || 0).getTime();
        const bDate = new Date(b.lastChapterAt || b.updatedAt || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 10);

    const topWebtoons = filteredStories
      .filter((s) => s.contentType === "Webtoon" || s.format === "Webtoon")
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    const topNovels = filteredStories
      .filter((s) => s.contentType === "Novel" || s.contentType === "Light Novel" || s.format === "Novel" || s.format === "Light Novel")
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    const topManga = filteredStories
      .filter((s) => s.contentType === "Manga" || s.format === "Manga")
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    return [
      { title: "Trending Now", stories: trending, icon: Flame, link: "/explore?sort=trending" },
      { title: "New Releases", stories: newReleases, icon: Sparkles, link: "/explore?sort=newest" },
      { title: "Popular This Week", stories: popularThisWeek, icon: TrendingUp, link: "/explore?sort=trending" },
      ...(contentCategory !== "original"
        ? [{ title: "OWUUU Originals", stories: filteredStories.filter((s) => s.contentCategory === "original").slice(0, 10), icon: Star as React.ComponentType<{ size?: number }>, link: "" }]
        : []),
      { title: "Top Manga", stories: topManga, icon: BookOpen, link: "/type/manga" },
      { title: "Top Webtoons", stories: topWebtoons, icon: BookOpen, link: "/type/webtoon" },
      { title: "Top Novels", stories: topNovels, icon: BookOpen, link: "/type/novel" },
      { title: "Recently Updated", stories: recentlyUpdated, icon: Clock, link: "/explore?sort=recently_updated" },
    ].filter((section) => section.stories.length > 0);
  }, [filteredStories, trendingStories, contentCategory]);

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

    const story = allStories.find((story) => story.id === latest.storyId);
    if (!story) return null;
    if (contentCategory === "original" && story.contentCategory !== "original") return null;
    return story;
  }, [user, allStories, contentCategory]);

  const hasNoContent = filteredStories.length === 0;

  return (
    <div className="w-full min-h-full overflow-x-hidden bg-[#0A0A0A] pb-8">
      {/* Sticky Segmented Switch */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-lg border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <SegmentedSwitch
            options={SWITCH_OPTIONS}
            value={contentCategory}
            onChange={setContentCategory}
            name="content-category"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={contentCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {hasNoContent ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
              <h2 className="font-display text-xl font-black mb-2">
                {contentCategory === "original"
                  ? "No Originals Yet"
                  : "No stories found"}
              </h2>
              <p className="max-w-sm text-sm text-white/50 font-bold">
                {contentCategory === "original"
                  ? "Original content published exclusively on OWUUU will appear here."
                  : "Check back later for new content."}
              </p>
            </div>
          ) : (
            <>
              {/* Hero Banner */}
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
                      <FormatBadge format={featured.format || featured.contentType || "Manga"} />
                      <GenreBadge genre={featured.genre as any} />
                      {featured.publicationStatus && (
                        <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70 border border-white/10">
                          {featured.publicationStatus}
                        </div>
                      )}
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
                  </div>
                </div>
              </section>

              {/* Content Type Quick Links */}
              <div className="px-4 pt-5 pb-2">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {ALL_CONTENT_TYPES.map((type) => (
                    <Link
                      key={type}
                      to={`/type/${type.toLowerCase().replace(" ", "-")}`}
                      className="shrink-0 px-4 py-2 bg-ink-deep border border-white/10 rounded-full text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {type}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-8 pt-3">
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

                {sections.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <section key={section.title} className="px-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <SectionIcon size={18} className="text-lemon-muted" />
                          <h2 className="font-display text-xl font-black leading-none">
                            {section.title}
                          </h2>
                        </div>
                        {section.link && (
                          <Link
                            to={section.link}
                            className="shrink-0 text-[11px] font-black uppercase tracking-wider text-lemon-muted/85 hover:text-lemon-muted transition-colors"
                          >
                            See all
                          </Link>
                        )}
                      </div>
                      <div className="-mx-4 flex snap-x snap-proximity gap-3 overflow-x-auto px-4 pb-1 hide-scrollbar scroll-smooth" style={{ WebkitOverflowScrolling: 'touch', willChange: 'scroll-position' }}>
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
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
