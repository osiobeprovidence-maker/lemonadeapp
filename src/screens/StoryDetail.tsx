import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Coffee, Eye, Heart, Lock, MessageCircle, Play, Star, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FormatBadge, GenreBadge, LockedContentCTA, SupportStatusBadge } from '../components/ui/Cards';
import CommentsSection from '../components/ui/CommentsSection';
import { FollowButton, SupportButton } from '../components/InteractionButtons';
import { SensitiveActionWrapper } from '../components/SensitiveActionWrapper';
import { cn } from '../lib/utils';
import { useCurrentUser, useIncrementStoryView, useSaveStory, useStoryById, useUnlockChapter } from '../hooks/useConvex';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';
import { shareLink } from '../lib/share';

type ChapterItem = {
  chapterId: string;
  index: number;
  title: string;
  isPaid: boolean;
  price: number;
};

type StoryComment = {
  _id?: string;
  parentCommentId?: string | null;
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
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentsCursor, setCommentsCursor] = useState<string | undefined>(undefined);
  const [repliesByComment, setRepliesByComment] = useState<Record<string, StoryComment[]>>({});
  const [openReplyBox, setOpenReplyBox] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [ratingOpen, setRatingOpen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingSaving, setRatingSaving] = useState(false);

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
    // Fetch first page of persisted comments
    (async () => {
      try {
        if (convex && story?.id) {
          setCommentsLoading(true);
          const page = await convex.query(api.interactions.listCommentsPaged, { storyId: story.id, limit: 8 });
          if (Array.isArray(page)) {
            setLocalComments(page.map((c: any) => ({
              _id: c._id,
              authorId: c.authorId,
              author: c.authorName,
              avatar: c.authorAvatar,
              message: c.message,
              time: c.createdAt,
              likes: c.likesCount || 0,
              dislikes: c.dislikesCount || 0,
              likedBy: c.likedBy || [],
              dislikedBy: c.dislikedBy || [],
            })));
            setCommentsHasMore((page as any).length === 8);
            if ((page as any).length > 0) setCommentsCursor(page[page.length - 1].createdAt);
          }
        }
      } catch (err) {
        // ignore
      } finally {
        setCommentsLoading(false);
      }
    })();
  }, [story?.id]);

  useEffect(() => {
    if (!convex || !story?.id || !user?.id || user.isGuest) {
      setUserRating(null);
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const rating = await convex.query(api.ratings.getUserRating, {
          storyId: story.id,
          userId: user.id,
        });
        if (!active) return;
        setUserRating(typeof rating === 'number' ? rating : null);
      } catch {
        if (!active) return;
        setUserRating(null);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [story?.id, user?.id, user?.isGuest]);

  const fetchReplies = async (commentId: string) => {
    if (!story?.id || !commentId) return;
    setRepliesByComment((prev) => ({ ...prev, [commentId]: prev[commentId] || [] }));
    try {
      const page = await convex.query(api.interactions.listCommentsPaged, {
        storyId: story.id,
        parentCommentId: commentId,
        limit: 6,
      });
      if (Array.isArray(page)) {
        setRepliesByComment((prev) => ({
          ...prev,
          [commentId]: page.map((c: any) => ({
            _id: c._id,
            authorId: c.authorId,
            parentCommentId: c.parentCommentId ?? null,
            author: c.authorName,
            avatar: c.authorAvatar,
            message: c.message,
            time: c.createdAt,
            likes: c.likesCount || 0,
            dislikes: c.dislikesCount || 0,
            likedBy: c.likedBy || [],
            dislikedBy: c.dislikedBy || [],
          }))
        }));
      }
    } catch (err) {
      console.error('Failed to load replies', err);
    }
  };

  const loadMoreComments = async () => {
    if (!story?.id || commentsLoading) return;
    try {
      setCommentsLoading(true);
      const page = await convex.query(api.interactions.listCommentsPaged, { storyId: story.id, limit: 8, before: commentsCursor });
      if (Array.isArray(page) && page.length > 0) {
        setLocalComments((prev) => [...prev, ...page.map((c: any) => ({
          _id: c._id,
          authorId: c.authorId,
          parentCommentId: c.parentCommentId ?? null,
          author: c.authorName,
          avatar: c.authorAvatar,
          message: c.message,
          time: c.createdAt,
          likes: c.likesCount || 0,
          dislikes: c.dislikesCount || 0,
          likedBy: c.likedBy || [],
          dislikedBy: c.dislikedBy || [],
        }))]);
        setCommentsHasMore(page.length === 8);
        setCommentsCursor(page[page.length - 1].createdAt);
      } else {
        setCommentsHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more comments', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleReplyBox = (commentId: string) => {
    setOpenReplyBox((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    if (!openReplyBox[commentId]) {
      void fetchReplies(commentId);
    }
  };

  const submitReply = async (commentId: string) => {
    const message = replyDrafts[commentId]?.trim();
    if (!message || !story || !user || user.isGuest) return;
    const newReply = {
      _id: `local-reply-${Math.random().toString(36).substr(2, 9)}`,
      parentCommentId: commentId,
      author: user.name,
      avatar: user.avatar,
      message,
      time: new Date().toISOString(),
      likes: 0,
    };
    setRepliesByComment((prev) => ({
      ...prev,
      [commentId]: [newReply, ...(prev[commentId] || [])],
    }));
    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));

    try {
      await convex.mutation(api.interactions.createComment, {
        storyId: story.id,
        chapterId: undefined,
        parentCommentId: commentId,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        message,
      });
    } catch (err) {
      console.error('Failed to persist reply', err);
    }
  };

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

    const newLocal = {
      _id: `local-${Math.random().toString(36).substr(2, 9)}`,
      authorId: user?.id,
      author: user?.name || 'Guest Reader',
      avatar: user?.avatar,
      message,
      time: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      likedBy: [] as string[],
      dislikedBy: [] as string[],
    };
    setLocalComments((comments) => [newLocal, ...comments]);
    setCommentDraft('');

    // Persist comment to backend when possible
    try {
      if (convex && user && !user.isGuest) {
        void convex.mutation(api.interactions.createComment, {
          storyId: story.id,
          chapterId: undefined,
          parentCommentId: undefined,
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.avatar,
          message,
        });
      }
    } catch (err) {
      console.error('Failed to persist comment', err);
    }
  };

  const handleLike = async (index: number) => {
    const comment = localComments[index];
    if (!comment?._id || !user?.id || user.isGuest) return;
    const already = comment.likedBy?.includes(user.id);
    setLocalComments((current) => current.map((c, i) => i === index ? {
      ...c,
      likes: already ? (c.likes || 1) - 1 : (c.likes || 0) + 1,
      likedBy: already ? (c.likedBy || []).filter((id: string) => id !== user.id) : [...(c.likedBy || []), user.id],
      dislikedBy: (c.dislikedBy || []).filter((id: string) => id !== user.id),
      dislikes: (c.dislikedBy || []).includes(user.id) ? (c.dislikes || 1) - 1 : (c.dislikes || 0),
    } : c));
    try {
      await convex.mutation(api.interactions.toggleLikeComment, { commentId: comment._id, userId: user.id });
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  const handleDislike = async (index: number) => {
    const comment = localComments[index];
    if (!comment?._id || !user?.id || user.isGuest) return;
    const already = comment.dislikedBy?.includes(user.id);
    setLocalComments((current) => current.map((c, i) => i === index ? {
      ...c,
      dislikes: already ? (c.dislikes || 1) - 1 : (c.dislikes || 0) + 1,
      dislikedBy: already ? (c.dislikedBy || []).filter((id: string) => id !== user.id) : [...(c.dislikedBy || []), user.id],
      likedBy: (c.likedBy || []).filter((id: string) => id !== user.id),
      likes: (c.likedBy || []).includes(user.id) ? (c.likes || 1) - 1 : (c.likes || 0),
    } : c));
    try {
      await convex.mutation(api.interactions.toggleDislikeComment, { commentId: comment._id, userId: user.id });
    } catch (err) {
      console.error('Failed to dislike comment', err);
    }
  };

  const handleDelete = async (index: number) => {
    const comment = localComments[index];
    if (!comment?._id || !user?.id || user.isGuest) return;
    try {
      await convex.mutation(api.interactions.deleteComment, { commentId: comment._id, userId: user.id });
      setLocalComments((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Failed to delete comment', err);
      alert('Could not delete comment. Only the author can delete.');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/story/${story.id}`;
    try {
      const res = await shareLink({
        title: `${story.title} on Lemonade`,
        text: `Check out ${story.title} by ${story.creator?.name} on Lemonade!`,
        url,
      });
      if (res.method !== "native") {
        const toast = document.createElement("div");
        toast.className =
          "fixed bottom-24 left-1/2 -translate-x-1/2 bg-lemon-muted text-black px-6 py-3 rounded-full font-bold text-sm shadow-2xl z-[200]";
        toast.textContent = "Link copied to clipboard!";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    } catch {
      alert("Unable to share.");
    }
  };

  const submitRating = async (value: number) => {
    if (!convex || !story?.id || !user?.id || user.isGuest) return;
    try {
      setRatingSaving(true);
      await convex.mutation(api.ratings.rateStory, {
        storyId: story.id,
        userId: user.id,
        rating: value,
      });
      setUserRating(value);
      setRatingOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to submit rating.');
    } finally {
      setRatingSaving(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-lemon-muted/10 blur-3xl story-ambient-glow" />
        <div className="absolute left-1/2 top-2 h-[340px] w-[min(92vw,720px)] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(232,197,71,0.12),rgba(10,10,10,0)_68%)]" />
        <div className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(232,197,71,0.07),rgba(10,10,10,0))]" />
      </div>

      <main className="mx-auto flex w-full max-w-[430px] flex-col px-4 pb-[calc(28px+env(safe-area-inset-bottom))] pt-5 sm:max-w-2xl sm:px-6 lg:max-w-4xl">
        <section className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="story-cover-float relative w-[168px] rounded-[20px] sm:w-[210px]"
          >
            <div className="absolute -inset-3 rounded-[28px] bg-lemon-muted/12 blur-2xl" aria-hidden="true" />
            <div className="story-cover-shine relative overflow-hidden rounded-[20px] bg-[#141414] shadow-[0_22px_75px_rgba(232,197,71,0.20)] ring-1 ring-white/12">
              <img src={story.coverImage} alt={story.title} className="aspect-[3/4] w-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </motion.div>

          <div className="mt-5 flex max-w-full flex-wrap justify-center gap-2">
            <FormatBadge format={story.format} className="bg-[#1A1A1A] text-white ring-1 ring-white/10" />
            <GenreBadge genre={story.genre} className="ring-1 ring-white/10" />
          </div>

          <h1 className="mt-3 max-w-[340px] text-center font-display text-[30px] font-black leading-[1.02] tracking-tight text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.45)] sm:max-w-xl sm:text-5xl">
            {story.title}
          </h1>

          <Link to={`/creator/${story.creator.username}`} className="mt-2 flex items-center gap-2 text-xs font-semibold text-white/55 hover:text-lemon-muted">
            <img src={story.creator.avatar} alt={story.creator.name} className="h-5 w-5 rounded-full object-cover" referrerPolicy="no-referrer" />
            {story.creator.name}
          </Link>
        </section>

        <section className="mt-6 rounded-3xl border border-white/8 bg-[#141414]/95 p-2 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:divide-x sm:divide-white/8">
            <Stat icon={<Star size={13} className="text-lemon-muted" />} label="Rating" value={String(story.rating)} />
            <Stat icon={<Eye size={13} />} label="Views" value={`${(story.views / 1000).toFixed(0)}k`} />
            <Stat icon={<Heart size={13} />} label="Likes" value={`${(story.saves / 1000).toFixed(0)}k`} />
            <Stat label="Chapters" value={String(story.episodes || chapters.length)} />
          </div>
        </section>

        <section className="mt-5 flex flex-col items-center gap-3">
          <motion.div whileTap={{ scale: 0.98 }} className="story-cta-glow w-full max-w-[320px] rounded-2xl">
          <Link to={`/read/${story.id}/1`} className="block w-full">
            <Button size="md" className="h-11 w-full gap-2 rounded-2xl px-5 text-[13px] font-black shadow-lg shadow-lemon-muted/20">
              <Play size={15} fill="currentColor" />
              Read Chapter 1
            </Button>
          </Link>
          </motion.div>

          <div className="flex items-center justify-center gap-2">
            <SensitiveActionWrapper intent="save story" payload={{ storyId: story.id }} onClick={toggleSave}>
              <Button size="sm" variant={isSaved ? 'primary' : 'glass'} className="gap-1.5 rounded-xl border-white/10 bg-[#1A1A1A] px-4">
                {isSaved ? <Check size={14} /> : <Heart size={14} />}
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </SensitiveActionWrapper>
            <SensitiveActionWrapper intent="rate story" payload={{ storyId: story.id }} onClick={() => setRatingOpen(true)}>
              <Button size="sm" variant="glass" className="gap-1.5 rounded-xl border-white/10 bg-[#1A1A1A] px-4">
                <Star size={14} className={userRating ? 'fill-current text-lemon-muted' : ''} />
                {userRating ? `${userRating}/5` : 'Rate'}
              </Button>
            </SensitiveActionWrapper>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/10 bg-[#1A1A1A] px-4 text-[11px] font-bold text-white/75 hover:text-lemon-muted transition-colors"
            >
              <Share2 size={14} />
              Share
            </button>
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
              <CommentsSection
                open={true}
                onClose={() => {}}
                comments={localComments}
                loading={commentsLoading}
                hasMore={commentsHasMore}
                currentUserId={user?.id}
                currentUserAvatar={user?.avatar}
                currentUserName={user?.name}
                commentDraft={commentDraft}
                onCommentDraftChange={setCommentDraft}
                onSubmitComment={submitComment}
                onLoadMore={loadMoreComments}
                onLike={(_comment, index) => handleLike(index)}
                onDislike={(_comment, index) => handleDislike(index)}
                onDelete={(_comment, index) => handleDelete(index)}
                repliesByComment={repliesByComment}
                onToggleReplyBox={toggleReplyBox}
                openReplyBox={openReplyBox}
                replyDrafts={replyDrafts}
                onReplyDraftChange={(commentId, value) => setReplyDrafts((prev) => ({ ...prev, [commentId]: value }))}
                onSubmitReply={submitReply}
                disabled={!user || user.isGuest}
                variant="inline"
              />
            )}
          </div>
        </section>
      </main>

      {ratingOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !ratingSaving && setRatingOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Rate story</p>
                <h3 className="mt-1 font-display text-xl font-black">{story.title}</h3>
              </div>
              <button
                type="button"
                className="h-9 w-9 rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                onClick={() => !ratingSaving && setRatingOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={ratingSaving}
                  onClick={() => submitRating(value)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#141414] text-white/70 hover:text-lemon-muted hover:border-lemon-muted/30 disabled:opacity-50"
                >
                  <Star size={20} className={userRating && value <= userRating ? 'fill-current text-lemon-muted' : ''} />
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-xs font-semibold text-white/45">
              {userRating ? `Your rating: ${userRating}/5` : 'Tap a star to rate.'}
            </p>
          </div>
        </div>
      )}
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
