import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, ExternalLink, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { convex } from '../../../lib/convex';
import { api } from '../../../../convex/_generated/api';

type Submission = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  mangaTitle: string;
  genre: string;
  synopsis: string;
  social?: string;
  portfolio?: string;
  chapterCount?: number;
  sampleFiles?: string[];
  status: string;
  offerPrice?: number;
  adminNotes?: string;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  reviewing: 'bg-blue-500/10 text-blue-500',
  accepted: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500',
  offered: 'bg-purple-500/10 text-purple-500',
  licensed: 'bg-lemon-muted/10 text-lemon-muted',
};

export default function AdminSubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!convex || !id) return;
    setLoading(true);
    convex.query(api.admin.getSubmission, { id: id as any })
      .then((data) => {
        setSubmission(data as any);
        setAdminNotes((data as any)?.adminNotes || '');
        setOfferPrice((data as any)?.offerPrice ? String((data as any).offerPrice) : '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!convex || !id) return;
    setSaving(true);
    try {
      await convex.mutation(api.admin.updateSubmissionStatus, {
        id: id as any,
        status: status as any,
        adminNotes: adminNotes || undefined,
        offerPrice: offerPrice ? parseInt(offerPrice, 10) : undefined,
      });
      setSubmission((prev) => prev ? { ...prev, status, adminNotes, offerPrice: offerPrice ? parseInt(offerPrice, 10) : undefined } : prev);
    } catch (err) {
      console.error('Failed to update', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-white/30 font-bold">Loading...</div>;
  }

  if (!submission) {
    return <div className="text-center py-20 text-white/30 font-bold">Submission not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/submissions')} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black italic">{submission.mangaTitle}</h2>
          <p className="text-white/40 text-sm font-medium">by {submission.name}</p>
        </div>
        <span className={cn("ml-auto text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded", statusStyles[submission.status])}>
          {submission.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-ink-deep border border-white/5 rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Creator Info</h3>
          <div>
            <p className="text-xs text-white/40">Name</p>
            <p className="font-bold">{submission.name}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Email</p>
            <p className="font-bold">{submission.email}</p>
          </div>
          {submission.phone && (
            <div>
              <p className="text-xs text-white/40">Phone</p>
              <p className="font-bold">{submission.phone}</p>
            </div>
          )}
        </div>

        <div className="bg-ink-deep border border-white/5 rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Manga Details</h3>
          <div>
            <p className="text-xs text-white/40">Genre</p>
            <p className="font-bold">{submission.genre}</p>
          </div>
          {submission.chapterCount && (
            <div>
              <p className="text-xs text-white/40">Chapters</p>
              <p className="font-bold">{submission.chapterCount}</p>
            </div>
          )}
          {submission.portfolio && (
            <div>
              <p className="text-xs text-white/40">Portfolio</p>
              <a href={submission.portfolio} target="_blank" rel="noopener noreferrer" className="font-bold text-lemon-muted hover:underline inline-flex items-center gap-1">
                Visit <ExternalLink size={14} />
              </a>
            </div>
          )}
          {submission.social && (
            <div>
              <p className="text-xs text-white/40">Social</p>
              <a href={submission.social} target="_blank" rel="noopener noreferrer" className="font-bold text-lemon-muted hover:underline inline-flex items-center gap-1">
                View <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="bg-ink-deep border border-white/5 rounded-3xl p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Synopsis</h3>
        <p className="text-sm text-white/70 leading-relaxed">{submission.synopsis}</p>
      </div>

      {submission.sampleFiles && submission.sampleFiles.length > 0 && (
        <div className="bg-ink-deep border border-white/5 rounded-3xl p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Sample Files</h3>
          <div className="space-y-2">
            {submission.sampleFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl">
                <FileText size={16} className="text-lemon-muted" />
                <span className="text-sm font-medium text-white/70">File {i + 1} (storageId: {file.slice(0, 12)}...)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-ink-deep border border-white/5 rounded-3xl p-6 space-y-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Admin Actions</h3>

        <div>
          <label className="block text-xs font-bold text-white/40 mb-2">Admin Notes</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full bg-black-core border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors resize-none"
            placeholder="Add internal notes about this submission..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-white/40 mb-2">Offer Price (NGN)</label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full h-12 bg-black-core border border-white/10 rounded-xl pl-10 pr-4 text-white text-sm font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
              placeholder="Enter offer amount"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button disabled={saving} onClick={() => updateStatus('reviewing')} variant="outline" size="sm">
            <Clock size={16} className="mr-1.5" /> Mark Reviewing
          </Button>
          <Button disabled={saving} onClick={() => updateStatus('offered')} variant="primary" size="sm">
            <DollarSign size={16} className="mr-1.5" /> Send Offer
          </Button>
          <Button disabled={saving} onClick={() => updateStatus('accepted')} variant="primary" size="sm">
            <CheckCircle size={16} className="mr-1.5" /> Accept
          </Button>
          <Button disabled={saving} onClick={() => updateStatus('rejected')} variant="outline" size="sm" className="!border-red-500/30 !text-red-400 hover:!bg-red-500/10">
            <XCircle size={16} className="mr-1.5" /> Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
