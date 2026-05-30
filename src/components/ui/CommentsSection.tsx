import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  X,
  Send,
  ChevronDown,
  ThumbsDown,
  Loader,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type CommentItem = {
  _id?: string;
  parentCommentId?: string | null;
  author?: string;
  avatar?: string;
  message: string;
  time?: string;
  likes?: number;
};

export interface CommentsSectionProps {
  open: boolean;
  onClose: () => void;
  comments: CommentItem[];
  totalCount?: number;
  loading?: boolean;
  hasMore?: boolean;
  currentUserAvatar?: string;
  currentUserName?: string;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  onLoadMore?: () => void;
  onLike?: (comment: CommentItem, index: number) => void;
  onDislike?: (comment: CommentItem, index: number) => void;
  repliesByComment?: Record<string, CommentItem[]>;
  onToggleReplyBox?: (commentId: string) => void;
  openReplyBox?: Record<string, boolean>;
  replyDrafts?: Record<string, string>;
  onReplyDraftChange?: (commentId: string, value: string) => void;
  onSubmitReply?: (commentId: string) => void;
  disabled?: boolean;
  variant?: 'sheet' | 'inline';
}

function timeAgo(iso?: string) {
  if (!iso) return 'Just now';
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.floor(hr / 24);
  return `${days}d`;
}

export default function CommentsSection({
  open,
  onClose,
  comments,
  totalCount,
  loading,
  hasMore,
  currentUserAvatar,
  currentUserName,
  commentDraft,
  onCommentDraftChange,
  onSubmitComment,
  onLoadMore,
  onLike,
  onDislike,
  repliesByComment = {},
  onToggleReplyBox,
  openReplyBox = {},
  replyDrafts = {},
  onReplyDraftChange,
  onSubmitReply,
  disabled,
  variant = 'sheet',
}: CommentsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [dislikedSet, setDislikedSet] = useState<Set<string>>(new Set());

  const handleLike = (comment: CommentItem, index: number) => {
    if (!comment._id) return;
    setLikedSet((prev) => {
      const next = new Set(prev);
      if (next.has(comment._id!)) {
        next.delete(comment._id!);
      } else {
        next.add(comment._id!);
        setDislikedSet((d) => {
          const nd = new Set(d);
          nd.delete(comment._id!);
          return nd;
        });
      }
      return next;
    });
    onLike?.(comment, index);
  };

  const handleDislike = (comment: CommentItem, index: number) => {
    if (!comment._id) return;
    setDislikedSet((prev) => {
      const next = new Set(prev);
      if (next.has(comment._id!)) {
        next.delete(comment._id!);
      } else {
        next.add(comment._id!);
        setLikedSet((d) => {
          const nd = new Set(d);
          nd.delete(comment._id!);
          return nd;
        });
      }
      return next;
    });
    onDislike?.(comment, index);
  };

  const count = totalCount ?? comments.length;

  const renderHeader = () => (
    <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-white/5">
      <div className="flex items-center gap-2">
        <MessageCircle size={18} className="text-white/60" />
        <h3 className="font-display font-black text-lg">
          {count.toLocaleString()} {count === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>
      {variant === 'sheet' && (
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );

  const renderList = () => (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-5 py-2 space-y-1 hide-scrollbar"
    >
      {loading && comments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader size={22} className="animate-spin text-white/30" />
          <p className="text-sm text-white/30 font-medium">Loading comments...</p>
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-white/20" />
          </div>
          <p className="text-sm font-bold text-white/40 mb-1">No comments yet</p>
          <p className="text-xs text-white/30">Be the first to share your thoughts.</p>
        </div>
      )}

      {comments.map((comment, index) => {
        const commentId = comment._id || `local-${index}`;
        const isLiked = comment._id ? likedSet.has(comment._id) : false;
        const isDisliked = comment._id ? dislikedSet.has(comment._id) : false;
        const replies = comment._id ? repliesByComment[comment._id] || [] : [];
        const isReplyOpen = comment._id ? openReplyBox[comment._id] : false;

        return (
          <div key={commentId} className="py-3">
            <div className="flex gap-3">
              {/* Avatar */}
              <img
                src={
                  comment.avatar ||
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                    comment.author || 'U'
                  )}`
                }
                alt={comment.author || 'User'}
                className="h-10 w-10 rounded-full object-cover bg-white/5 shrink-0"
                referrerPolicy="no-referrer"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Name + Time */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white truncate">
                        {comment.author || 'Anonymous'}
                      </span>
                      <span className="text-[11px] text-white/30 shrink-0">
                        {timeAgo(comment.time)}
                      </span>
                    </div>

                    {/* Comment Text */}
                    <p className="text-sm leading-relaxed text-white/80 break-words">
                      {comment.message}
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          comment._id && onToggleReplyBox?.(comment._id)
                        }
                        className="text-[11px] font-bold text-white/40 hover:text-lemon-muted transition-colors"
                      >
                        Reply
                      </button>
                      {replies.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            comment._id && onToggleReplyBox?.(comment._id)
                          }
                          className="text-[11px] font-bold text-lemon-muted flex items-center gap-1"
                        >
                          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                          <ChevronDown
                            size={12}
                            className={cn(
                              'transition-transform',
                              isReplyOpen ? 'rotate-180' : ''
                            )}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Like / Dislike Column */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => handleLike(comment, index)}
                      className={cn(
                        'p-1.5 rounded-full transition-colors',
                        isLiked
                          ? 'text-lemon-muted'
                          : 'text-white/30 hover:text-white/60'
                      )}
                    >
                      <Heart
                        size={18}
                        className={cn(isLiked && 'fill-current')}
                      />
                    </button>
                    <span
                      className={cn(
                        'text-[11px] font-bold leading-none',
                        isLiked ? 'text-lemon-muted' : 'text-white/30'
                      )}
                    >
                      {((comment.likes || 0) + (isLiked ? 1 : 0)).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDislike(comment, index)}
                      className={cn(
                        'p-1.5 rounded-full transition-colors',
                        isDisliked
                          ? 'text-red-400'
                          : 'text-white/30 hover:text-white/60'
                      )}
                    >
                      <ThumbsDown size={16} />
                    </button>
                  </div>
                </div>

                {/* Reply Input */}
                <AnimatePresence>
                  {isReplyOpen && comment._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/8 bg-[#141414] p-2">
                        <input
                          value={replyDrafts[comment._id] || ''}
                          onChange={(e) =>
                            onReplyDraftChange?.(comment._id!, e.target.value)
                          }
                          placeholder={`Reply to ${comment.author || 'Anonymous'}...`}
                          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/25"
                        />
                        <button
                          type="button"
                          onClick={() => onSubmitReply?.(comment._id!)}
                          disabled={!replyDrafts[comment._id]?.trim()}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lemon-muted text-black disabled:opacity-40"
                        >
                          <Send size={14} />
                        </button>
                      </div>

                      {/* Replies List */}
                      {replies.length > 0 && (
                        <div className="mt-2 space-y-2 pl-2 border-l-2 border-white/5">
                          {replies.map((reply, ri) => (
                            <div
                              key={reply._id || `reply-${ri}`}
                              className="flex gap-2 py-2"
                            >
                              <img
                                src={
                                  reply.avatar ||
                                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                                    reply.author || 'U'
                                  )}`
                                }
                                alt=""
                                className="h-7 w-7 rounded-full object-cover bg-white/5 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">
                                    {reply.author || 'Anonymous'}
                                  </span>
                                  <span className="text-[10px] text-white/30">
                                    {timeAgo(reply.time)}
                                  </span>
                                </div>
                                <p className="text-xs leading-relaxed text-white/70 mt-0.5">
                                  {reply.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="rounded-full bg-white/5 px-5 py-2 text-xs font-bold text-white/60 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more comments'}
          </button>
        </div>
      )}
    </div>
  );

  const renderInput = () => (
    <div className="shrink-0 border-t border-white/5 bg-[#0A0A0A] px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <form
        onSubmit={onSubmitComment}
        className="flex items-center gap-3"
      >
        <img
          src={
            currentUserAvatar ||
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
              currentUserName || 'You'
            )}`
          }
          alt="You"
          className="h-9 w-9 rounded-full object-cover bg-white/5 shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 flex items-center gap-2 rounded-full border border-white/8 bg-[#141414] px-4 py-2.5">
          <input
            ref={inputRef}
            value={commentDraft}
            onChange={(e) => onCommentDraftChange(e.target.value)}
            placeholder="Add a comment..."
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!commentDraft.trim() || disabled}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lemon-muted text-black disabled:opacity-40 transition-transform active:scale-95"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="flex flex-col rounded-3xl border border-white/8 bg-[#0A0A0A] overflow-hidden" style={{ minHeight: '320px' }}>
        {renderHeader()}
        {renderList()}
        {renderInput()}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg mx-auto flex flex-col bg-[#0A0A0A] rounded-t-[28px] border-t border-white/5 shadow-2xl"
            style={{ maxHeight: '85vh', height: '85vh' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {renderHeader()}
            {renderList()}
            {renderInput()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
