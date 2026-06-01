import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronLeft,
  Clock,
  CreditCard,
  Download,
  History,
  MoreVertical,
  Receipt,
  Shield,
  XCircle,
} from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import { convex } from '../../../lib/convex';
import { useApp } from '../../../contexts/AppContext';

type PaymentDetail = {
  id: string;
  userId: string;
  username: string;
  email?: string | null;
  avatar?: string | null;
  type: string;
  rawType: string;
  amount: number;
  grantedAmount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  date: string;
  reference: string;
  provider?: string | null;
  providerPayload?: any;
  metadata?: any;
  totalSpend: number;
  history: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    date: string;
    reference: string;
  }>;
};

const formatNaira = (value: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(value);

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: value, time: 'Not available' };
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
};

const statusClass = (status: PaymentDetail['status']) => {
  if (status === 'success') return 'bg-green-400/10 text-green-400 border-green-400/20';
  if (status === 'failed') return 'bg-red-400/10 text-red-400 border-red-400/20';
  if (status === 'refunded') return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
  return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
};

export default function AdminPaymentDetail() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { adminSession } = useApp();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayment = async () => {
    if (!paymentId || !convex) {
      setError('Payment details are not available in this environment.');
      setLoading(false);
      return;
    }

    try {
      const result = await convex.query(api.admin.paymentDetail, { paymentId });
      setPayment(result as PaymentDetail | null);
      setError(result ? null : 'Payment not found.');
    } catch (loadError) {
      console.error('Failed to load payment detail', loadError);
      setError('Unable to load this payment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const handleStatusChange = async (status: PaymentDetail['status']) => {
    if (!payment || !convex) return;
    try {
      await convex.mutation(api.admin.updatePaymentStatus, {
        paymentId: payment.id as any,
        status,
        adminEmail: adminSession?.email,
      });
      await loadPayment();
    } catch (statusError) {
      console.error('Failed to update payment status', statusError);
      alert('Unable to update payment status.');
    }
  };

  const handleExport = () => {
    if (!payment) return;
    const receipt = [
      ['Field', 'Value'],
      ['Transaction ID', payment.id],
      ['Reference', payment.reference],
      ['User', payment.username],
      ['Email', payment.email || ''],
      ['Type', payment.rawType],
      ['Amount NGN', payment.amount],
      ['Status', payment.status],
      ['Provider', payment.provider || ''],
      ['Date', payment.date],
    ];
    const csv = receipt.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `lemonade-receipt-${payment.reference}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-20 text-center text-white/30 font-black uppercase tracking-widest">Loading live payment detail...</div>;
  }

  if (error || !payment) {
    return (
      <div className="space-y-8">
        <button onClick={() => navigate('/admin/payments')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          Back to Payments
        </button>
        <div className="p-20 bg-ink-deep border border-white/5 rounded-[40px] text-center text-red-400 font-black uppercase tracking-widest">
          {error || 'Payment not found.'}
        </div>
      </div>
    );
  }

  const dateTime = formatDateTime(payment.date);
  const grantedLabel = payment.rawType === 'wallet_topup'
    ? `${payment.grantedAmount.toLocaleString()} Lemons`
    : payment.rawType.replace(/_/g, ' ');

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/payments')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Payments</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
          >
            <Download size={18} />
            Export Receipt
          </button>
          {payment.status !== 'success' && (
            <button
              onClick={() => handleStatusChange('success')}
              className="px-6 h-12 bg-green-400 text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Resolve Transaction
            </button>
          )}
          <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
                  <Receipt size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black tracking-tight uppercase italic">Transaction Detail</h2>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30">Ref: {payment.reference}</p>
                </div>
              </div>
              <p className={`text-sm font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusClass(payment.status)}`}>
                {payment.status}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Transaction Type</p>
                  <p className="text-lg font-black capitalize">{payment.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Amount Charged</p>
                  <p className="text-3xl font-display font-black italic text-lemon-muted">{formatNaira(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Items Granted</p>
                  <p className="font-bold flex items-center gap-2">
                    <span className="w-5 h-5 bg-lemon-muted text-black rounded-full flex items-center justify-center text-[10px] font-black">L</span>
                    {grantedLabel}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Date & Time</p>
                  <p className="font-bold text-sm">{dateTime.date} at {dateTime.time}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-white/40" />
                    <p className="font-bold text-sm tracking-tight">{payment.provider || 'Internal wallet'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Bank Reference</p>
                  <p className="font-mono text-[10px] text-white/40 tracking-wider break-all">{payment.reference}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Internal Notes</p>
              <p className="text-sm font-medium italic text-white/60">
                Status reviewed from Convex transaction records. Provider metadata is retained on the payment record when available.
              </p>
            </div>
          </div>

          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-lemon-muted" />
                <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Associated User</h3>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                {payment.avatar ? (
                  <img src={payment.avatar} alt={payment.username} className="w-14 h-14 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-lemon-muted flex items-center justify-center text-black font-black text-xl">
                    {payment.username[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-black text-lg">@{payment.username}</p>
                  <p className="text-sm font-bold text-white/40">{payment.email || 'No email on file'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black uppercase text-white/30">Total Spend</p>
                  <p className="font-black text-green-400">{formatNaira(payment.totalSpend)}</p>
                </div>
                <Link to={`/admin/users/${payment.userId}`} className="w-12 h-12 bg-white/5 hover:bg-white text-black rounded-2xl flex items-center justify-center transition-all">
                  <ArrowUpRight size={24} className="group-hover:text-black text-white/40" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 italic">Support Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatusChange('failed')}
                className="w-full py-4 bg-white/5 hover:bg-red-400/10 hover:text-red-400 rounded-2xl border border-white/5 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                Mark Failed
              </button>
              <button
                onClick={() => handleStatusChange('refunded')}
                className="w-full py-4 bg-white/5 hover:bg-orange-400/10 hover:text-orange-400 rounded-2xl border border-white/5 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
              >
                <Shield size={16} />
                Mark Refunded
              </button>
              <a
                href={payment.email ? `mailto:${payment.email}?subject=Lemonade payment ${payment.reference}` : undefined}
                className="block w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 text-center"
              >
                Contact User
              </a>
            </div>
          </div>

          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <History size={20} className="text-lemon-muted" />
                <h3 className="text-lg font-display font-black tracking-tight uppercase italic">User History</h3>
              </div>
            </div>
            <div className="space-y-4">
              {payment.history.length > 0 ? payment.history.map((trx) => (
                <div key={trx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 border-dashed">
                  <div>
                    <p className="text-sm font-bold capitalize">{trx.type}</p>
                    <p className="text-[9px] font-black uppercase text-white/30">{trx.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white/80">{formatNaira(trx.amount)}</p>
                    <p className="text-[9px] font-black uppercase text-white/30 text-right">{formatDateTime(trx.date).date}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs font-bold text-white/30 italic">No other transactions found for this user.</p>
              )}
            </div>
          </div>

          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={20} className="text-lemon-muted" />
              <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Log</h3>
            </div>
            <div className="text-[10px] font-bold space-y-3">
              <p className="text-white/40"><span className="text-white/60">Created:</span> {dateTime.date} at {dateTime.time}</p>
              <p className="text-white/40"><span className="text-white/60">Provider:</span> {payment.provider || 'internal'}</p>
              <p className="text-white/40"><span className="text-white/60">Current status:</span> {payment.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
