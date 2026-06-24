import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { convex } from '../../lib/convex';
import { api } from '../../../convex/_generated/api';
import { FileText, Clock, CheckCircle, XCircle, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

type Submission = {
  _id: string;
  name: string;
  mangaTitle: string;
  genre: string;
  status: string;
  offerPrice?: number;
  adminNotes?: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  pending: 'Pending Review',
  reviewing: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Not Selected',
  offered: 'Offer Received',
  licensed: 'Licensed',
};

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  reviewing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  offered: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  licensed: 'bg-lemon-muted/10 text-lemon-muted border-lemon-muted/20',
};

export default function StudioSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!convex) return;
    setLoading(true);
    convex.query(api.admin.getSubmissionsByEmail, { email: '' })
      .then((data) => setSubmissions(data as any))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOfferAction = async (id: string, action: 'accept' | 'reject') => {
    if (!convex) return;
    setActionLoading(id);
    try {
      await convex.mutation(api.admin.updateSubmissionStatus, {
        id: id as any,
        status: action === 'accept' ? 'licensed' : 'rejected',
      });
      setSubmissions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: action === 'accept' ? 'licensed' : 'rejected' } : s)),
      );
    } catch (err) {
      console.error('Failed to update', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">My Submissions</h2>
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Track your manga submissions</p>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/20 font-bold text-lg mb-2">No submissions yet</p>
          <p className="text-white/10 text-sm">Submit your manga from the Creators page to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s._id} className="bg-ink-deep border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-display font-black italic">{s.mangaTitle}</h3>
                  <p className="text-sm text-white/50 font-medium">{s.genre}</p>
                </div>
                <span className={cn("self-start text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border", statusStyles[s.status])}>
                  {statusLabels[s.status] || s.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-white/40 font-medium">
                <span>Submitted {new Date(s.createdAt).toLocaleDateString()}</span>
              </div>

              {s.adminNotes && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1.5">Admin Notes</p>
                  <p className="text-sm text-white/60 font-medium">{s.adminNotes}</p>
                </div>
              )}

              {s.status === 'offered' && s.offerPrice && (
                <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={18} className="text-purple-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-purple-500">Offer Received</span>
                  </div>
                  <p className="text-2xl font-display font-black italic mb-1">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(s.offerPrice)}
                  </p>
                  <p className="text-xs text-white/40 font-medium mb-4">Review the offer below and respond.</p>
                  <div className="flex gap-3">
                    <Button size="sm" variant="primary" onClick={() => handleOfferAction(s._id, 'accept')} disabled={actionLoading === s._id}>
                      {actionLoading === s._id ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <CheckCircle size={14} className="mr-1.5" />}
                      Accept Offer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleOfferAction(s._id, 'reject')} disabled={actionLoading === s._id} className="!border-red-500/30 !text-red-400">
                      <XCircle size={14} className="mr-1.5" />
                      Decline
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {s.status === 'pending' && <Clock size={14} className="text-yellow-500" />}
                {s.status === 'reviewing' && <Clock size={14} className="text-blue-500" />}
                {s.status === 'accepted' && <CheckCircle size={14} className="text-green-500" />}
                {s.status === 'rejected' && <XCircle size={14} className="text-red-500" />}
                <span className="text-xs text-white/30">
                  {s.status === 'pending' && 'Awaiting review by our team'}
                  {s.status === 'reviewing' && 'Our team is currently reviewing your submission'}
                  {s.status === 'accepted' && 'Your submission has been accepted'}
                  {s.status === 'rejected' && 'Your submission was not selected at this time'}
                  {s.status === 'offered' && 'An offer has been extended to you'}
                  {s.status === 'licensed' && 'Your manga has been licensed!'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
