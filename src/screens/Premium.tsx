import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, ChevronRight, Crown, Download, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { PremiumPlanCard } from '../components/ui/Cards';
import { Button } from '../components/ui/Button';

export default function Premium() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

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
          <PremiumPlanCard 
            name="Lemonade Premium"
            price={billing === 'monthly' ? "$6.99" : "$67.00"}
            period={billing === 'monthly' ? "/month" : "/year"}
            isPopular={true}
            features={[
              "Unlock all premium chapters",
              "Early access to Originals",
              "Ad-free reading",
              "Offline downloads",
              "Premium profile badge"
            ]}
          />
          <PremiumPlanCard 
            name="Premium + Patron"
            price={billing === 'monthly' ? "$14.99" : "$143.00"}
            period={billing === 'monthly' ? "/month" : "/year"}
            features={[
              "Everything in Premium",
              "150 Creator support credits/mo",
              "Exclusive Patron-only creator Q&As",
              "Custom reading themes"
            ]}
          />
        </div>

        {/* Sticky Mobile Upgrade Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-black-core/95 backdrop-blur-2xl border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] animate-slide-up">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Selected Plan: Premium</span>
              <span className="font-display font-black text-lemon-muted">{billing === 'monthly' ? "$6.99" : "$67.00"}<span className="text-[10px] text-white/40">{billing === 'monthly' ? "/mo" : "/yr"}</span></span>
            </div>
            <Button fullWidth size="lg" className="shadow-lg shadow-lemon-muted/10 h-14">
              Unlock All Chapters
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

      </div>
    </div>
  );
}
