import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Coffee, Eye, Heart, Lock, MessageCircle, Play, Send, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FormatBadge, GenreBadge, LockedContentCTA, SupportStatusBadge } from '../components/ui/Cards';
import { FollowButton, SupportButton } from '../components/InteractionButtons';
import { SensitiveActionWrapper } from '../components/SensitiveActionWrapper';
import { cn } from '../lib/utils';
import { useCurrentUser, useIncrementStoryView, useSaveStory, useStoryById, useUnlockChapter } from '../hooks/useConvex';

type ChapterItem = {
  chapterId: string;
  index: number;
  title: string;
  isPaid: boolean;
  price: number;
};

type StoryComment = {
  author?: string;
  avatar?: string;
  message: string;
  time?: string;
  likes?: number;
};

const tabLabels = ['chapters', 'about', 'comments'] as const;

export default function StoryDetail() {
  const { id } = useParams();
  const { user, firebaseUid } = useCurrentUser();
  const story = useStoryById(id ?? '');
  const unlockChapter = useUnlockChapter();
  const saveMutations = useSaveStory();
  const incrementStoryView = useIncrementStoryView();
  const navigate = useNavigate();
  const [hasIncremented, setHasIncremented] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabLabels)[number]>('chapters');
  const [commentDraft, setCommentDraft] = useState('');
  const [localComments, setLocalComments] = useState<StoryComment[]>([]);

  const chapters = useMemo<ChapterItem[]>(() => {
    if (!story) return [];
    const chaptersFromMedia = story.media?.chapters;

    if (Array.isArray(chaptersFromMedia) && chaptersFromMedia.length > 0) {
      return chaptersFromMedia.map((chapter: any, index: number) => {
        const isPaid = chapter.monetization === 'paid' || (story.media?.monetization === 'paid' && (chapter.price ?? story.media?.price));
        return {
          chapterId: `c${index + 1}`,
          index,
          title: chapter.title || `Chapter ${index + 1}`,
          isPaid,
          price: chapter.price || story.media?.price || (isPaid ? 5 : 0),
        };
      });
    }

    const count = story.episodes || (story.media?.chapterText || story.media?.attachments?.length ? 1 : 0);
    return Array.from({ length: Math.max(1, count) }, (_, index) => {
      const isPaid = story.media?.monetization === 'paid' && (story.media?.paidAfter ?? -1) <= index;
      return {
        chapterId: `c${index + 1}`,
        index,
        title: story.media?.chapterTitles?.[index] || `Chapter ${index + 1}`,
        isPaid,
        price: story.media?.price || (isPaid ? 5 : 0),
      };
    });
  }, [story]);

  useEffect(() => {
    setLocalComments(Array.isArray((story as any)?.comments) ? (story as any).comments : []);
    setCommentDraft('');
    setActiveTab('chapters');
    setHasIncremented(false);
  }, [story?.id]);

  useEffect(() => {
    if (!story || hasIncremented) return;
    try {
      void incrementStoryView(story.id);
      setHasIncremented(true);
    } catch (err) {
      // ignore errors silently
    }
  }, [story, hasIncremented, incrementStoryView]);

  if (!story) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
        <main className="mx-auto flex w-full max-w-[430px] flex-col items-center px-4 pb-[calc(28px+env(safe-area-inset-bottom))] pt-8">
          <div className="h-[224px] w-[168px] animate-pulse rounded-[20px] bg-[#141414] shadow-[0_18px_55px_rgba(232,197,71,0.10)]" />
          <div className="mt-5 flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-[#1A1A1A]" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-[#1A1A1A]" />
          </div>
          <div className="mt-4 h-8 w-56 animate-pulse rounded-xl bg-[#141414]" />
          <div className="mt-6 grid w-full grid-cols-2 gap-1 rounded-3xl border border-white/8 bg-[#141414] p-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-2xl bg-[#1A1A1A]" />
            ))}
          </div>
          <div className="mt-5 h-11 w-full max-w-[320px] animate-pulse rounded-2xl bg-lemon-muted/30" />
          <p className="mt-5 max-w-xs text-center text-sm font-semibold text-white/45">Loading story details...</p>
        </main>
      </div>
    );
  }

  const isSaved = !!(user?.savedStories || []).includes(story.id);

  const toggleSave = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) return;

    if (isSaved) {
      saveMutations.unsave(user.id, story.id);
    } else {
      saveMutations.save(user.id, story.id);
    }
  };

  const handleUnlock = async (event: React.MouseEvent, chapterId: string, price: number) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.walletBalance < price) {
      if (confirm(`Insufficient coins. You need ${price} coins to unlock this chapter. Go to wallet?`)) {
        navigate('/wallet');
      }
      return;
    }

    try {
      await unlockChapter({
        firebaseUid: firebaseUid || user.id,
        storyId: story.id,
        chapterId,
        price,
      });
      alert('Chapter unlocked successfully!');
    } catch (err) {
      console.error('Failed to unlock chapter', err);
      alert('Failed to unlock chapter. Please try again.');
    }
  };

  const submitComment = (event: React.FormEvent) => {
    event.preventDefault();
    const message = commentDraft.trim();
    if (!message) return;

    setLocalComments((comments) => [
      {
        author: user?.name || 'Guest Reader',
        avatar: user?.avatar,
        message,
        time: 'Just now',
        likes: 0,
      },
      ...comments,
    ]);
    setCommentDraft('');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
      <main className="mx-auto flex w-full max-w-[430px] flex-col px-4 pb-[calc(28px+env(safe-area-inset-bottom))] pt-5 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
        <section className="flex flex-col items-center">
          <div className="relative w-[168px] overflow-hidden rounded-[20px] bg-[#141414] shadow-[0_18px_55px_rgba(232,197,71,0.16)] ring-1 ring-white/10 sm:w-[210px]">
            <img src={story.coverImage} alt={story.title} className="aspect-[3/4] w-full object-cover" referrerPolicy="no-referrer" />
          </div>

          <div className="mt-5 flex max-w-full flex-wrap justify-center gap-2">
            <FormatBadge format={story.format} className="bg-[#1A1A1A] text-white ring-1 ring-white/10" />
            <GenreBadge genre={story.genre} className="ring-1 ring-white/10" />
          </div>

          <h1 className="mt-3 max-w-[340px] text-center font-display text-[30px] font-black leading-[1.02] tracking-tight sm:max-w-xl sm:text-5xl">
            {story.title}
          </h1>

          <Link to={`/creator/${story.creator.username}`} className="mt-2 flex items-center gap-2 text-xs font-semibold text-white/55 hover:text-lemon-muted">
            <img src={story.creator.avatar} alt={story.creator.name} className="h-5 w-5 rounded-full object-cover" referrerPolicy="no-referrer" />
            {story.creator.name}
          </Link>
        </section>

        <section className="mt-6 rounded-3xl border border-white/8 bg-[#141414] p-2 shadow-xl shadow-black/20">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:divide-x sm:divide-white/8">
            <Stat icon={<Star size={13} className="text-lemon-muted" />} label="Rating" value={String(story.rating)} />
            <Stat icon={<Eye size={13} />} label="Views" value={`${(story.views / 1000).toFixed(0)}k`} />
            <Stat icon={<Heart size={13} />} label="Likes" value={`${(story.saves / 1000).toFixed(0)}k`} />
            <Stat label="Chapters" value={String(story.episodes || chapters.length)} />
          </div>
        </section>

        <section className="mt-5 flex flex-col items-center gap-3">
          <Link to={`/read/${story.id}/1`} className="w-full max-w-[320px]">
            <Button size="md" className="h-11 w-full gap-2 rounded-2xl px-5 text-[13px] font-black shadow-lg shadow-lemon-muted/10">
              <Play size={15} fill="currentColor" />
              Read Chapter 1
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2">
            <SensitiveActionWrapper intent="save story" payload={{ storyId: story.id }} onClick={toggleSave}>
              <Button size="sm" variant={isSaved ? 'primary' : 'glass'} className="gap-1.5 rounded-xl border-white/10 bg-[#1A1A1A] px-4">
                {isSaved ? <Check size={14} /> : <Heart size={14} />}
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </SensitiveActionWrapper>
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/10 bg-[#1A1A1A] px-4 text-[11px] font-bold text-white/75"
            >
              <MessageCircle size={14} />
              Comments
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/8 bg-[#141414] p-4 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img src={story.creator.avatar} alt={story.creator.name} className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/10" referrerPolicy="no-referrer" />
              {story.creator.supportEnabled && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-lemon-muted p-1 text-black">
                  <Coffee size={11} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate font-display text-base font-black">{story.creator.name}</h2>
                {user?.supportHistory.some((item) => item.creatorId === story.creator.username) && <SupportStatusBadge status="supported" />}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/48">{story.creator.bio}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <FollowButton creator={story.creator} size="sm" className="w-full rounded-xl" />
            <SupportButton creator={story.creator} size="sm" className="w-full rounded-xl" />
            <Link to={`/creator/${story.creator.username}/portfolio`} className="col-span-2">
              <Button variant="glass" size="sm" className="w-full gap-1.5 rounded-xl bg-[#1A1A1A]">
                View portfolio <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <div className="grid grid-cols-3 rounded-2xl bg-[#141414] p-1 ring-1 ring-white/8">
            {tabLabels.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'relative rounded-xl px-2 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors',
                  activeTab === tab ? 'text-black' : 'text-white/45 hover:text-white/80',
                )}
              >
                {activeTab === tab && <motion.span layoutId="detail-tab-pill" className="absolute inset-0 rounded-xl bg-lemon-muted" />}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === 'chapters' && (
              <div className="flex flex-col gap-3">
                {story.media?.monetization === 'paid' && <LockedContentCTA price={story.media?.price || 10} />}
                {chapters.map((chapter) => {
                  const isUnlocked = !chapter.isPaid || user?.unlockedChapters.includes(`${story.id}-${chapter.chapterId}`) || user?.isPremium;

                  return (
                    <Link
                      key={chapter.chapterId}
                      to={isUnlocked ? `/read/${story.id}/${chapter.index + 1}` : '#'}
                      className="rounded-2xl border border-white/8 bg-[#141414] p-3 transition-colors hover:border-lemon-muted/25"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1A1A1A] text-white/70">
                          {isUnlocked ? <Play size={14} className="fill-white text-white" /> : <Lock size={14} className="text-lemon-muted" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-bold">{chapter.title}</h3>
                            {chapter.isPaid && <span className="shrink-0 rounded bg-lemon-muted/12 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-lemon-muted">Paid</span>}
                          </div>
                          <p className="mt-1 text-[11px] font-semibold text-white/42">
                            {story.format === 'Novel' ? 'Novel / approx. read time' : 'Comic / panels'} / {story.episodes || chapters.length} chapters
                          </p>
                        </div>
                        {!isUnlocked ? (
                          <SensitiveActionWrapper intent="unlock chapter">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-lemon-muted/30 px-3 text-lemon-muted hover:bg-lemon-muted hover:text-black"
                              onClick={(event) => handleUnlock(event, chapter.chapterId, chapter.price)}
                            >
                              {chapter.price}C
                            </Button>
                          </SensitiveActionWrapper>
                        ) : (
                          <Button size="sm" variant={chapter.index === 0 ? 'primary' : 'glass'} className="rounded-xl px-3">
                            Read
                          </Button>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="rounded-3xl border border-white/8 bg-[#141414] p-5">
                <p className="text-sm font-medium leading-7 text-white/76">{story.synopsis}</p>
                <div className="mt-5">
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/35">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#1A1A1A] px-3 py-1 text-xs font-semibold text-white/62">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="flex flex-col gap-4">
                <form onSubmit={submitComment} className="flex items-center gap-2 rounded-2xl border border-white/8 bg-[#141414] p-2">
                  <input
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    type="text"
                    placeholder="Add a comment..."
                    className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-white outline-none placeholder:text-white/28"
                  />
                  <button
                    type="submit"
                    disabled={!commentDraft.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lemon-muted text-black disabled:opacity-40"
                    aria-label="Post comment"
                  >
                    <Send size={15} />
                  </button>
                </form>

                {localComments.length > 0 ? (
                  localComments.map((comment, index) => (
                    <div key={`${comment.time}-${index}`} className="flex gap-3 rounded-2xl bg-[#141414] p-3">
                      <img src={comment.avatar || `https://picsum.photos/seed/comment-${index}/100`} className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">{comment.author || 'Anonymous'}</span>
                          <span className="shrink-0 text-[11px] text-white/35">{comment.time || 'Just now'}</span>
                        </div>
                        <p className="text-sm leading-5 text-white/72">{comment.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-white/8 bg-[#141414] p-6 text-center">
                    <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-white/35">No comments yet</p>
                    <p className="text-sm text-white/58">Be the first to leave feedback on this story.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 px-1.5 py-2 text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-white/55">{icon}</div>
      <div className="text-xs font-black text-white">{value}</div>
      <div className="mt-0.5 text-[8px] font-black uppercase tracking-wide text-white/32">{label}</div>
    </div>
  );
}
