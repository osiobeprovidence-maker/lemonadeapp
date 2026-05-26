import React, { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  Crown,
  History,
  ShieldCheck,
  WalletCards,
  Zap,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { cn } from '../lib/utils';
import { generateReference, initializePayment, naiiraToKobo, verifyPayment } from '../lib/paystack';
import { auth } from '../lib/firebase';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

const COIN_PACKAGES = [
  { coins: 60, bonus: 0, price: 200, label: 'Starter', desc: 'Entry pack' },
  { coins: 250, bonus: 0, price: 600, label: 'Standard', popular: true, desc: 'Most popular choice', savings: '27%' },
  { coins: 700, bonus: 100, price: 1500, label: 'Value Pack', desc: 'Read more, save more', savings: '43%' },
  { coins: 1600, bonus: 400, price: 3000, label: 'Mega Bundle', bestValue: true, desc: 'Ultimate reader experience', savings: '55%' },
];

const formatNaira = (amount: number) => `NGN ${amount.toLocaleString()}`;

export default function Wallet() {
  const { user, isGuest, addCoins } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCoins, setSelectedCoins] = useState(250);
  const [customCoins, setCustomCoins] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const userRole = user?.role || 'reader';

  const customCoinAmount = Math.max(0, parseInt(customCoins || '0', 10) || 0);
  const currentPackage = COIN_PACKAGES.find((pkg) => pkg.coins === selectedCoins);
  const currentCoins = customCoins ? customCoinAmount : (currentPackage ? currentPackage.coins + currentPackage.bonus : 250);
  const currentPrice = customCoins ? Math.round(customCoinAmount * 3) : currentPackage?.price || 600;
  const readerBalance = isGuest ? '0' : (user?.walletBalance ?? 0).toLocaleString();
  const displayBalance = userRole === 'creator' ? formatNaira(4250) : readerBalance;
  const displayUnit = userRole === 'creator' ? 'available to withdraw' : 'coins available';

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference || !user || isGuest) return;

    const confirmPayment = async () => {
      setPaymentLoading(true);
      setPaymentStatus('Verifying payment...');

      try {
        const result = await verifyPayment(reference);
        const transaction = result?.data;

        if (transaction?.status !== 'success') {
          setPaymentStatus('Payment was not successful. Your wallet was not updated.');
          return;
        }

        const coinsToCredit = transaction.metadata?.coins || selectedCoins;

        if (convex && auth.currentUser) {
          const creditResult = await convex.mutation(api.payments.creditWalletAfterPaystack, {
            firebaseUid: auth.currentUser.uid,
            userId: user.id,
            coins: coinsToCredit,
            nairaAmount: transaction.amount / 100,
            reference,
            providerPayload: transaction,
          });

          if (creditResult.credited) {
            addCoins(coinsToCredit);
          }
        } else {
          addCoins(coinsToCredit);
        }

        setPaymentStatus(`Payment confirmed. ${coinsToCredit} coins added to your wallet.`);
        setSearchParams({});
      } catch (error) {
        setPaymentStatus(error instanceof Error ? error.message : 'Unable to verify payment.');
      } finally {
        setPaymentLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, setSearchParams, user, isGuest, selectedCoins, addCoins]);

  const handleAddFunds = async () => {
    if (!user?.email) {
      navigate('/auth?mode=signin&intent=add%20funds');
      return;
    }

    if (currentCoins < 150 || currentCoins > 5000) {
      alert('Please select between 150 and 5000 coins.');
      return;
    }

    setPaymentLoading(true);
    setPaymentStatus(null);

    try {
      const reference = generateReference();
      const result = await initializePayment({
        email: user.email,
        amount: naiiraToKobo(currentPrice),
        reference,
        metadata: {
          userId: user.id,
          username: user.username,
          product: 'wallet_topup',
          coins: currentCoins,
        },
      });

      const authorizationUrl = result?.data?.authorization_url;
      if (!authorizationUrl) {
        throw new Error('Paystack did not return a checkout URL.');
      }

      window.location.href = authorizationUrl;
    } catch (error) {
      setPaymentStatus(error instanceof Error ? error.message : 'Unable to start payment.');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen px-4 py-6 sm:px-6 md:p-10 xl:p-12 max-w-6xl mx-auto pb-32 md:pb-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl md:text-5xl">Wallet</h1>
          <p className="mt-2 text-sm md:text-base text-white/45">Top up coins, track activity, and manage your reading spend.</p>
        </div>
        {!isGuest && (
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-lemon-muted">
            <ShieldCheck size={16} />
            Paystack secured
          </div>
        )}
      </div>

      {isGuest && (
        <div className="mb-8 p-5 md:p-6 bg-lemon-muted/10 border border-lemon-muted/20 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-lemon-muted rounded-lg flex items-center justify-center text-black shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">Sign in to use your wallet</h3>
              <p className="text-white/50 text-sm">Track your balance, unlock chapters, and support creators.</p>
            </div>
          </div>
          <Button onClick={() => navigate('/auth?mode=signup')} className="w-full md:w-auto">
            Create Account
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-[0.95fr_1.35fr] items-start gap-5 md:gap-6 mb-10">
        <BalancePanel
          balance={displayBalance}
          unit={displayUnit}
          paymentStatus={paymentStatus}
        />

        <div className="bg-ink-deep/70 border border-white/10 rounded-lg p-5 md:p-6 shadow-xl">
          {userRole === 'creator' ? (
            <CreatorPayoutPanel />
          ) : (
            <TopUpPanel
              customCoins={customCoins}
              currentCoins={currentCoins}
              currentPrice={currentPrice}
              paymentLoading={paymentLoading}
              selectedCoins={selectedCoins}
              setCustomCoins={setCustomCoins}
              setSelectedCoins={setSelectedCoins}
              onAddFunds={handleAddFunds}
              isPremium={!!user?.isPremium}
              isGuest={isGuest}
            />
          )}
        </div>
      </div>

      <ActivityHistory userRole={userRole} isGuest={isGuest} user={user} />
    </div>
  );
}

function BalancePanel({ balance, unit, paymentStatus }: { balance: string; unit: string; paymentStatus: string | null }) {
  return (
    <div className="bg-ink-deep border border-white/10 rounded-lg p-6 md:p-8 relative overflow-hidden flex flex-col min-h-[360px] shadow-2xl">
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-lemon-muted/15" />
      <div className="absolute right-8 top-8 opacity-10">
        <Coins size={104} />
      </div>
      <div className="relative z-10 flex-1 flex flex-col justify-between gap-8">
        <div>
          <p className="text-xs font-black text-white/45 uppercase tracking-[0.18em] mb-4">Total Balance</p>
          <h2 className="font-display font-black text-5xl md:text-6xl text-lemon-muted leading-none break-words">
            {balance}
          </h2>
          <p className="mt-3 text-sm font-bold text-white/45">{unit}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Standard</p>
            <p className="mt-2 font-display text-xl font-black">15-30</p>
            <p className="text-xs text-white/35">coins/chapter</p>
          </div>
          <div className="rounded-lg border border-lemon-muted/20 bg-lemon-muted/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-lemon-muted">Premium</p>
            <p className="mt-2 font-display text-xl font-black text-lemon-muted">40-60</p>
            <p className="text-xs text-white/45">coins/chapter</p>
          </div>
        </div>

        {paymentStatus && (
          <p className="text-sm font-bold text-lemon-muted bg-lemon-muted/10 border border-lemon-muted/20 rounded-lg p-4">
            {paymentStatus}
          </p>
        )}
      </div>
    </div>
  );
}

function CreatorPayoutPanel() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Creator Payouts</p>
          <h3 className="mt-2 font-display text-2xl md:text-3xl font-black">Withdraw earnings</h3>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lemon-muted text-black flex items-center justify-center shrink-0">
          <WalletCards size={22} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-white/45 mb-1">Pending Clearance</p>
          <h4 className="font-display font-bold text-2xl">{formatNaira(340)}</h4>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-white/45 mb-1">Lifetime Earnings</p>
          <h4 className="font-display font-bold text-2xl">{formatNaira(12450)}</h4>
        </div>
      </div>

      <Button size="lg" className="mt-auto w-full">
        <ArrowUpRight size={18} className="mr-2" /> Withdraw
      </Button>
    </div>
  );
}

interface TopUpPanelProps {
  customCoins: string;
  currentCoins: number;
  currentPrice: number;
  paymentLoading: boolean;
  selectedCoins: number;
  setCustomCoins: (value: string) => void;
  setSelectedCoins: (value: number) => void;
  onAddFunds: () => void;
  isPremium: boolean;
  isGuest: boolean;
}

function TopUpPanel({
  customCoins,
  currentCoins,
  currentPrice,
  paymentLoading,
  selectedCoins,
  setCustomCoins,
  setSelectedCoins,
  onAddFunds,
  isPremium,
  isGuest,
}: TopUpPanelProps) {
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Top Up</p>
          <h3 className="mt-2 font-display text-2xl md:text-3xl font-black">Choose coins</h3>
        </div>
        <p className="text-sm text-lemon-muted font-bold sm:text-right">Bigger packs unlock better value</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {COIN_PACKAGES.map((pkg) => {
          const isSelected = selectedCoins === pkg.coins && !customCoins;
          return (
            <button
              key={pkg.coins}
              onClick={() => {
                setSelectedCoins(pkg.coins);
                setCustomCoins('');
              }}
              className={cn(
                'rounded-lg border p-4 text-left transition-all min-h-[132px] flex flex-col justify-between',
                isSelected
                  ? 'bg-lemon-muted text-black border-lemon-muted shadow-lg shadow-lemon-muted/10'
                  : 'bg-black/20 text-white border-white/10 hover:border-lemon-muted/50 hover:bg-white/[0.06]'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn('text-[10px] font-black uppercase tracking-[0.18em]', isSelected ? 'text-black/55' : 'text-white/35')}>
                    {pkg.label}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-black leading-none">{(pkg.coins + pkg.bonus).toLocaleString()}</span>
                    <span className={cn('text-xs font-black uppercase', isSelected ? 'text-black/55' : 'text-white/35')}>coins</span>
                  </div>
                </div>
                {isSelected && <CheckCircle2 size={20} className="shrink-0" />}
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-lg font-black">{formatNaira(pkg.price)}</p>
                  {pkg.bonus > 0 && (
                    <p className={cn('text-xs font-bold', isSelected ? 'text-black/60' : 'text-lemon-muted')}>
                      Includes {pkg.bonus} bonus
                    </p>
                  )}
                </div>
                {pkg.savings && (
                  <span className={cn('rounded px-2 py-1 text-[10px] font-black uppercase tracking-widest', isSelected ? 'bg-black/10 text-black/65' : 'bg-lemon-muted/10 text-lemon-muted')}>
                    Save {pkg.savings}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid md:grid-cols-[1fr_auto] gap-3">
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            min={150}
            max={5000}
            placeholder="Custom amount"
            value={customCoins}
            onChange={(event) => setCustomCoins(event.target.value)}
            className={cn(
              'w-full h-14 bg-black/30 border border-white/10 rounded-lg px-4 font-bold text-white placeholder:text-white/25 focus:outline-none focus:border-lemon-muted transition-colors',
              customCoins && 'pr-32'
            )}
          />
          {customCoins && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lemon-muted font-black text-sm">
              {formatNaira(currentPrice)}
            </div>
          )}
        </div>

        <Button size="lg" className="h-14 px-6 md:min-w-56" disabled={paymentLoading || currentCoins < 1} onClick={onAddFunds}>
          <ArrowDownLeft size={18} className="mr-2" /> {paymentLoading ? 'Processing...' : `Get ${currentCoins.toLocaleString()} Coins`}
        </Button>
      </div>

      <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-lemon-muted/10 flex items-center justify-center text-lemon-muted shrink-0">
            <Crown size={20} />
          </div>
          {isGuest || !isPremium ? (
            <div>
              <h4 className="font-display font-bold text-lg leading-tight">Read without coin limits</h4>
              <p className="text-sm text-white/40">Premium unlocks everything for one monthly price.</p>
            </div>
          ) : (
            <div>
              <h4 className="font-display font-bold text-lg leading-tight text-lemon-muted">Premium Active</h4>
              <p className="text-sm text-white/40">Unlimited reading enabled. Next billing: Dec 12, 2024</p>
            </div>
          )}
        </div>
        <Link to="/premium" className="self-center">
          <Button variant="glass" size="sm" className="w-full md:w-auto bg-white/10 hover:bg-lemon-muted hover:text-black">
            {isGuest || !isPremium ? 'View Premium' : 'Manage'}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ActivityHistory({ userRole, isGuest, user }: { userRole: string; isGuest: boolean; user: any }) {
  return (
    <div>
      <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
        <History size={20} />
        {userRole === 'creator' ? 'Transaction History' : 'Payment & Activity History'}
      </h3>

      {isGuest ? (
        <div className="bg-ink-deep/30 border border-dashed border-white/10 rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <History size={48} className="text-white/10 mb-4" />
          <h4 className="font-bold mb-2">No activity yet</h4>
          <p className="text-sm text-white/40 max-w-xs">Sign in to see your history for tips, unlocks, and more.</p>
        </div>
      ) : (
        <div className="bg-ink-deep/50 border border-white/5 rounded-lg overflow-hidden shadow-xl">
          {userRole === 'reader' && (
            <div className="divide-y divide-white/5">
              {user?.unlockHistory.length === 0 && user?.supportHistory.length === 0 && user?.topupHistory?.length === 0 && (
                <div className="p-8 text-center text-white/30 text-sm">No transactions yet.</div>
              )}
              {user?.topupHistory?.map((topup: any, idx: number) => (
                <HistoryItem
                  key={`topup-${idx}`}
                  icon={ArrowDownLeft}
                  title="Coins Purchased"
                  date={new Date(topup.timestamp).toLocaleDateString()}
                  amount={`+${topup.amount} C`}
                  color="green-400"
                />
              ))}
              {user?.supportHistory.map((support: any, idx: number) => (
                <HistoryItem
                  key={`support-${idx}`}
                  icon={Zap}
                  title={`Supported ${support.creatorId}`}
                  date={new Date(support.timestamp).toLocaleDateString()}
                  amount={`-${formatNaira(support.amount)}`}
                  color="white"
                />
              ))}
              {user?.unlockHistory.map((unlock: any, idx: number) => (
                <HistoryItem
                  key={`unlock-${idx}`}
                  icon={ArrowUpRight}
                  title={`Unlocked ${unlock.storyId} - ${unlock.chapterId}`}
                  date={new Date(unlock.timestamp).toLocaleDateString()}
                  amount={`-${unlock.price} C`}
                  color="white"
                />
              ))}
            </div>
          )}

          {userRole === 'creator' && user?.topupHistory.length === 0 && user?.supportHistory.length === 0 && user?.unlockHistory.length === 0 && (
            <p className="text-sm text-white/40 font-bold">No creator wallet activity yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryItem({ icon: Icon, title, date, amount, color }: any) {
  return (
    <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <Icon size={20} className={color === 'green-400' ? 'text-green-400' : 'text-white/40'} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm md:text-base truncate">{title}</p>
          <p className="text-xs text-white/30 font-medium">{date}</p>
        </div>
      </div>
      <span className={cn('font-black text-sm md:text-base shrink-0', color === 'green-400' ? 'text-green-400' : 'text-white')}>
        {amount}
      </span>
    </div>
  );
}
