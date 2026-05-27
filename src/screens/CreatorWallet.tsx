import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Banknote, History, Save, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { api } from '../../convex/_generated/api';
import { auth } from '../lib/firebase';
import { convex } from '../lib/convex';
import { useApp } from '../contexts/AppContext';
import { useUpdateCreatorProfile } from '../hooks/useConvex';

const formatNaira = (amount: number) => `NGN ${(amount || 0).toLocaleString()}`;

type PayoutSummary = {
  availableToWithdraw: number;
  pendingClearance: number;
  lifetimeEarnings: number;
  hasPayoutAccount: boolean;
  payoutAccount?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  } | null;
  recentEarnings: Array<{
    id: string;
    amount: number;
    createdAt: string;
    reference: string;
    supporter?: string;
  }>;
};

const emptySummary: PayoutSummary = {
  availableToWithdraw: 0,
  pendingClearance: 0,
  lifetimeEarnings: 0,
  hasPayoutAccount: false,
  payoutAccount: null,
  recentEarnings: [],
};

export default function CreatorWallet() {
  const { user, creators } = useApp();
  const updateCreatorProfile = useUpdateCreatorProfile();
  const [summary, setSummary] = useState<PayoutSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [payoutForm, setPayoutForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const creatorData = user ? Object.values(creators as Record<string, any>).find((creator) => creator.username === user.username) : null;

  useEffect(() => {
    const loadSummary = async () => {
      if (!auth.currentUser || !convex) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await convex.query(api.payments.creatorPayoutSummary, {
          firebaseUid: auth.currentUser.uid,
        });
        setSummary(result);
        setPayoutForm({
          bankName: result.payoutAccount?.bankName || '',
          accountNumber: result.payoutAccount?.accountNumber || '',
          accountName: result.payoutAccount?.accountName || '',
        });
      } catch (error) {
        console.error('Failed to load creator wallet', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []);

  const canWithdraw = summary.hasPayoutAccount && summary.availableToWithdraw > 0;
  const canSavePayout = Boolean(
    payoutForm.bankName.trim() &&
    payoutForm.accountNumber.trim() &&
    payoutForm.accountName.trim()
  );

  const handleSavePayout = async () => {
    if (!user || !creatorData || !canSavePayout) return;

    setIsSavingPayout(true);
    setPayoutMessage(null);
    try {
      const payoutAccount = {
        bankName: payoutForm.bankName.trim(),
        accountNumber: payoutForm.accountNumber.trim(),
        accountName: payoutForm.accountName.trim(),
      };

      await updateCreatorProfile({
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio || '',
        category: creatorData.category || 'Writer',
        dropsomethingUrl: creatorData.dropsomethingUrl || '',
        supportEnabled: creatorData.supportEnabled ?? true,
        userId: user.id,
        profile: {
          ...(creatorData.profile || {}),
          payoutAccount,
        },
      });

      setSummary((current) => ({
        ...current,
        hasPayoutAccount: true,
        payoutAccount,
      }));
      setPayoutMessage('Payout account saved.');
    } catch (error) {
      console.error('Failed to save payout account', error);
      setPayoutMessage('Could not save payout account. Please try again.');
    } finally {
      setIsSavingPayout(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen px-4 py-6 sm:px-6 md:p-10 xl:p-12 max-w-6xl mx-auto pb-32 md:pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <Link to="/studio" className="inline-flex items-center gap-2 text-sm font-bold text-white/45 hover:text-white mb-5">
            <ArrowLeft size={16} /> Back to Studio
          </Link>
          <h1 className="font-display font-black text-3xl md:text-5xl">Creator Wallet</h1>
          <p className="mt-2 text-sm md:text-base text-white/45">Track creator earnings, payout account, and withdrawals.</p>
        </div>
        <Link to="/wallet">
          <Button variant="glass" className="bg-white/5">
            Open User Wallet
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-[0.95fr_1.35fr] items-start gap-5 md:gap-6 mb-10">
        <div className="bg-ink-deep border border-white/10 rounded-lg p-6 md:p-8 relative overflow-hidden flex flex-col min-h-[360px] shadow-2xl">
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-lemon-muted/15" />
          <div className="absolute right-8 top-8 opacity-10">
            <WalletCards size={104} />
          </div>
          <div className="relative z-10 flex-1 flex flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-black text-white/45 uppercase tracking-[0.18em] mb-4">Available Earnings</p>
              <h2 className="font-display font-black text-5xl md:text-6xl text-lemon-muted leading-none break-words">
                {isLoading ? '...' : formatNaira(summary.availableToWithdraw)}
              </h2>
              <p className="mt-3 text-sm font-bold text-white/45">creator payout balance</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Pending</p>
                <p className="mt-2 font-display text-xl font-black">{formatNaira(summary.pendingClearance)}</p>
              </div>
              <div className="rounded-lg border border-lemon-muted/20 bg-lemon-muted/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-lemon-muted">Lifetime</p>
                <p className="mt-2 font-display text-xl font-black text-lemon-muted">{formatNaira(summary.lifetimeEarnings)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-ink-deep/70 border border-white/10 rounded-lg p-5 md:p-6 shadow-xl min-h-[360px] flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Payout Account</p>
              <h3 className="mt-2 font-display text-2xl md:text-3xl font-black">
                {summary.hasPayoutAccount ? 'Ready for payouts' : 'Set up required'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-lg bg-lemon-muted text-black flex items-center justify-center shrink-0">
              <Banknote size={22} />
            </div>
          </div>

          {summary.hasPayoutAccount ? (
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-bold">{summary.payoutAccount?.accountName}</p>
              <p className="text-xs text-white/40 mt-1">{summary.payoutAccount?.bankName}</p>
              <p className="text-xs text-white/30 mt-1">****{summary.payoutAccount?.accountNumber?.slice(-4)}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-orange-400/20 bg-orange-400/10 p-4 text-sm font-bold text-orange-100">
              Add your payout bank account here before requesting withdrawals.
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-3">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Bank Name</span>
              <input
                value={payoutForm.bankName}
                onChange={(event) => setPayoutForm((current) => ({ ...current, bankName: event.target.value }))}
                className="w-full h-12 rounded-lg border border-white/10 bg-black/20 px-4 text-sm font-bold outline-none transition-colors focus:border-lemon-muted/60"
                placeholder="Bank name"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Account Number</span>
              <input
                value={payoutForm.accountNumber}
                onChange={(event) => setPayoutForm((current) => ({ ...current, accountNumber: event.target.value }))}
                className="w-full h-12 rounded-lg border border-white/10 bg-black/20 px-4 text-sm font-bold outline-none transition-colors focus:border-lemon-muted/60"
                placeholder="0000000000"
                inputMode="numeric"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Account Name</span>
              <input
                value={payoutForm.accountName}
                onChange={(event) => setPayoutForm((current) => ({ ...current, accountName: event.target.value }))}
                className="w-full h-12 rounded-lg border border-white/10 bg-black/20 px-4 text-sm font-bold outline-none transition-colors focus:border-lemon-muted/60"
                placeholder="Account holder"
              />
            </label>
          </div>

          {payoutMessage && (
            <p className={`text-xs font-bold ${payoutMessage.includes('saved') ? 'text-green-400' : 'text-orange-300'}`}>
              {payoutMessage}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mt-auto">
            <Button
              size="lg"
              variant="glass"
              className="w-full bg-white/5"
              disabled={!canSavePayout || isSavingPayout}
              onClick={handleSavePayout}
            >
              <Save size={18} className="mr-2" /> {isSavingPayout ? 'Saving...' : 'Save Payout'}
            </Button>
            <Button
              size="lg"
              className="w-full"
              disabled={!summary.hasPayoutAccount || !canWithdraw}
              onClick={() => {
                if (!summary.hasPayoutAccount) return;
                if (!canWithdraw) alert('No creator earnings are available to withdraw yet.');
              }}
            >
              <ArrowUpRight size={18} className="mr-2" /> Withdraw
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
          <History size={20} /> Creator Earnings History
        </h3>
        <div className="bg-ink-deep/50 border border-white/5 rounded-lg overflow-hidden shadow-xl">
          {summary.recentEarnings.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">No creator earnings yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {summary.recentEarnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between gap-4 p-5 hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-bold text-sm md:text-base">Creator support</p>
                    <p className="text-xs text-white/30 font-medium">{new Date(earning.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-black text-sm md:text-base text-green-400">+{formatNaira(earning.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
