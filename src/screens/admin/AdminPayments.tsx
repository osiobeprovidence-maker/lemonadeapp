import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  MoreVertical,
  RotateCcw,
  User,
  Wallet,
  Zap,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';
import { api } from '../../../convex/_generated/api';
import { convex } from '../../lib/convex';

type PaymentFilter = 'all' | 'wallet' | 'premium' | 'unlocks' | 'support';

type PaymentRow = {
  id: string;
  userId: string;
  username: string;
  email?: string | null;
  type: 'wallet' | 'premium' | 'unlock' | 'support' | 'refund' | string;
  rawType: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  date: string;
  reference: string;
  provider?: string | null;
};

type PaymentsData = {
  stats: {
    totalRevenue: number;
    walletVolume: number;
    activePremium: number;
    pendingPayout: number;
  };
  transactions: PaymentRow[];
};

const formatNaira = (value: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(value);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusDotClass = (status: PaymentRow['status']) => {
  if (status === 'success') return 'bg-green-500';
  if (status === 'pending') return 'bg-orange-500 animate-pulse';
  if (status === 'refunded') return 'bg-blue-400';
  return 'bg-red-500 animate-pulse';
};

export default function AdminPayments() {
  const { adminSession } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    if (!convex) {
      setError('Convex is not configured for this environment.');
      setLoading(false);
      return;
    }

    try {
      const result = await convex.query(api.admin.payments, {});
      setData(result as PaymentsData);
      setError(null);
    } catch (loadError) {
      console.error('Failed to load payment data', loadError);
      setError('Unable to load live payment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const transactions = useMemo(() => {
    const rows = data?.transactions || [];
    if (filter === 'all') return rows;
    if (filter === 'unlocks') return rows.filter((tx) => tx.type === 'unlock');
    return rows.filter((tx) => tx.type === filter);
  }, [data?.transactions, filter]);

  const handleExport = () => {
    const rows = [
      ['User', 'Email', 'Type', 'Reference', 'Amount NGN', 'Status', 'Provider', 'Date'],
      ...transactions.map((tx) => [
        tx.username,
        tx.email || '',
        tx.rawType,
        tx.reference,
        tx.amount,
        tx.status,
        tx.provider || '',
        tx.date,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `owuuu-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefund = async (tx: PaymentRow) => {
    if (!convex || !confirm(`Mark transaction ${tx.reference} as refunded?`)) return;
    try {
      await convex.mutation(api.admin.updatePaymentStatus, {
        paymentId: tx.id as any,
        status: 'refunded',
        adminEmail: adminSession?.email,
      });
      await loadPayments();
    } catch (refundError) {
      console.error('Failed to update refund status', refundError);
      alert('Unable to mark this payment as refunded.');
    }
  };

  const handleVerify = async (tx: PaymentRow) => {
    if (!convex) return;
    try {
      await convex.mutation(api.admin.updatePaymentStatus, {
        paymentId: tx.id as any,
        status: 'success',
        adminEmail: adminSession?.email,
      });
      await loadPayments();
    } catch (verifyError) {
      console.error('Failed to verify payment', verifyError);
      alert('Unable to verify this payment.');
    }
  };

  const stats = [
    { label: 'Total Revenue', value: formatNaira(data?.stats.totalRevenue || 0), icon: DollarSign, color: 'text-green-500' },
    { label: 'Wallet Vol.', value: formatNaira(data?.stats.walletVolume || 0), icon: Wallet, color: 'text-blue-500' },
    { label: 'Premium Sub', value: `${data?.stats.activePremium || 0} Active`, icon: Zap, color: 'text-lemon-muted' },
    { label: 'Pending Payout', value: formatNaira(data?.stats.pendingPayout || 0), icon: CreditCard, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Financial Ops</h2>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Transaction audit and platform revenue tracking</p>
        </div>
        <button
          onClick={handleExport}
          className="h-12 px-6 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-ink-deep border border-white/5 rounded-[2rem] space-y-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-white/5', stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
              <h3 className="text-2xl font-display font-black">{loading ? '--' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex bg-ink-deep p-1.5 rounded-2xl border border-white/5 gap-1 overflow-x-auto scrollbar-hide w-fit">
        {(['all', 'wallet', 'premium', 'unlocks', 'support'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap',
              filter === f ? 'bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10' : 'text-white/40 hover:text-white',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">User Context</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Transaction Type</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Ref / ID</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Gross Amount</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/[0.01] transition-all group">
                <td className="p-6">
                  <p
                    className="font-bold text-white group-hover:text-lemon-muted transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/users/${tx.userId}`)}
                  >
                    @{tx.username}
                  </p>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{formatDate(tx.date)}</p>
                </td>
                <td className="p-6">
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border',
                    tx.type === 'premium' ? 'bg-lemon-muted/10 text-lemon-muted border-lemon-muted/20' :
                      tx.type === 'wallet' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-white/5 text-white/40 border-white/5',
                  )}>
                    {tx.type}
                  </span>
                </td>
                <td className="p-6">
                  <span className="font-mono text-xs text-white/30">{tx.reference}</span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-bold text-sm', tx.status === 'failed' ? 'text-red-500' : 'text-white')}>
                      {formatNaira(tx.amount ?? 0)}
                    </span>
                    <div className={cn('w-1.5 h-1.5 rounded-full', statusDotClass(tx.status))} />
                  </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/payments/${tx.id}`)}
                      className="w-10 h-10 rounded-xl bg-lemon-muted/10 text-lemon-muted flex items-center justify-center hover:bg-lemon-muted hover:text-black transition-all"
                      title="View Receipt"
                    >
                      <FileText size={18} />
                    </button>
                    <div className="relative group/menu">
                      <button className="w-10 h-10 rounded-xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                        <MoreVertical size={18} />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-ink-deep border border-white/10 rounded-2xl shadow-2xl z-50 py-2 opacity-0 scale-95 pointer-events-none group-focus-within/menu:opacity-100 group-focus-within/menu:scale-100 group-focus-within/menu:pointer-events-auto transition-all origin-top-right">
                        <button
                          onClick={() => handleVerify(tx)}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3 text-green-500"
                        >
                          <CheckCircle2 size={16} />
                          Verify Transaction
                        </button>
                        <button
                          onClick={() => handleRefund(tx)}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3 text-red-400"
                        >
                          <RotateCcw size={16} />
                          Mark Refunded
                        </button>
                        <button
                          onClick={() => navigate(`/admin/users/${tx.userId}`)}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3"
                        >
                          <User size={16} />
                          View User Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="p-16 text-center text-white/30 font-black uppercase tracking-widest text-xs">Loading live payment data...</div>
        )}
        {error && !loading && (
          <div className="p-16 text-center text-red-400 font-black uppercase tracking-widest text-xs">{error}</div>
        )}
        {!loading && !error && transactions.length === 0 && (
          <div className="p-16 text-center text-white/20 font-black uppercase tracking-widest text-xs">No payments found for this filter.</div>
        )}
      </div>
    </div>
  );
}
