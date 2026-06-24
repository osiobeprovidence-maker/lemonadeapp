import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { convex } from '../../lib/convex';
import { api } from '../../../convex/_generated/api';

type Submission = {
  _id: string;
  _creationTime: number;
  name: string;
  email: string;
  mangaTitle: string;
  genre: string;
  status: string;
  createdAt: string;
};

const statusFilters = ['all', 'pending', 'reviewing', 'accepted', 'rejected', 'offered', 'licensed'];

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  reviewing: 'bg-blue-500/10 text-blue-500',
  accepted: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500',
  offered: 'bg-purple-500/10 text-purple-500',
  licensed: 'bg-lemon-muted/10 text-lemon-muted',
};

export default function AdminSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    if (!convex) return;
    setLoading(true);
    convex.query(api.admin.listSubmissions, { status, search: search || undefined })
      .then(setSubmissions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  const handleSearch = () => {
    setLoading(true);
    convex.query(api.admin.listSubmissions, { status, search: search || undefined })
      .then(setSubmissions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Submissions</h2>
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Manage creator manga submissions</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lemon-muted transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email or manga title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-14 pr-6 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-lemon-muted/50 transition-all"
          />
        </div>
        <div className="flex bg-ink-deep p-1.5 rounded-2xl border border-white/5 gap-1 overflow-x-auto scrollbar-hide">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className={cn(
                "px-4 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                status === f ? 'bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10' : 'text-white/40 hover:text-white',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/30 font-bold">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/20 font-bold">No submissions found</p>
        </div>
      ) : (
        <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Creator</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Manga</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Genre</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Submitted</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map((s) => (
                  <tr key={s._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="p-5">
                      <div>
                        <p className="font-bold text-sm text-white">{s.name}</p>
                        <p className="text-xs text-white/30">{s.email}</p>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-sm text-white">{s.mangaTitle}</p>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-bold text-white/50">{s.genre}</span>
                    </td>
                    <td className="p-5">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded", statusStyles[s.status] || 'bg-white/5 text-white/50')}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-xs text-white/40">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => navigate(`/admin/submissions/${s._id}`)}
                        className="w-10 h-10 rounded-xl bg-lemon-muted/10 text-lemon-muted flex items-center justify-center hover:bg-lemon-muted hover:text-black transition-all ml-auto"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
