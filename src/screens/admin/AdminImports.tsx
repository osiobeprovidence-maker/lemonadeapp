import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  RefreshCw,
  List,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  BookOpen,
  Star,
  Heart,
  Eye,
  Globe,
  User,
  FileText,
  Layers,
  Filter,
  Upload,
  Database,
  Trash2,
  ChevronRight,
  ChevronDown,
  Zap,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { convex } from "../../lib/convex";
import { useApp } from "../../contexts/AppContext";
import { cn } from "../../lib/utils";

type SearchResult = {
  id: number;
  idMal?: number;
  title: { romaji: string; english?: string; native?: string };
  description: string;
  coverImage: { extraLarge?: string; large?: string; color?: string };
  bannerImage?: string;
  format: string;
  status: string;
  countryOfOrigin?: string;
  genres: string[];
  tags: { name: string; rank: number; isMediaSpoiler: boolean }[];
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  favourites?: number;
  chapters?: number;
  volumes?: number;
  source?: string;
  siteUrl?: string;
};

type ImportStats = {
  totalImported: number;
  byType: Record<string, number>;
  lastSync: { status: string; startedAt: string; completedAt?: string; itemsProcessed: number } | null;
  failedCount: number;
};

type ImportLogEntry = {
  _id: string;
  _creationTime: number;
  anilistId?: number;
  title?: string;
  action: string;
  status: string;
  message: string;
  createdAt: string;
};

type Tab = "search" | "imported" | "history" | "failed";

export default function AdminImports() {
  const [tab, setTab] = useState<Tab>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);
  const [bulkIds, setBulkIds] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [logs, setLogs] = useState<ImportLogEntry[]>([]);
  const [failedLogs, setFailedLogs] = useState<ImportLogEntry[]>([]);
  const [importedContent, setImportedContent] = useState<any[]>([]);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

  const loadStats = useCallback(async () => {
    if (!convex) return;
    try {
      const s = await convex.query(api.imports.getImportStats);
      setStats(s as any);
    } catch {}
  }, []);

  const loadLogs = useCallback(async () => {
    if (!convex) return;
    try {
      const [allLogs, fails] = await Promise.all([
        convex.query(api.imports.listImportLogs, { limit: 50 }),
        convex.query(api.imports.listFailedImports, { limit: 20 }),
      ]);
      setLogs(allLogs as any);
      setFailedLogs(fails as any);
    } catch {}
  }, []);

  const loadImported = useCallback(async () => {
    if (!convex) return;
    try {
      const items = await convex.query(api.externalContent.list, { limit: 100 });
      setImportedContent(items as any);
    } catch {}
  }, []);

  useEffect(() => {
    loadStats();
    loadLogs();
    loadImported();
  }, [loadStats, loadLogs, loadImported]);

  const handleSearch = async () => {
    if (!convex || !searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await convex.action(api.anilist.searchAnilist, {
        search: searchQuery.trim(),
        perPage: 20,
      });
      setSearchResults(result.media || []);
    } catch (error: any) {
      console.error("Search failed", error);
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (anilistId: number) => {
    if (!convex) return;
    setImporting(anilistId);
    try {
      await convex.action(api.imports.importFromAnilist, { anilistId });
      await Promise.all([loadStats(), loadLogs(), loadImported()]);
    } catch (error: any) {
      console.error("Import failed", error);
    } finally {
      setImporting(null);
    }
  };

  const handleBulkImport = async () => {
    if (!convex || !bulkIds.trim()) return;
    const ids = bulkIds
      .split(/[\s,]+/)
      .map((s) => parseInt(s))
      .filter((n) => !isNaN(n));
    if (!ids.length) return;

    setBulkImporting(true);
    try {
      await convex.action(api.imports.bulkImportFromAnilist, { anilistIds: ids });
      setBulkIds("");
      await Promise.all([loadStats(), loadLogs(), loadImported()]);
    } catch (error: any) {
      console.error("Bulk import failed", error);
    } finally {
      setBulkImporting(false);
    }
  };

  const handleResync = async (contentId: string) => {
    if (!convex) return;
    setSyncing((prev) => new Set(prev).add(contentId));
    try {
      await convex.action(api.imports.resyncFromAnilist, { contentId: contentId as any });
      await Promise.all([loadStats(), loadLogs(), loadImported()]);
    } catch (error: any) {
      console.error("Re-sync failed", error);
    } finally {
      setSyncing((prev) => {
        const next = new Set(prev);
        next.delete(contentId);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!convex || !confirm("Delete this imported content?")) return;
    try {
      await convex.mutation(api.externalContent.remove, { id: id as any });
      await Promise.all([loadStats(), loadImported()]);
    } catch {}
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const detectedType = (result: SearchResult): string => {
    const format = result.format || "";
    const country = result.countryOfOrigin || "";
    const source = result.source || "";
    const tags = (result.tags || []).map((t) => t.name?.toLowerCase());

    if (format === "NOVEL" || source === "LIGHT_NOVEL" || tags.includes("light novel")) return "novel";
    if (country === "KR") return "manhwa";
    if (country === "CN") return "manhua";
    return "manga";
  };

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      manga: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      manhwa: "bg-green-500/10 text-green-400 border-green-500/20",
      manhua: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      novel: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      comic: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    };
    return colors[type] || "bg-white/5 text-white/40 border-white/10";
  };

  const formatLabel = (fmt: string) => fmt?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "N/A";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">
            AniList Import Manager
          </h2>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">
            Import, manage & sync manga, manhwa, and novels from AniList
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 bg-ink-deep border border-white/5 rounded-[28px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
              <Database size={20} />
            </div>
          </div>
          <p className="text-3xl font-black">{stats?.totalImported ?? 0}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Total Imported</p>
        </div>
        <div className="p-6 bg-ink-deep border border-white/5 rounded-[28px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-3xl font-black">{stats?.byType?.manga ?? 0}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Manga</p>
        </div>
        <div className="p-6 bg-ink-deep border border-white/5 rounded-[28px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-3xl font-black">{stats?.byType?.manhwa ?? 0}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Manhwa</p>
        </div>
        <div className="p-6 bg-ink-deep border border-white/5 rounded-[28px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-3xl font-black">{stats?.byType?.novel ?? 0}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Novels</p>
        </div>
      </div>

      {/* Last Sync Info */}
      {stats?.lastSync && (
        <div className="flex items-center gap-3 px-6 py-4 bg-ink-deep border border-white/5 rounded-2xl">
          <Clock size={16} className="text-white/30" />
          <span className="text-xs font-bold text-white/40">
            Last sync: {formatDate(stats.lastSync.startedAt)} &middot;{" "}
            {stats.lastSync.itemsProcessed} items processed &middot;{" "}
            <span className={stats.lastSync.status === "completed" ? "text-green-400" : "text-red-400"}>
              {stats.lastSync.status}
            </span>
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-ink-deep p-1.5 rounded-2xl border border-white/5 gap-1 overflow-x-auto">
        {([
          { id: "search" as Tab, label: "Search AniList", icon: Search },
          { id: "imported" as Tab, label: "Imported", icon: List },
          { id: "history" as Tab, label: "History", icon: Clock },
          { id: "failed" as Tab, label: "Failed", icon: AlertTriangle },
        ]).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                tab === t.id
                  ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10"
                  : "text-white/40 hover:text-white",
              )}
            >
              <Icon size={16} />
              {t.label}
              {t.id === "failed" && failedLogs.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  {failedLogs.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ──────── TAB: Search ──────── */}
      {tab === "search" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lemon-muted transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search manga, manhwa, novels on AniList..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-14 pr-6 text-white font-bold focus:outline-none focus:border-lemon-muted/50 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="flex items-center gap-2 px-8 h-14 bg-lemon-muted text-black rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {searching ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Bulk Import */}
          <details className="bg-ink-deep border border-white/5 rounded-2xl">
            <summary className="flex items-center gap-3 p-6 cursor-pointer text-sm font-bold text-white/60 hover:text-white transition-colors">
              <Upload size={18} />
              Bulk Import by AniList IDs
              <ChevronDown size={16} className="ml-auto text-white/20" />
            </summary>
            <div className="px-6 pb-6 space-y-4">
              <p className="text-xs text-white/40 font-medium">
                Enter AniList IDs separated by commas, spaces, or new lines.
              </p>
              <textarea
                value={bulkIds}
                onChange={(e) => setBulkIds(e.target.value)}
                placeholder="e.g. 30000, 30125, 30205"
                rows={3}
                className="w-full bg-black/50 border border-white/5 rounded-xl p-4 text-white font-bold text-sm focus:outline-none focus:border-lemon-muted/50 transition-all resize-none"
              />
              <button
                onClick={handleBulkImport}
                disabled={bulkImporting || !bulkIds.trim()}
                className="flex items-center gap-2 px-6 h-12 bg-lemon-muted text-black rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-40 transition-all"
              >
                {bulkImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {bulkImporting ? "Importing..." : `Import ${bulkIds.trim() ? bulkIds.split(/[\s,]+/).filter(Boolean).length : 0} Titles`}
              </button>
            </div>
          </details>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                {searchResults.length} results
              </p>
              <div className="grid gap-4">
                {searchResults.map((result) => {
                  const type = detectedType(result);
                  const isImporting = importing === result.id;
                  return (
                    <div
                      key={result.id}
                      className="bg-ink-deep border border-white/5 rounded-3xl p-6 flex gap-6 hover:border-white/10 transition-all"
                    >
                      {/* Cover */}
                      <div className="w-20 h-28 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0">
                        <img
                          src={result.coverImage?.extraLarge || result.coverImage?.large || "https://placehold.co/200x280?text=No+Cover"}
                          alt={result.title?.romaji}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-lg leading-tight">
                              {result.title?.romaji || "Untitled"}
                            </h4>
                            {result.title?.english && (
                              <p className="text-sm text-white/40 font-medium mt-0.5">{result.title.english}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", typeBadge(type))}>
                                {type}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 text-white/40 rounded-full border border-white/5">
                                {formatLabel(result.format)}
                              </span>
                              {result.countryOfOrigin && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                  {result.countryOfOrigin}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Score & Actions */}
                          <div className="flex items-center gap-3 shrink-0">
                            {result.averageScore && (
                              <div className="text-center">
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Star size={14} fill="currentColor" />
                                  <span className="text-sm font-black">{(result.averageScore / 10).toFixed(1)}</span>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => handleImport(result.id)}
                              disabled={isImporting}
                              className="flex items-center gap-2 px-5 h-11 bg-lemon-muted text-black rounded-xl font-black uppercase tracking-widest text-[10px] disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                              {isImporting ? "..." : "Import"}
                            </button>
                            {result.siteUrl && (
                              <a
                                href={result.siteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-white/50 mt-3 line-clamp-2 leading-relaxed">
                          {result.description?.replace(/<[^>]*>/g, "") || "No description."}
                        </p>

                        {/* Genres */}
                        {result.genres?.length > 0 && (
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {result.genres.slice(0, 5).map((g) => (
                              <span key={g} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 text-white/40 rounded-full">
                                {g}
                              </span>
                            ))}
                            {result.genres.length > 5 && (
                              <span className="text-[9px] font-black text-white/20">+{result.genres.length - 5}</span>
                            )}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-white/30">
                          {result.chapters != null && <span>{result.chapters} chaps</span>}
                          {result.volumes != null && <span>{result.volumes} vols</span>}
                          {result.popularity != null && (
                            <span className="flex items-center gap-1">
                              <Heart size={10} /> {result.popularity.toLocaleString()}
                            </span>
                          )}
                          {result.favourites != null && (
                            <span className="flex items-center gap-1">
                              <Star size={10} /> {result.favourites.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────── TAB: Imported ──────── */}
      {tab === "imported" && (
        <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Title</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Type</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Format</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Score</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Popularity</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Chapters</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Synced</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {importedContent.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-white/30 font-bold">
                      No content imported yet. Search AniList to get started.
                    </td>
                  </tr>
                ) : (
                  importedContent.map((item) => (
                    <tr key={item._id} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-14 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0">
                            <img src={item.coverImage || "https://placehold.co/200x280?text=N"} alt={item.titleRomaji} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate">{item.titleRomaji}</p>
                            {item.titleEnglish && (
                              <p className="text-[11px] text-white/30 truncate">{item.titleEnglish}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", typeBadge(item.contentDetection))}>
                          {item.contentDetection}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-[11px] font-bold text-white/40">{formatLabel(item.format)}</span>
                      </td>
                      <td className="p-6">
                        {item.averageScore != null ? (
                          <span className="text-sm font-black text-yellow-400">{(item.averageScore / 10).toFixed(1)}</span>
                        ) : (
                          <span className="text-sm text-white/20">—</span>
                        )}
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-white/60">{item.popularity?.toLocaleString() || "—"}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-white/60">{item.chapterCount ?? "—"}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-bold text-white/30">
                          {item.lastSyncedAt ? formatDate(item.lastSyncedAt) : "Never"}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResync(item._id)}
                            disabled={syncing.has(item._id)}
                            className="w-9 h-9 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all disabled:opacity-40"
                            title="Re-sync with AniList"
                          >
                            {syncing.has(item._id) ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <RefreshCw size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="w-9 h-9 rounded-lg bg-white/5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────── TAB: History ──────── */}
      {tab === "history" && (
        <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Title</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Action</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-white/30 font-bold">
                      No import history yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-6">
                        <span className="text-[11px] font-bold text-white/30">{formatDate(log.createdAt)}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-white">{log.title || "—"}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                          {log.action?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-6">
                        {log.status === "success" ? (
                          <span className="flex items-center gap-1 text-green-400 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Success
                          </span>
                        ) : log.status === "failed" ? (
                          <span className="flex items-center gap-1 text-red-400 text-[10px] font-black uppercase tracking-widest">
                            <XCircle size={12} /> Failed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                            <AlertTriangle size={12} /> Skipped
                          </span>
                        )}
                      </td>
                      <td className="p-6">
                        <span className="text-xs text-white/50">{log.message}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────── TAB: Failed ──────── */}
      {tab === "failed" && (
        <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">AniList ID</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Action</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {failedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-white/30 font-bold">
                      No failed imports. Everything is running smoothly.
                    </td>
                  </tr>
                ) : (
                  failedLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-6">
                        <span className="text-[11px] font-bold text-white/30">{formatDate(log.createdAt)}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-white">{log.anilistId || "—"}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-xs text-red-400">{log.message}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
