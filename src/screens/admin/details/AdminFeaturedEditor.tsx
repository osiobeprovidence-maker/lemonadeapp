import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  Search,
  Plus,
  X,
  GripVertical,
  Eye,
  Layout,
  TrendingUp,
  Star,
  Clock,
  BadgeCheck,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { convex } from "../../../lib/convex";
import { useApp } from "../../../contexts/AppContext";

const FEATURED_SECTIONS = [
  { id: "hero", label: "Hero Featured Story", icon: Star },
  { id: "trending", label: "Trending Now", icon: TrendingUp },
  { id: "new_drops", label: "New Drops", icon: Clock },
  { id: "originals", label: "Lemonade Originals", icon: BadgeCheck },
  { id: "creators", label: "Featured Creators", icon: BadgeCheck },
];

export default function AdminFeaturedEditor() {
  const { stories } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");

  const [activeSection, setActiveSection] = useState("hero");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewMode, setPreviewMode] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const featured = stories.filter((story) => story.isFeatured);
    setItems(featured);
  }, [stories]);

  const searchableStories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return stories.filter((story) => {
      if (!term) return true;
      return (
        story.title.toLowerCase().includes(term) ||
        story.creator?.username?.toLowerCase().includes(term) ||
        story.genre?.toLowerCase().includes(term)
      );
    });
  }, [stories, searchTerm]);

  const availableStories = searchableStories.filter(
    (story) =>
      !items.some(
        (item) => item.externalId === story.externalId || item.id === story.id,
      ),
  );

  const persistFeatured = async (story: any, featured: boolean) => {
    if (!convex) throw new Error("Convex is unavailable");
    const externalId = story.externalId || story.id;
    if (!externalId) throw new Error("Missing story id");
    await convex.mutation(api.stories.update, {
      externalId,
      isFeatured: featured,
    });
  };

  const addItem = async (story: any) => {
    if (
      items.some(
        (item) => item.externalId === story.externalId || item.id === story.id,
      )
    )
      return;
    setItems((current) => [story, ...current]);
    try {
      await persistFeatured(story, true);
    } catch (error) {
      console.error("Failed to feature story", error);
      setItems((current) => current.filter((item) => item.id !== story.id));
    }
  };

  const removeItem = async (itemId: string) => {
    const story = items.find(
      (item) => item.id === itemId || item.externalId === itemId,
    );
    setItems((current) =>
      current.filter(
        (item) => item.id !== itemId && item.externalId !== itemId,
      ),
    );
    if (!story) return;
    try {
      await persistFeatured(story, false);
    } catch (error) {
      console.error("Failed to unfeature story", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(items.map((story) => persistFeatured(story, true)));
      alert("Featured content configuration saved.");
      navigate("/admin/featured");
    } catch (error) {
      console.error("Failed to save featured content", error);
      alert("Could not save featured content changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/featured")}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Featured</span>
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 h-12 bg-lemon-muted text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-lemon-muted/20 disabled:opacity-60 disabled:hover:scale-100"
        >
          <Save size={20} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 italic text-center">
              Featured Sections
            </h3>
            <div className="space-y-2">
              {FEATURED_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left ${
                    activeSection === section.id
                      ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <section.icon size={18} />
                  <span className="font-bold text-sm tracking-tight">
                    {section.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 italic text-center">
              Add Content
            </h3>
            <div className="relative mb-6">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                size={16}
              />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-lemon-muted/50"
              />
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {availableStories.slice(0, 10).map((story: any) => (
                <div
                  key={story.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={
                          story.coverImage ||
                          story.cover ||
                          "https://placehold.co/100x150"
                        }
                        alt={story.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs truncate">
                        {story.title}
                      </p>
                      <p className="text-[10px] font-black uppercase text-white/30 truncate">
                        by @
                        {story.creator?.username ||
                          story.creatorUsername ||
                          "unknown"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => void addItem(story)}
                    className="w-8 h-8 rounded-lg bg-lemon-muted text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    title="Feature this story"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
              {availableStories.length === 0 && (
                <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-white/30 text-xs font-bold">
                  No published stories match this search.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="p-10 bg-ink-deep border border-white/5 rounded-[40px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-display font-black tracking-tight uppercase italic mb-2">
                  {FEATURED_SECTIONS.find((s) => s.id === activeSection)?.label}
                </h2>
                <p className="text-white/40 font-bold">
                  Drag and drop to reorder items in this section.
                </p>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${previewMode === "mobile" ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20" : "text-white/40 hover:text-white"}`}
                >
                  <Smartphone size={20} />
                </button>
                <button
                  onClick={() => setPreviewMode("tablet")}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${previewMode === "tablet" ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20" : "text-white/40 hover:text-white"}`}
                >
                  <Tablet size={20} />
                </button>
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${previewMode === "desktop" ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20" : "text-white/40 hover:text-white"}`}
                >
                  <Monitor size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Reorder.Group
                axis="y"
                values={items}
                onReorder={setItems}
                className="space-y-4"
              >
                {items.map((item) => (
                  <Reorder.Item
                    key={item.id || item.externalId}
                    value={item}
                    className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors group"
                  >
                    <GripVertical
                      size={20}
                      className="text-white/10 group-hover:text-white/30"
                    />
                    <div className="w-16 h-20 bg-white/10 rounded-xl overflow-hidden shrink-0 shadow-lg">
                      <img
                        src={
                          item.coverImage ||
                          item.cover ||
                          "https://placehold.co/100x150"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-black">{item.title}</h4>
                      <p className="text-sm font-bold text-lemon-muted">
                        @
                        {item.creator?.username ||
                          item.creatorUsername ||
                          "unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() =>
                          void removeItem(item.id || item.externalId)
                        }
                        className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-red-400 hover:text-white flex items-center justify-center transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[40px]">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Layout size={40} className="text-white/20" />
                  </div>
                  <p className="text-xl font-display font-black text-white/30 tracking-tight uppercase italic mb-2">
                    Section is empty
                  </p>
                  <p className="text-white/20 font-bold text-center max-w-sm">
                    Use the search panel on the left to add items to the{" "}
                    {activeSection} section.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-10 bg-ink-deep border border-white/5 rounded-[40px]">
            <div className="flex items-center gap-2 mb-8">
              <Eye size={20} className="text-lemon-muted" />
              <h3 className="text-lg font-display font-black tracking-tight uppercase italic">
                Live Section Metadata
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">
                    Display Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Explosive Trending"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">
                    Max Display Count
                  </label>
                  <select className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold focus:outline-none appearance-none">
                    <option>5 Items</option>
                    <option>10 Items</option>
                    <option>Unlimited</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">
                    Section Background
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" />
                    <div className="w-14 h-14 rounded-2xl bg-lemon-muted/10 border border-lemon-muted/20 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" />
                    <div className="w-14 h-14 rounded-2xl bg-purple-400/10 border border-purple-400/20 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" />
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center font-bold text-xs text-white/40">
                      Custom
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">
                    Animation Style
                  </label>
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                    {["Stagger", "Fade", "Slide", "None"].map((anim) => (
                      <button
                        key={anim}
                        className="px-4 py-3 h-14 whitespace-nowrap bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:border-lemon-muted transition-colors"
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {id && (
            <div className="p-4 rounded-2xl border border-white/5 bg-white/5 text-xs text-white/40 font-bold">
              Editing saved view id: {id}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
