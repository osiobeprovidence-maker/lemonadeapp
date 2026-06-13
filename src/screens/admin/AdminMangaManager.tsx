import React, { useCallback, useEffect, useState } from 'react';
import {
  Search, Download, RefreshCw, List, Clock, AlertTriangle, CheckCircle2, XCircle,
  Loader2, ExternalLink, BookOpen, Star, Heart, Eye, Globe, User, FileText,
  Layers, Filter, Upload, Database, Trash2, ChevronDown, Zap, Archive, Send,
  Edit3, EyeOff, MoreHorizontal, Bookmark, Tag,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { convex } from '../../lib/convex';
import { api } from '../../../convex/_generated/api';
import type { Doc } from '../../../convex/_generated/dataModel';

type MangaDoc = Doc<"manga">;
type TabId = "import" | "draft" | "published" | "archived" | "history";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "import", label: "Import Manga", icon: Download },
  { id: "draft", label: "Draft Queue", icon: FileText },
  { id: "published", label: "Published", icon: Eye },
  { id: "archived", label: "Archived", icon: Archive },
  { id: "history", label: "Import History", icon: Clock },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const SOURCE_BADGE: Record<string, string> = {
  anilist: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  mangadex: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return iso; }
}

export default function AdminMangaManager() {
  const [tab, setTab] = useState<TabId>("import");
  const [importing, setImporting] = useState<string | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<"anilist" | "mangadex">("anilist");

  const [mangaList, setMangaList] = useState<MangaDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const [logs, setLogs] = useState<any[]>([]);
  const [editModal, setEditModal] = useState<{ manga: MangaDoc; field: string; value: string } | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSource, setFilterSource] = useState<string>("");
  const [filterGenre, setFilterGenre] = useState<string>("");

  const loadManga = useCallback(async (status?: string) => {
    if (!convex) return;
    setLoading(true);
    try {
      const s = status || (tab === "draft" ? "draft" : tab === "published" ? "published" : tab === "archived" ? "archived" : undefined);
      const items = await convex.query(api.manga.list, { status: s as any, limit: 200 });
      setMangaList(items);
    } catch {}
    setLoading(false);
  }, [tab]);

  const loadLogs = useCallback(async () => {
    if (!convex) return;
    try {
      const items = await convex.query(api.manga.listImportLogs, { limit: 100 });
      setLogs(items);
    } catch {}
  }, []);

  useEffect(() => {
    if (tab === "history") loadLogs();
    else if (tab !== "import") loadManga();
  }, [tab, loadManga, loadLogs]);

  // ─── Search ────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!convex || !searchQuery.trim()) return;
    setSearching(true);
    try {
      if (selectedProvider === "anilist") {
        const results = await convex.action(api.manga.searchAnilist, { search: searchQuery, limit: 20 });
        setSearchResults(results);
      } else {
        const results = await convex.action(api.manga.searchMangaDex, { search: searchQuery, limit: 20 });
        setSearchResults(results);
      }
    } catch {}
    setSearching(false);
  };

  // ─── Single Import ─────────────────────────────────────────────────
  const handleImportManga = async (id: string) => {
    if (!convex) return;
    setImporting(id);
    try {
      if (selectedProvider === "anilist") {
        await convex.action(api.manga.importFromAnilist, { externalId: id });
      } else {
        await convex.action(api.manga.importFromMangaDex, { externalId: id });
      }
    } catch {}
    setImporting(null);
  };

  // ─── Bulk Import ───────────────────────────────────────────────────
  const handleBulkImport = async (query: string) => {
    if (!convex) return;
    setBulkImporting(true);
    try {
      if (selectedProvider === "anilist") {
        await convex.action(api.manga.bulkImportFromAnilist, { query, limit: 10 });
      } else {
        await convex.action(api.manga.bulkImportFromMangaDex, { query, limit: 10 });
      }
    } catch {}
    setBulkImporting(false);
  };

  // ─── Bulk Actions ──────────────────────────────────────────────────
  const handleBulkPublish = async () => {
    if (!convex || !selected.size) return;
    await convex.mutation(api.manga.bulkPublish, { ids: [...selected] as any });
    setSelected(new Set());
    loadManga();
  };

  const handleBulkArchive = async () => {
    if (!convex || !selected.size) return;
    await convex.mutation(api.manga.bulkArchive, { ids: [...selected] as any });
    setSelected(new Set());
    loadManga();
  };

  const handleBulkDelete = async () => {
    if (!convex || !selected.size || !confirm(`Delete ${selected.size} manga?`)) return;
    await convex.mutation(api.manga.bulkDelete, { ids: [...selected] as any });
    setSelected(new Set());
    loadManga();
  };

  // ─── Single Actions ────────────────────────────────────────────────
  const handleAction = async (id: string, action: "publish" | "unpublish" | "archive" | "delete") => {
    if (!convex) return;
    if (action === "delete" && !confirm("Delete this manga?")) return;
    const fn = action === "publish" ? api.manga.publish : action === "unpublish" ? api.manga.unpublish : action === "archive" ? api.manga.archive : api.manga.remove;
    await convex.mutation(fn, { id: id as any });
    loadManga();
  };

  // ─── Quick Edit ────────────────────────────────────────────────────
  const handleQuickEdit = async () => {
    if (!convex || !editModal) return;
    const { manga, field, value } = editModal;
    await convex.mutation(api.manga.update, { id: manga._id as any, [field]: value } as any);
    setEditModal(null);
    loadManga();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredManga = mangaList.filter((m) => {
    if (filterSource && m.source !== filterSource) return false;
    if (filterGenre && !m.genres.some((g) => g.toLowerCase().includes(filterGenre.toLowerCase()))) return false;
    return true;
  });

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">
            Manga Manager
          </h2>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">
            Import, review & publish manga from AniList and MangaDex
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-ink-deep/50 p-1 rounded-xl border border-white/5 overflow-x-auto hide-scrollbar">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setSelected(new Set()); }}
              className={cn("shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors",
                tab === t.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              )}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ════════════ TAB: Import ════════════ */}
      {tab === "import" && (
        <div className="space-y-6">
          {/* Provider Select + Bulk Buttons */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-1 bg-ink-deep p-1 rounded-xl border border-white/5">
              <button onClick={() => setSelectedProvider("anilist")}
                className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  selectedProvider === "anilist" ? "bg-blue-500/20 text-blue-400" : "text-white/40 hover:text-white"
                )}>AniList</button>
              <button onClick={() => setSelectedProvider("mangadex")}
                className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  selectedProvider === "mangadex" ? "bg-purple-500/20 text-purple-400" : "text-white/40 hover:text-white"
                )}>MangaDex</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleBulkImport("trending")} disabled={bulkImporting}
                className="flex items-center gap-2 px-5 h-10 bg-lemon-muted/10 text-lemon-muted rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-lemon-muted hover:text-black transition-all disabled:opacity-40"
              >{bulkImporting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Trending</button>
              <button onClick={() => handleBulkImport("popular")} disabled={bulkImporting}
                className="flex items-center gap-2 px-5 h-10 bg-lemon-muted/10 text-lemon-muted rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-lemon-muted hover:text-black transition-all disabled:opacity-40"
              ><Star size={14} /> Popular</button>
              <button onClick={() => handleBulkImport("latest")} disabled={bulkImporting}
                className="flex items-center gap-2 px-5 h-10 bg-lemon-muted/10 text-lemon-muted rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-lemon-muted hover:text-black transition-all disabled:opacity-40"
              ><Clock size={14} /> Latest</button>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={`Search ${selectedProvider === "anilist" ? "AniList" : "MangaDex"} by title...`}
                className="w-full bg-ink-deep border border-white/5 rounded-xl pl-11 pr-4 h-12 text-white font-bold text-sm focus:outline-none focus:border-lemon-muted/50 transition-all"
              />
            </div>
            <button onClick={handleSearch} disabled={searching || !searchQuery.trim()}
              className="flex items-center gap-2 px-6 h-12 bg-lemon-muted text-black rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-40 transition-all"
            >{searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Search</button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">{searchResults.length} results</p>
              <div className="grid gap-3">
                {searchResults.map((r) => {
                  const isBusy = importing === (r.id || r._id);
                  const cover = r.coverImage || r.coverImage?.extraLarge || r.coverImage?.large;
                  return (
                    <div key={r.id || r._id} className="bg-ink-deep border border-white/5 rounded-2xl p-4 flex gap-4 items-center hover:border-white/10 transition-all">
                      <div className="w-12 h-16 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0">
                        <img src={cover || "https://placehold.co/200x280?text=N"} alt={r.title || r.title?.romaji} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{r.title || r.title?.romaji || "Untitled"}</h4>
                        {r.title?.english && <p className="text-xs text-white/30 truncate">{r.title.english}</p>}
                        {r.genres?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {r.genres.slice(0, 4).map((g: any) => (
                              <span key={g} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{typeof g === 'string' ? g : g?.name?.en || g}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.averageScore != null && (
                          <span className="text-xs font-black text-yellow-400">{(r.averageScore / 10).toFixed(1)}</span>
                        )}
                        <button onClick={() => handleImportManga(r.id || r._id)} disabled={isBusy}
                          className="flex items-center gap-1.5 px-4 h-9 bg-lemon-muted text-black rounded-lg font-black uppercase tracking-widest text-[10px] disabled:opacity-40 transition-all"
                        >{isBusy ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Import</button>
                        {(r.siteUrl || r.id) && (
                          <a href={r.siteUrl || `https://anilist.co/manga/${r.id}`} target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                          ><ExternalLink size={14} /></a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ Tabs: Draft / Published / Archived ════════════ */}
      {tab !== "import" && tab !== "history" && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 bg-ink-deep p-1 rounded-lg border border-white/5">
              <button onClick={() => setFilterSource("")}
                className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  !filterSource ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                )}>All Sources</button>
              <button onClick={() => setFilterSource("anilist")}
                className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  filterSource === "anilist" ? "bg-blue-500/20 text-blue-400" : "text-white/40 hover:text-white"
                )}>AniList</button>
              <button onClick={() => setFilterSource("mangadex")}
                className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  filterSource === "mangadex" ? "bg-purple-500/20 text-purple-400" : "text-white/40 hover:text-white"
                )}>MangaDex</button>
            </div>
            <input placeholder="Filter by genre..." value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}
              className="w-40 bg-ink-deep border border-white/5 rounded-lg px-3 h-9 text-white text-xs font-bold focus:outline-none focus:border-white/20"
            />
            <div className="flex-1" />
            {/* Bulk mode toggle */}
            <button onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
              className={cn("flex items-center gap-2 px-4 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                bulkMode ? "bg-white/10 text-white border-white/20" : "bg-transparent text-white/40 border-white/5 hover:border-white/20"
              )}><Layers size={14} /> Bulk</button>
          </div>

          {/* Bulk action bar */}
          {bulkMode && selected.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-ink-deep border border-white/10 rounded-xl">
              <span className="text-xs font-bold text-white/60 mr-2">{selected.size} selected</span>
              <button onClick={handleBulkPublish} className="flex items-center gap-1.5 px-3 h-8 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"><Send size={12} /> Publish</button>
              <button onClick={handleBulkArchive} className="flex items-center gap-1.5 px-3 h-8 bg-gray-500/10 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-500 hover:text-white transition-all"><Archive size={12} /> Archive</button>
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 h-8 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"><Trash2 size={12} /> Delete</button>
            </div>
          )}

          {/* Manga Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-white/20" /></div>
          ) : filteredManga.length === 0 ? (
            <div className="py-20 text-center text-white/30 font-bold"><p>No manga found in this queue.</p></div>
          ) : (
            <div className="grid gap-4">
              {filteredManga.map((m) => (
                <div key={m._id} className={cn("bg-ink-deep border rounded-2xl p-4 flex gap-4 items-start transition-all",
                  selected.has(m._id) ? "border-lemon-muted/50 bg-lemon-muted/5" : "border-white/5 hover:border-white/10"
                )}>
                  {/* Checkbox */}
                  {bulkMode && (
                    <input type="checkbox" checked={selected.has(m._id)} onChange={() => toggleSelect(m._id)}
                      className="mt-1 w-4 h-4 rounded accent-lemon-muted"
                    />
                  )}

                  {/* Cover */}
                  <div className="w-14 h-20 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0">
                    <img src={m.coverImage || "https://placehold.co/200x280?text=N"} alt={m.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{m.title}</h4>
                        {m.alternativeTitle && <p className="text-xs text-white/30 truncate">{m.alternativeTitle}</p>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", STATUS_BADGE[m.status])}>{m.status}</span>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", SOURCE_BADGE[m.source] || "bg-white/5 text-white/40 border-white/10")}>{m.source}</span>
                          {m.author && <span className="text-[9px] text-white/40 flex items-center gap-1"><User size={10} /> {m.author}</span>}
                          {m.releaseYear && <span className="text-[9px] text-white/30">{m.releaseYear}</span>}
                          {m.rating && <span className="text-[9px] font-black text-yellow-400">{m.rating.toFixed(1)}</span>}
                        </div>
                        {m.genres.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {m.genres.slice(0, 5).map((g) => (
                              <span key={g} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{g}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.status === "draft" && (
                          <button onClick={() => handleAction(m._id, "publish")} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all" title="Publish"><Send size={12} /></button>
                        )}
                        {m.status === "published" && (
                          <button onClick={() => handleAction(m._id, "unpublish")} className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-white flex items-center justify-center transition-all" title="Unpublish"><EyeOff size={12} /></button>
                        )}
                        {m.status !== "archived" && (
                          <button onClick={() => handleAction(m._id, "archive")} className="w-8 h-8 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500 hover:text-white flex items-center justify-center transition-all" title="Archive"><Archive size={12} /></button>
                        )}
                        {m.status !== "draft" && (
                          <button onClick={() => handleAction(m._id, m.status === "archived" ? "publish" : "unpublish")} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all" title={m.status === "archived" ? "Restore & Publish" : "Unpublish"}>
                            {m.status === "archived" ? <RefreshCw size={12} /> : <EyeOff size={12} />}
                          </button>
                        )}
                        <button onClick={() => handleAction(m._id, "delete")} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all" title="Delete"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB: History ════════════ */}
      {tab === "history" && (
        <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-white/30 font-bold">No import history yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Title</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Provider</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Action</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-4 text-[11px] font-bold text-white/30">{formatDate(log.createdAt)}</td>
                      <td className="p-4 text-sm font-bold text-white">{log.title || "—"}</td>
                      <td className="p-4">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", SOURCE_BADGE[log.provider] || "bg-white/5 text-white/40 border-white/10")}>{log.provider}</span>
                      </td>
                      <td className="p-4 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-white/40">{log.action?.replace(/_/g, " ")}</td>
                      <td className="p-4">
                        {log.status === "success" ? <span className="flex items-center gap-1 text-green-400 text-[10px] font-black uppercase tracking-widest"><CheckCircle2 size={12} /> Success</span>
                          : log.status === "failed" ? <span className="flex items-center gap-1 text-red-400 text-[10px] font-black uppercase tracking-widest"><XCircle size={12} /> Failed</span>
                          : <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-black uppercase tracking-widest"><AlertTriangle size={12} /> Skipped</span>}
                      </td>
                      <td className="p-4 text-xs text-white/50">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
