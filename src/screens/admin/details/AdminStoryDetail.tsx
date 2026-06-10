import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Star,
  ExternalLink,
  ChevronLeft,
  Ban,
  CheckCircle,
  MoreVertical,
  Layers,
  Heart,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { convex } from "../../../lib/convex";

export default function AdminStoryDetail() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [savingFeatured, setSavingFeatured] = useState(false);

  useEffect(() => {
    if (!convex || !storyId) return;
    setLoading(true);
    convex
      .query(api.stories.getByExternalId, { externalId: storyId })
      .then((doc) => {
        if (doc) {
          setStory(doc);
          setIsFeatured(doc.isFeatured ?? false);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [storyId]);

  const handleToggleStatus = () => {
    if (!story) return;
    const nextStatus = story.status === "published" ? "hidden" : "published";
    convex
      .mutation(api.stories.update, {
        externalId: story.externalId || story._id,
        status: nextStatus,
      })
      .then(() => setStory({ ...story, status: nextStatus }))
      .catch(console.error);
  };

  const handleToggleFeatured = async () => {
    const nextFeatured = !isFeatured;
    setIsFeatured(nextFeatured);
    setSavingFeatured(true);
    try {
      if (convex && story) {
        await convex.mutation(api.stories.update, {
          externalId: story.externalId || story._id,
          isFeatured: nextFeatured,
        });
        setStory({ ...story, isFeatured: nextFeatured });
      }
    } catch (error) {
      console.error("Failed to update featured flag", error);
      setIsFeatured(!nextFeatured);
    } finally {
      setSavingFeatured(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/40 font-bold">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="space-y-8 pb-20">
        <button
          onClick={() => navigate("/admin/stories")}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Stories</span>
        </button>
        <div className="flex items-center justify-center h-64">
          <p className="text-white/40 font-bold">Story not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/stories")}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Stories</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFeatured}
            disabled={savingFeatured}
            className={`flex items-center gap-2 px-6 h-12 rounded-xl font-bold transition-all ${
              isFeatured
                ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20"
                : "bg-white/5 text-white hover:bg-white/10"
            } disabled:opacity-60 disabled:hover:scale-100`}
          >
            <BadgeCheck size={18} />
            {savingFeatured
              ? "Saving..."
              : isFeatured
                ? "Featured Content"
                : "Feature this Story"}
          </button>
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-6 h-12 rounded-xl font-bold transition-all ${
              story.status === "published"
                ? "bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white"
                : "bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-white"
            }`}
          >
            {story.status === "published" ? (
              <Ban size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            {story.status === "published" ? "Hide Story" : "Publish Story"}
          </button>
          <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          {/* Story Cover Card */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] text-center">
            <div className="relative w-48 h-64 mx-auto mb-6 shadow-2xl group overflow-hidden rounded-[24px]">
              <img
                src={story.coverImage || "https://placehold.co/300x450?text=No+Cover"}
                alt={story.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  to={`/story/${story.externalId || story._id}`}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center"
                >
                  <ExternalLink size={24} />
                </Link>
              </div>
            </div>
            <h2 className="text-2xl font-display font-black tracking-tight uppercase italic mb-2 leading-tight">
              {story.title}
            </h2>
            <Link
              to={`/creator/${story.creatorUsername}`}
              className="text-lemon-muted font-bold mb-6 block hover:underline"
            >
              @{story.creatorUsername}
            </Link>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                  Format
                </p>
                <p className="text-sm font-bold">{story.format || story.contentType || "N/A"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                  Status
                </p>
                <p className="text-sm font-bold capitalize">{story.status || "N/A"}</p>
              </div>
            </div>

            <Link
              to={`/story/${story.externalId || story._id}`}
              className="flex items-center justify-center gap-2 w-full mt-6 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
            >
              View Public Page
              <ExternalLink size={16} />
            </Link>
          </div>

          {/* Engagement Stats */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-6 italic">
              Performance Metrics
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
                  <BookOpen size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">
                    Total Reads
                  </p>
                  <p className="text-lg font-black italic">{(story.views ?? 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
                  <Heart size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">
                    Saves
                  </p>
                  <p className="text-lg font-black italic">{(story.saves ?? 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                  <Star size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">
                    Rating
                  </p>
                  <p className="text-lg font-black italic">
                    {(story.rating ?? 0).toFixed(1)}/5.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Info Card */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-lemon-muted" />
                <h3 className="text-lg font-display font-black tracking-tight uppercase italic">
                  Content Summary
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/60 px-3 py-1 rounded-full border border-white/5">
                  {story.genre || "N/A"}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">
                Synopsis
              </p>
              <p className="text-white/80 leading-relaxed font-medium">
                {story.synopsis || "No synopsis available."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5 border-dashed">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                  Episodes
                </p>
                <p className="text-lg font-black">{story.episodes ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                  Created
                </p>
                <p className="text-lg font-black">{story.createdAt ? new Date(story.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                  Featured
                </p>
                <p className={`text-lg font-black ${story.isFeatured ? "text-lemon-muted" : "text-white/40"}`}>
                  {story.isFeatured ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                  Publication
                </p>
                <p className="text-lg font-black capitalize">{story.publicationStatus || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Chapter List Card */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <div className="flex items-center gap-2 mb-6">
              <Layers size={20} className="text-lemon-muted" />
              <h3 className="text-lg font-display font-black tracking-tight uppercase italic">
                Chapter Management
              </h3>
            </div>
            <div className="space-y-3">
              {Array.from({ length: story.episodes ?? 0 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black-core border border-white/10 flex items-center justify-center text-xs font-black text-white/40">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">Chapter {index + 1}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">
                        Published
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      View
                    </button>
                    <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
