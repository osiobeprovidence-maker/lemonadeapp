import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, ChevronRight, Crown, Download, ShieldCheck, Sparkles, Star, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { PremiumPlanCard } from '../components/ui/Cards';
import { Button } from '../components/ui/Button';
import { useCurrentUser, useCreatePayment } from '../hooks/useConvex';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Premium() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, firebaseUid } = useCurrentUser();
  const createPayment = useCreatePayment();
  
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'patron'>('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Check if payment was successful from redirect
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setSuccess('Payment successful! Your premium membership is now active.');
      setTimeout(() => navigate('/home'), 2000);
    } else if (status === 'failed') {
      setError('Payment failed. Please try again.');
    }
  }, [searchParams, navigate]);
  
  // Auto-redirect if already premium
  useEffect(() => {
    if (user?.premiumStatus === 'premium' || user?.premiumStatus === 'patron') {
      setTimeout(() => {
        setSuccess('You already have premium access!');
        setTimeout(() => navigate('/home'), 1500);
      }, 500);
    }
  }, [user, navigate]);

  // Payment amounts in Naira
  const PREMIUM_MONTHLY = 6_99 * 100; // $6.99 in kobo
  const PREMIUM_YEARLY = 67_00 * 100; // $67.00 in kobo
  const PATRON_MONTHLY = 14_99 * 100; // $14.99 in kobo
  const PATRON_YEARLY = 143_00 * 100; // $143.00 in kobo
  
  const getPlanAmount = () => {
    if (selectedPlan === 'patron') {
      return billing === 'monthly' ? PATRON_MONTHLY : PATRON_YEARLY;
    }
    return billing === 'monthly' ? PREMIUM_MONTHLY : PREMIUM_YEARLY;
  };
  
  const getPlanPrice = () => {
    if (selectedPlan === 'patron') {
      return billing === 'monthly' ? '$14.99' : '$143.00';
    }
    return billing === 'monthly' ? '$6.99' : '$67.00';
  };
  
  const handlePurchase = async () => {
    if (!firebaseUid) {
      setError('Please sign in to upgrade');
      navigate('/auth?mode=signin&intent=premium');
      return;
    }
    
    try {
      setError(null);
      setIsProcessing(true);
      
      const amount = getPlanAmount();
      const planType = selectedPlan === 'patron' ? 'patron' : 'premium';
      
      // Create payment intent with Convex
      const { reference, authorizationUrl } = await createPayment({
        userId: user?._id || firebaseUid,
        amount,
        planType,
        billingCycle: billing,
      });
      
      if (authorizationUrl) {
        // Redirect to Paystack
        window.location.href = authorizationUrl;
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed';
      setError(errorMessage);
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const benefits = [
    { icon: <CheckCircle2 />, title: "Unlock Every Chapter", desc: "Read all premium locked chapters instantly without spending individual coins." },
    { icon: <Star />, title: "Early Access", desc: "Read chapters of 'Lemonade Originals' a week before everyone else." },
    { icon: <Download />, title: "Offline Reading", desc: "Download unlimited chapters to read anywhere, anytime." },
    { icon: <Crown />, title: "Premium Badge", desc: "Show off your premium status with an exclusive badge on your profile." },
    { icon: <Sparkles />, title: "Bonus Credits", desc: "Receive 50 creator support credits every month." },
    { icon: <ShieldCheck />, title: "Ad-Free Experience", desc: "Zero interruptions. Just uninterrupted reading." }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen relative p-6 md:p-12 pb-32 md:pb-24">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lemon-muted/10 via-black-core to-black-core pointer-events-none" />

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-4xl mx-auto w-full relative z-20 mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-200 text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="max-w-4xl mx-auto w-full relative z-20 mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-start gap-3">
          <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-green-200 text-sm font-medium">{success}</p>
        </div>
      )}
      {user?.premiumStatus === 'premium' && (
        <div className="max-w-4xl mx-auto w-full relative z-20 mb-6 p-4 bg-lemon-muted/10 border border-lemon-muted/30 rounded-2xl flex items-start gap-3">
          <CheckCircle size={20} className="text-lemon-muted mt-0.5 flex-shrink-0" />
          <p className="text-lemon-muted text-sm font-medium">You already have premium access! Enjoy unlimited reading.</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full relative z-10 text-center mb-10 md:mb-16 mt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lemon-muted/10 text-lemon-muted text-xs md:text-sm font-bold uppercase tracking-wider mb-6">
          <Crown size={14} className="md:size-4" /> Lemonade Premium
        </div>
        <h1 className="font-display font-black text-3xl md:text-6xl mb-4 md:mb-6 leading-tight">
          Read without <span className="text-lemon-muted text-glow">limits.</span>
        </h1>
        <p className="text-white/60 text-base md:text-xl max-w-2xl mx-auto px-4">
          Upgrade to Premium to unlock every chapter, get early access to drops, and directly support African-origin storytelling.
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full relative z-10">
        
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-ink-deep border border-white/10 p-1 rounded-full flex items-center relative">
            <button 
              onClick={() => setBilling('monthly')}
              className={`relative z-10 px-5 md:px-8 py-2 rounded-full font-bold text-xs md:text-sm transition-colors ${billing === 'monthly' ? 'text-black' : 'text-white/60 hover:text-white'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBilling('yearly')}
              className={`relative z-10 px-5 md:px-8 py-2 rounded-full font-bold text-xs md:text-sm transition-colors flex items-center gap-2 ${billing === 'yearly' ? 'text-black' : 'text-white/60 hover:text-white'}`}
            >
              Yearly
              <span className={`px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider ${billing === 'yearly' ? 'bg-black text-white' : 'bg-lemon-muted text-black'}`}>Save 20%</span>
            </button>
            <motion.div 
              layoutId="billing-pill"
              className="absolute h-full top-0 bg-lemon-muted rounded-full z-0"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                width: '50%',
                left: billing === 'monthly' ? '0%' : '50%'
              }}
            />
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16 md:mb-20">
          <button
            onClick={() => setSelectedPlan('premium')}
            className={`text-left transition-all ${
              selectedPlan === 'premium'
                ? 'ring-2 ring-lemon-muted'
                : 'hover:border-white/20'
            }`}
          >
            <PremiumPlanCard 
              name="Lemonade Premium"
              price={billing === 'monthly' ? "$6.99" : "$67.00"}
              period={billing === 'monthly' ? "/month" : "/year"}
              isPopular={selectedPlan === 'premium'}
              features={[
                "Unlock all premium chapters",
                "Early access to Originals",
                "Ad-free reading",
                "Offline downloads",
                "Premium profile badge"
              ]}
            />
          </button>
          <button
            onClick={() => setSelectedPlan('patron')}
            className={`text-left transition-all ${
              selectedPlan === 'patron'
                ? 'ring-2 ring-lemon-muted'
                : 'hover:border-white/20'
            }`}
          >
            <PremiumPlanCard 
              name="Premium + Patron"
              price={billing === 'monthly' ? "$14.99" : "$143.00"}
              period={billing === 'monthly' ? "/month" : "/year"}
              isPopular={selectedPlan === 'patron'}
              features={[
                "Everything in Premium",
                "150 Creator support credits/mo",
                "Exclusive Patron-only creator Q&As",
                "Custom reading themes"
              ]}
            />
          </button>
        </div>

        {/* Sticky Mobile Upgrade Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-black-core/95 backdrop-blur-2xl border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] animate-slide-up">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Selected Plan: {selectedPlan === 'premium' ? 'Premium' : 'Patron'}</span>
              <span className="font-display font-black text-lemon-muted">{getPlanPrice()}<span className="text-[10px] text-white/40">{billing === 'monthly' ? "/mo" : "/yr"}</span></span>
            </div>
            <Button 
              fullWidth 
              size="lg" 
              className="shadow-lg shadow-lemon-muted/10 h-14"
              onClick={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade to Premium'
              )}
            </Button>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 mb-16 md:mb-20 max-w-3xl mx-auto" />

        {/* Benefits List */}
        <div className="max-w-3xl mx-auto px-4 md:px-0">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-10 md:mb-12">Everything you get with Premium</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
             {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-lemon-muted/10 text-lemon-muted flex items-center justify-center shrink-0">
                    {React.cloneElement(benefit.icon as React.ReactElement, { size: 20 })}
                  </div>
                  <div>
                    <h4 className="font-bold text-base md:text-lg mb-1">{benefit.title}</h4>
                    <p className="text-white/50 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>
        
        {/* Desktop Upgrade Button */}
        <div className="hidden md:block max-w-3xl mx-auto mt-16 text-center">
          <Button 
            size="lg" 
            className="px-12 h-16 shadow-lg shadow-lemon-muted/10"
            onClick={handlePurchase}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader size={18} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {selectedPlan === 'premium' ? 'Upgrade to Premium' : 'Upgrade to Premium + Patron'}
                <span className="ml-3 font-bold">{getPlanPrice()}{billing === 'monthly' ? '/mo' : '/yr'}</span>
              </>
            )}
          </Button>
        </div>
    </div>
  );
}
