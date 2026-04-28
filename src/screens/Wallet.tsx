import React, { useEffect, useState } from 'react';
import { Coins, ArrowDownLeft, ArrowUpRight, History, Crown, CreditCard, Zap, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { SensitiveActionWrapper } from '../components/SensitiveActionWrapper';
import { cn } from '../lib/utils';
import { generateReference, initializePayment, naiiraToKobo, verifyPayment } from '../lib/paystack';
import { auth } from '../lib/firebase';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

export default function Wallet() {
  const { user, isGuest, addCoins } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const userRole = user?.role || 'reader';
  const walletTopUpNaira = 5000;
  const walletTopUpCoins = 500;

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

        if (convex && auth.currentUser) {
          const creditResult = await convex.mutation(api.payments.creditWalletAfterPaystack, {
            firebaseUid: auth.currentUser.uid,
            userId: user.id,
            coins: walletTopUpCoins,
            nairaAmount: transaction.amount / 100,
            reference,
            providerPayload: transaction,
          });

          if (creditResult.credited) {
            addCoins(walletTopUpCoins);
          }
        } else {
          addCoins(walletTopUpCoins);
        }

        setPaymentStatus(`Payment confirmed. ${walletTopUpCoins} coins added to your wallet.`);
        setSearchParams({});
      } catch (error) {
        setPaymentStatus(error instanceof Error ? error.message : 'Unable to verify payment.');
      } finally {
        setPaymentLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, setSearchParams, user, isGuest]);

  const handleAddFunds = async () => {
    if (!user?.email) {
      navigate('/auth?mode=signin&intent=add%20funds');
      return;
    }

    setPaymentLoading(true);
    setPaymentStatus(null);

    try {
      const reference = generateReference();
      const result = await initializePayment({
        email: user.email,
        amount: naiiraToKobo(walletTopUpNaira),
        reference,
        metadata: {
          userId: user.id,
          username: user.username,
          product: 'wallet_topup',
          coins: walletTopUpCoins,
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
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-4xl mx-auto pb-32 md:pb-12">
      <h1 className="font-display font-black text-3xl md:text-5xl mb-8">Wallet</h1>

      {isGuest && (
        <div className="mb-8 p-6 bg-lemon-muted/10 border border-lemon-muted/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-lemon-muted rounded-full flex items-center justify-center text-black">
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

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-ink-deep to-black-core border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col h-full shadow-2xl">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Coins size={120} />
          </div>
          <div className="relative z-10 flex-1 flex flex-col">
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">Total Balance</p>
            <div className="flex items-end gap-2 mb-8 flex-1">
              <h2 className="font-display font-black text-5xl md:text-6xl text-lemon-muted">
                {userRole === 'creator' ? '$4,250' : (isGuest ? '0' : (user?.walletBalance ?? 0).toLocaleString())}
              </h2>
              <span className="text-xl font-bold text-white/40 pb-2">{userRole === 'creator' ? 'USD' : 'Coins'}</span>
            </div>
            
            <div className="flex gap-4 w-full">
              <SensitiveActionWrapper intent="add funds" onClick={handleAddFunds}>
                {userRole === 'creator' ? (
                  <Button size="lg" className="w-full"><ArrowUpRight size={18} className="mr-2" /> Withdraw</Button>
                ) : (
                  <Button size="lg" className="w-full" disabled={paymentLoading}>
                    <ArrowDownLeft size={18} className="mr-2" /> {paymentLoading ? 'Processing...' : 'Add Funds'}
                  </Button>
                )}
              </SensitiveActionWrapper>
            </div>
            {paymentStatus && (
              <p className="mt-4 text-sm font-bold text-lemon-muted bg-lemon-muted/10 border border-lemon-muted/20 rounded-2xl p-4">
                {paymentStatus}
              </p>
            )}
          </div>
        </div>

        {/* Secondary Info / Premium Card */}
        <div className="flex flex-col gap-6">
          {userRole === 'creator' ? (
            <>
              <div className="bg-ink-deep border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-center">
                <p className="text-sm text-white/50 mb-1">Pending Clearance</p>
                <h3 className="font-display font-bold text-2xl">$340.00</h3>
              </div>
              <div className="bg-ink-deep border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-center">
                <p className="text-sm text-white/50 mb-1">Lifetime Earnings</p>
                <h3 className="font-display font-bold text-2xl">$12,450.00</h3>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-lemon-muted/20 to-black-core border border-lemon-muted/30 rounded-3xl p-6 flex-1 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Crown size={64} className="text-lemon-muted" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={18} className="text-lemon-muted" />
                    <p className="text-[10px] text-lemon-muted font-black uppercase tracking-[0.2em]">Lemonade Premium</p>
                  </div>
                  {isGuest || !user?.isPremium ? (
                    <>
                      <h3 className="font-display font-bold text-2xl mb-4 leading-tight">Unlock every chapter with ease.</h3>
                      <Link to="/premium">
                        <Button variant="glass" size="sm" className="bg-white/10 hover:bg-lemon-muted hover:text-black">Upgrade Now</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="font-display font-bold text-2xl mb-2">Active Plan: Yearly</h3>
                      <p className="text-white/40 text-xs mb-4">Next billing: Dec 12, 2024</p>
                      <Link to="/premium" className="text-sm text-lemon-muted font-bold hover:underline flex items-center gap-1">
                        Manage Subscription <ArrowUpRight size={14} />
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-ink-deep border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <CreditCard size={20} className="text-white/40" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Default Method</p>
                    <h4 className="font-bold text-sm">{isGuest ? 'None Linked' : 'Visa ending in 4242'}</h4>
                  </div>
                </div>
                {!isGuest && <ChevronRight size={20} className="text-white/20" />}
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
          <History size={20} /> 
          {userRole === 'creator' ? 'Transaction History' : 'Payment & Activity History'}
        </h3>
        
        {isGuest ? (
           <div className="bg-ink-deep/30 border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
             <History size={48} className="text-white/10 mb-4" />
             <h4 className="font-bold mb-2">No activity yet</h4>
             <p className="text-sm text-white/40 max-w-xs">Sign in to see your history for tips, unlocks, and more.</p>
           </div>
        ) : (
          <div className="bg-ink-deep/50 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            {userRole === 'reader' && (
              <div className="divide-y divide-white/5">
                {user?.unlockHistory.length === 0 && user?.supportHistory.length === 0 && (
                  <div className="p-8 text-center text-white/30 text-sm">No transactions yet.</div>
                )}
                {user?.supportHistory.map((support, idx) => (
                  <HistoryItem 
                    key={`support-${idx}`}
                    icon={Zap} 
                    title={`Supported ${support.creatorId}`} 
                    date={new Date(support.timestamp).toLocaleDateString()} 
                    amount={`-$${support.amount}`} 
                    color="white"
                  />
                ))}
                {user?.unlockHistory.map((unlock, idx) => (
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

            {userRole === 'creator' && [1,2,3,4,5].map((i) => (
               <HistoryItem 
                key={i}
                icon={i % 2 === 0 ? ArrowDownLeft : ArrowUpRight}
                title={i % 2 === 0 ? 'Chapter Purchase - Lagos 2099' : 'Withdrawal to Bank'}
                date={`Oct ${12 - i}, 2024`}
                amount={`${i % 2 === 0 ? '+' : '-'}$${i * 15}.00`}
                color={i % 2 === 0 ? 'green-400' : 'white'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ icon: Icon, title, date, amount, color }: any) {
  return (
    <div className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
          <Icon size={20} className={color === 'green-400' ? "text-green-400" : "text-white/40"} />
        </div>
        <div>
          <p className="font-bold text-sm md:text-base">{title}</p>
          <p className="text-xs text-white/30 font-medium">{date}</p>
        </div>
      </div>
      <span className={cn("font-black text-sm md:text-base", color === 'green-400' ? "text-green-400" : "text-white")}>
        {amount}
      </span>
    </div>
  );
}
