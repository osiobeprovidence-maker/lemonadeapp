import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  MoreHorizontal,
  MessageCircle,
  Bookmark,
  Share,
  Settings2,
  Lock,
  ChevronRight,
  Flag,
  ArrowLeft,
  MoreVertical,
  X,
  CheckCircle2,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { useApp } from "../contexts/AppContext";
import { convex } from "../lib/convex";
import { shareLink } from "../lib/share";
import { api } from "../../convex/_generated/api";
import AdPrerollModal from "../components/ads/AdPrerollModal";
import { useAdGate } from "../hooks/useAdGate";
import { useEngagement } from "../hooks/useEngagement";
import CommentsSection from "../components/ui/CommentsSection";

export default function Reader() {
  const { id, chapterNum } = useParams();
  const navigate = useNavigate();
  const { stories, user, trackReading, unlockChapter } = useApp();
  const story = stories.find((s) => s.id === id) || stories[0];
  const [commentCount, setCommentCount] = useState<number>(
    typeof story.commentCount === "number" ? story.commentCount : 0,
  );

  const chapterId = `c${chapterNum}`;
  // Prefer chapter-level monetization if available
  const chaptersFromMedia = story.media?.chapters;
  const chapterIndex = Math.max(0, parseInt(chapterNum || "1") - 1);
  const chapterData =
    Array.isArray(chaptersFromMedia) && chaptersFromMedia.length > chapterIndex
      ? chaptersFromMedia[chapterIndex]
      : undefined;
  const isPaid = !!(
    (chapterData &&
      (chapterData.monetization === "paid" ||
        (chapterData.price && chapterData.price > 0))) ||
    (story.media &&
      (story.media.monetization === "paid" ||
        (story.media.price && story.media.price > 0)))
  );
  const price = (chapterData && chapterData.price) || story.media?.price || 0;
  const isUnlocked =
    !isPaid ||
    user?.unlockedChapters.includes(`${id}-${chapterId}`) ||
    user?.isPremium;

  const [showUI, setShowUI] = useState(true);
  const [fontSize, setFontSize] = useState<number>(
    user?.settings.readerFontSize || 18,
  );
  const [theme, setTheme] = useState<"dark" | "cream">("dark");
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [localComments, setLocalComments] = useState<any[]>(
    Array.isArray(story?.comments) ? story.comments : [],
  );
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentsCursor, setCommentsCursor] = useState<string | undefined>(
    undefined,
  );
  const [repliesByComment, setRepliesByComment] = useState<Record<string, any[]>>({});
  const [openReplyBox, setOpenReplyBox] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Wrong content");
  const [reportMessage, setReportMessage] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  const isNovel = story.format === "Novel";
  const isPremiumReader =
    !!user?.isPremium || user?.premiumStatus === "premium";
  const adGate = useAdGate({
    enabled: isUnlocked && !isPremiumReader,
    userId: user?.id,
    storyId: story.id,
    creatorUsername: story.creator?.username,
    format: story.format,
    genre: story.genre,
    chapterNumber: parseInt(chapterNum || "1"),
    isPremium: isPremiumReader,
  });
  const canReadContent = isUnlocked && adGate.isContentUnlocked;

  // Track reading when content is available and unlocked
  useEffect(() => {
    if (canReadContent && id && chapterNum) {
      trackReading(id, chapterId);
    }
  }, [id, chapterNum, canReadContent]);

  useEffect(() => {
    if (!showComments || !story?.id || !chapterNum) return;

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const [page, count] = await Promise.all([
          convex.query(api.interactions.listCommentsPaged, {
            storyId: story.id,
            chapterId,
            limit: 8,
          }),
          convex.query(api.interactions.getCommentCount, {
            storyId: story.id,
            chapterId,
          }),
        ]);

        if (Array.isArray(page)) {
          setLocalComments(
            page.map((c: any) => ({
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
            })),
          );
          setCommentsHasMore(page.length === 8);
          setCommentsCursor(
            page.length > 0 ? page[page.length - 1].createdAt : undefined,
          );
        }
        if (typeof count === "number") setCommentCount(count);
      } catch (err) {
        console.error("Failed to load comments", err);
      } finally {
        setCommentsLoading(false);
      }
    };

    void fetchComments();
  }, [showComments, story?.id, chapterId, chapterNum]);

  const loadMoreComments = async () => {
    if (!story?.id || !commentsCursor || commentsLoading) return;

    try {
      setCommentsLoading(true);
      const page = await convex.query(api.interactions.listCommentsPaged, {
        storyId: story.id,
        chapterId,
        limit: 8,
        before: commentsCursor,
      });

      if (Array.isArray(page) && page.length > 0) {
        setLocalComments((prev) => [
          ...prev,
          ...page.map((c: any) => ({
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
          })),
        ]);
        setCommentsHasMore(page.length === 8);
        setCommentsCursor(page[page.length - 1].createdAt);
      } else {
        setCommentsHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more comments", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async (_comment: any, index: number) => {
    const comment = localComments[index];
    if (!comment?._id || !user?.id || user.isGuest) return;
    const already = comment.likedBy?.includes(user.id);
    setLocalComments((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              likes: already ? (c.likes || 1) - 1 : (c.likes || 0) + 1,
              likedBy: already
                ? (c.likedBy || []).filter((id: string) => id !== user.id)
                : [...(c.likedBy || []), user.id],
              dislikedBy: (c.dislikedBy || []).filter(
                (id: string) => id !== user.id,
              ),
              dislikes: (c.dislikedBy || []).includes(user.id)
                ? (c.dislikes || 1) - 1
                : c.dislikes || 0,
            }
          : c,
      ),
    );
    try {
      await convex.mutation(api.interactions.toggleLikeComment, {
        commentId: comment._id,
        userId: user.id,
      });
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  const handleDislike = async (_comment: any, index: number) => {
    const comment = localComments[index];
    if (!comment?._id || !user?.id || user.isGuest) return;
    const already = comment.dislikedBy?.includes(user.id);
    setLocalComments((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              dislikes: already ? (c.dislikes || 1) - 1 : (c.dislikes || 0) + 1,
              dislikedBy: already
                ? (c.dislikedBy || []).filter((id: string) => id !== user.id)
                : [...(c.dislikedBy || []), user.id],
              likedBy: (c.likedBy || []).filter((id: string) => id !== user.id),
              likes: (c.likedBy || []).includes(user.id)
                ? (c.likes || 1) - 1
                : c.likes || 0,
            }
          : c,
      ),
    );
    try {
      await convex.mutation(api.interactions.toggleDislikeComment, {
        commentId: comment._id,
        userId: user.id,
      });
    } catch (err) {
      console.error("Failed to dislike comment", err);
    }
  };

  const handleDelete = async (_comment: any, index: number) => {
    const comment = localComments[index];
    if (!comment?._id || !user?.id || user.isGuest) return;
    try {
      await convex.mutation(api.interactions.deleteComment, {
        commentId: comment._id,
        userId: user.id,
      });
      setLocalComments((prev) => prev.filter((_, i) => i !== index));
      setCommentCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to delete comment", err);
      alert("Could not delete comment. Only the author can delete.");
    }
  };

  const fetchReplies = useCallback(async (commentId: string) => {
    if (!convex) return;
    try {
      const page = await convex.query(api.interactions.listCommentsPaged, { parentCommentId: commentId, limit: 50 });
      setRepliesByComment((prev) => ({
        ...prev,
        [commentId]: Array.isArray(page)
          ? page.map((c: any) => ({
              _id: c._id,
              parentCommentId: c.parentCommentId,
              author: c.authorName,
              avatar: c.authorAvatar,
              message: c.message,
              time: c.createdAt,
              likes: c.likesCount || 0,
              dislikes: c.dislikesCount || 0,
              likedBy: c.likedBy || [],
              dislikedBy: c.dislikedBy || [],
            }))
          : [],
      }));
    } catch (err) {
      console.error('Failed to fetch replies', err);
    }
  }, []);

  const toggleReplyBox = useCallback((commentId: string) => {
    setOpenReplyBox((prev) => {
      const isOpen = !prev[commentId];
      if (isOpen && !repliesByComment[commentId]) {
        fetchReplies(commentId);
      }
      return { ...prev, [commentId]: isOpen };
    });
  }, [fetchReplies, repliesByComment]);

  const submitReply = useCallback(async (commentId: string) => {
    const msg = replyDrafts[commentId]?.trim();
    if (!msg || !user || user.isGuest || !convex) return;
    const optimistic: any = {
      _id: `opt_${Date.now()}`,
      parentCommentId: commentId,
      author: user.name,
      avatar: user.avatar,
      message: msg,
      time: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    };
    setRepliesByComment((prev) => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), optimistic],
    }));
    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));
    try {
      const result: any = await convex.mutation(api.interactions.createComment, {
        storyId: story.id,
        chapterId,
        parentCommentId: commentId,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        message: msg,
      });
      if (result?.reward) {
        setRewardBanner(`🍋 +${result.reward} Lemon Coins`);
        window.setTimeout(() => setRewardBanner(null), 3200);
      }
      fetchReplies(commentId);
    } catch (err) {
      console.error('Failed to submit reply', err);
    }
  }, [replyDrafts, user, convex, story?.id, chapterId, fetchReplies]);

  const handleShare = async () => {
    const url = `${window.location.origin}/read/${story.id}/${chapterNum || "1"}`;
    try {
      const res = await shareLink({
        title: `${story.title} — Chapter ${chapterNum || "1"}`,
        text: `Check out this chapter from ${story.title} on OWUUU!`,
        url,
      });
      if (res.method !== "native") {
        // Show a brief toast notification
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

  const handleRate = async (rating: number) => {
    if (!user?.id || user.isGuest) return;
    setUserRating(rating);
    setRatingOpen(false);
    try {
      if (convex) {
        await convex.mutation(api.ratings.rateStory, {
          storyId: story.id,
          userId: user.id,
          rating,
        });
      }
    } catch (err) {
      console.error("Failed to rate story", err);
    }
  };

  // Engagement instrumentation: track scroll and time spent
  useEngagement({
    storyId: id,
    chapterId,
    onReward: (reward) => {
      if (!reward) return;
      setRewardBanner(
        reward.rewardMessage || `🍋 +${reward.coinsAwarded || 0} Lemon Coins`,
      );
      window.setTimeout(() => setRewardBanner(null), 3200);
    },
  });

  // Auto-hide UI when scrolling
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY && showUI) {
        setShowUI(false);
        setShowSettings(false);
      } else if (currentScrollY < lastScrollY - 20 && !showUI) {
        setShowUI(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showUI]);

  if (!isUnlocked) {
    return (
      <LockedReaderScreen
        story={story}
        chapterNum={chapterNum || "1"}
        price={price}
      />
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300 overflow-x-hidden",
        theme === "dark"
          ? "bg-[#0A0A0A] text-cream-soft"
          : "bg-[#f5f5f0] text-black",
      )}
    >
      <AdPrerollModal
        ad={adGate.ad}
        countdownSeconds={adGate.countdownSeconds}
        open={adGate.isAdOpen}
        onComplete={adGate.completeAd}
        onSkip={adGate.skipAd}
        onClickThrough={adGate.clickAd}
      />

      <AnimatePresence>
        {rewardBanner && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-20 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-lemon-muted/20 bg-black-core/95 px-4 py-2 text-sm font-bold text-lemon-muted shadow-2xl backdrop-blur-xl"
          >
            {rewardBanner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-black-core/90 text-white backdrop-blur-xl border-b border-white/10"
          >
            <div className="flex items-center justify-between px-4 h-16 pt-safe pb-safe">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
                <h3 className="font-display font-medium text-sm truncate w-full text-center">
                  {story.title}
                </h3>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-black truncate w-full text-center">
                  Chapter {chapterNum}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isNovel && (
                  <button
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setShowMoreMenu(false);
                    }}
                    className={cn(
                      "p-2 rounded-full hover:bg-white/10 transition-colors",
                      showSettings && "bg-white/10",
                    )}
                  >
                    <Settings2 size={20} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMoreMenu(!showMoreMenu);
                    setShowSettings(false);
                  }}
                  className={cn(
                    "p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors",
                    showMoreMenu && "bg-white/10",
                  )}
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Novel Settings Dropdown */}
            {isNovel && showSettings && (
              <div className="absolute top-[calc(100%+8px)] right-4 p-5 bg-ink-deep border border-white/10 rounded-2xl shadow-2xl w-64">
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-black">
                    Theme
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex-1 p-2 rounded-lg border text-sm font-bold transition-all",
                        theme === "dark"
                          ? "border-lemon-muted bg-black-core text-lemon-muted"
                          : "border-white/10 bg-black-core text-white/60",
                      )}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme("cream")}
                      className={cn(
                        "flex-1 p-2 rounded-lg border text-sm font-bold transition-all",
                        theme === "cream"
                          ? "border-lemon-muted bg-[#f5f5f0] text-black"
                          : "border-white/10 bg-[#f5f5f0] text-black/60",
                      )}
                    >
                      Cream
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-black">
                    Text Size
                  </p>
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-bold">
                      {fontSize}pt
                    </span>
                    <button
                      onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* More Menu Dropdown */}
            {showMoreMenu && (
              <div className="absolute top-[calc(100%+8px)] right-4 p-2 bg-ink-deep border border-white/10 rounded-2xl shadow-2xl w-56 flex flex-col">
                <button
                  onClick={async () => {
                    setShowMoreMenu(false);
                    const url = `${window.location.origin}/read/${story.id}/${chapterNum || "1"}`;
                    try {
                      const res = await shareLink({
                        title: `${story.title} — Chapter ${chapterNum || "1"}`,
                        url,
                      });
                      if (res.method !== "native") alert("Link copied!");
                    } catch {
                      alert("Unable to share.");
                    }
                  }}
                  className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors text-left text-sm font-bold"
                >
                  <Share size={18} className="text-white/40" /> Share Chapter
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowReportModal(true);
                  }}
                  className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors text-left text-sm font-bold"
                >
                  <Flag size={18} className="text-white/40" /> Report Chapter
                </button>
                <div className="h-px bg-white/5 my-1 mx-2" />
                <button
                  onClick={() => navigate(`/story/${id}`)}
                  className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors text-left text-sm font-bold"
                >
                  <ArrowLeft size={18} className="text-white/40" /> Back to
                  Story
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-ink-deep border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {reportSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-lemon-muted text-black rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-display font-black text-2xl mb-2">
                    Report submitted.
                  </h3>
                  <p className="text-white/50 text-sm mb-8">
                    Thank you for helping us keep OWUUU safe.
                  </p>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => setShowReportModal(false)}
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-black text-2xl">
                      Report Chapter
                    </h3>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="text-white/30 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Reason
                      </label>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full h-12 bg-black-core border border-white/10 rounded-xl px-4 text-white text-sm focus:border-lemon-muted outline-none"
                      >
                        <option>Wrong content</option>
                        <option>Copyright issue</option>
                        <option>Offensive content</option>
                        <option>Technical issue</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Message (Optional)
                      </label>
                      <textarea
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        className="w-full h-32 bg-black-core border border-white/10 rounded-xl p-4 text-white text-sm focus:border-lemon-muted outline-none resize-none"
                        placeholder="Provide more details..."
                      />
                    </div>

                    <Button
                      fullWidth
                      size="lg"
                      className="mt-4"
                      disabled={isReporting}
                      onClick={() => {
                        setIsReporting(true);
                        setTimeout(() => {
                          setIsReporting(false);
                          setReportSuccess(true);
                        }, 1000);
                      }}
                    >
                      {isReporting ? "Submitting..." : "Submit Report"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div
        className="pt-24 pb-24"
        onClick={() => {
          setShowUI(!showUI);
          setShowSettings(false);
          setShowMoreMenu(false);
        }}
      >
        {(() => {
          // Determine content source: chapterData (array) or top-level media
          const attachments =
            chapterData?.attachments || story.media?.attachments || [];
          const chapterText =
            chapterData?.text ||
            (chapterNum === "1" ? story.media?.chapterText : undefined) ||
            "";

          if (!canReadContent) {
            return (
              <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
                <div className="mb-6 h-14 w-14 animate-pulse rounded-2xl bg-lemon-muted/15" />
                <h2 className="font-display text-3xl font-black">
                  Preparing chapter
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-6 text-white/50">
                  Free reading is supported by a short sponsored message.
                </p>
              </div>
            );
          }

          // If novel and has text
          if (isNovel) {
            if (chapterText && chapterText.trim().length > 0) {
              return (
                <div
                  className="max-w-2xl mx-auto px-6 py-8 font-sans leading-[1.8]"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <h2 className="sr-only">
                    {story.title} — Chapter {chapterNum}
                  </h2>
                  {chapterText.split("\n\n").map((para, idx) => (
                    <p key={idx} className="mb-6 text-white/90">
                      {para}
                    </p>
                  ))}
                </div>
              );
            }

            return (
              <div className="max-w-2xl mx-auto px-6 py-8 font-sans leading-[1.8]">
                <h2 className="font-display font-black text-3xl md:text-5xl mb-6">
                  Chapter content unavailable
                </h2>
                <p className="mb-6 text-white/60">
                  This chapter has not been uploaded yet.
                </p>
              </div>
            );
          }

          // For comics / image-based
          if (attachments && attachments.length > 0) {
            return (
              <div className="flex flex-col items-center max-w-[900px] mx-auto px-6">
                {attachments.map((att: any, idx: number) => (
                  <div key={idx} className="w-full mb-6">
                    {att.type?.startsWith("image") ||
                    att.url?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                      <img
                        src={att.url}
                        alt={`page-${idx}`}
                        className="w-full h-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lemon-muted underline"
                      >
                        Open attachment
                      </a>
                    )}
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div className="flex flex-col items-center max-w-[800px] mx-auto bg-black px-6 py-16 text-center">
              <h2 className="font-display font-black text-3xl md:text-5xl mb-6">
                Chapter pages unavailable
              </h2>
              <p className="text-white/60">
                The creator has not uploaded pages for this chapter yet.
              </p>
            </div>
          );
        })()}
      </div>

      {/* Bottom Footer Action Area */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-0 right-0 z-50 px-6 pointer-events-none"
          >
            <div className="max-w-xl mx-auto flex justify-between items-center bg-black-core/90 backdrop-blur-xl text-cream-soft p-1 rounded-full border border-white/10 shadow-2xl pointer-events-auto">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-11 w-11 transition-colors",
                  user?.savedStories.includes(story.id)
                    ? "text-lemon-muted"
                    : "text-white/60 hover:text-white",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (user && !user.isGuest) {
                    if (user.savedStories.includes(story.id)) {
                      // Unsave logic would go here
                    } else {
                      // Save logic would go here
                    }
                  }
                }}
              >
                <Bookmark
                  size={20}
                  className={
                    user?.savedStories.includes(story.id) ? "fill-current" : ""
                  }
                />
              </Button>
              <Button
                variant="ghost"
                className="text-white/60 px-4 h-11 w-auto flex gap-2 font-bold text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(true);
                }}
              >
                <MessageCircle size={18} /> {commentCount}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-white/60 hover:text-lemon-muted transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
              >
                <Share size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-11 w-11 transition-colors",
                  userRating > 0 ? "text-lemon-muted" : "text-white/60 hover:text-lemon-muted",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setRatingOpen(!ratingOpen);
                }}
              >
                <Star size={18} className={userRating > 0 ? "fill-current" : ""} />
              </Button>
              <div className="w-[1px] h-6 bg-white/10" />
              <Button
                variant="primary"
                className="flex-1 mr-1 h-11 font-black text-xs uppercase tracking-widest"
                onClick={() =>
                  navigate(
                    `/read/${story.id}/${parseInt(chapterNum || "1") + 1}`,
                  )
                }
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRatingOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-ink-deep border border-white/10 rounded-3xl shadow-2xl p-8 max-w-sm w-full"
            >
              <div className="text-center">
                <h3 className="font-display font-black text-2xl mb-2">Rate this story</h3>
                <p className="text-white/50 text-sm mb-6">How are you enjoying {story.title}?</p>
                
                <div className="flex justify-center gap-3 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        size={40}
                        className={
                          star <= userRating
                            ? "fill-lemon-muted text-lemon-muted"
                            : "text-white/30 hover:text-white/50"
                        }
                      />
                    </button>
                  ))}
                </div>
                
                {userRating > 0 && (
                  <p className="text-lemon-muted font-bold text-sm">
                    You rated this {userRating}/5 stars
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommentsSection
        open={showComments}
        onClose={() => setShowComments(false)}
        comments={localComments}
        totalCount={commentCount}
        loading={commentsLoading}
        hasMore={commentsHasMore}
        currentUserId={user?.id}
        currentUserAvatar={user?.avatar}
        currentUserName={user?.name}
        commentDraft={commentDraft}
        onCommentDraftChange={setCommentDraft}
        onSubmitComment={async (ev) => {
          ev.preventDefault();
          const msg = commentDraft.trim();
          if (!msg) return;
          const newC = {
            author: user?.name || "Guest",
            avatar: user?.avatar,
            message: msg,
            time: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            likedBy: [],
            dislikedBy: [],
          };
          setLocalComments((c) => [newC, ...c]);
          setCommentDraft("");
          setCommentCount((c) => c + 1);
          try {
            if (convex && user && !user.isGuest) {
              const result: any = await convex.mutation(
                api.interactions.createComment,
                {
                  storyId: story.id,
                  chapterId: `c${chapterNum}`,
                  authorId: user.id,
                  authorName: user.name,
                  authorAvatar: user.avatar,
                  message: msg,
                },
              );
              if (result?.reward) {
                setRewardBanner(
                  result.meaningful
                    ? `🍋 Meaningful comment reward: +${result.reward} Lemon Coins`
                    : `🍋 +${result.reward} Lemon Coins`,
                );
                window.setTimeout(() => setRewardBanner(null), 3200);
              }
            }
          } catch (err) {
            console.error("Failed to persist comment", err);
          }
        }}
        onLoadMore={loadMoreComments}
        onLike={handleLike}
        onDislike={handleDislike}
        onDelete={handleDelete}
        repliesByComment={repliesByComment}
        onToggleReplyBox={toggleReplyBox}
        openReplyBox={openReplyBox}
        replyDrafts={replyDrafts}
        onReplyDraftChange={(commentId, value) => setReplyDrafts((prev) => ({ ...prev, [commentId]: value }))}
        onSubmitReply={submitReply}
        disabled={!user || user.isGuest}
      />
    </div>
  );
}

function LockedReaderScreen({
  story,
  chapterNum,
  price,
}: {
  story: any;
  chapterNum: string;
  price: number;
}) {
  const { user, unlockChapter, isGuest } = useApp();
  const navigate = useNavigate();

  const handleUnlock = () => {
    if (isGuest) {
      navigate("/auth?mode=signup&intent=read");
      return;
    }
    if (user && user.walletBalance >= price) {
      unlockChapter(story.id, `c${chapterNum}`, price);
    } else {
      navigate("/wallet");
    }
  };

  return (
    <div className="min-h-screen bg-black-core flex flex-col pt-16 px-4 md:px-0">
      <div className="flex items-center px-4 h-16 border-b border-white/10 max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="ml-4 flex-1 truncate">
          <h3 className="font-bold text-sm truncate">{story.title}</h3>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">
            Chapter {chapterNum}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-lemon-muted/10 rounded-full flex items-center justify-center text-lemon-muted mb-8">
          <Lock size={32} />
        </div>
        <h2 className="font-display font-black text-3xl md:text-5xl mb-4">
          Chapter Locked
        </h2>
        <p className="text-white/60 text-sm md:text-base mb-10 max-w-xs mx-auto leading-relaxed">
          This is a premium chapter. Unlock it with coins or get an OWUUU
          Premium subscription to read.
        </p>

        <div className="grid gap-4 w-full max-w-sm">
          <Button size="lg" className="h-14" onClick={handleUnlock}>
            Unlock with {price} Coins
          </Button>
          <Link to="/premium">
            <Button size="lg" variant="glass" className="h-14" fullWidth>
              Get Premium Access
            </Button>
          </Link>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-10 text-sm font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
