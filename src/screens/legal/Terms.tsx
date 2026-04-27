import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-4xl mx-auto pb-32 md:pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-10"
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </div>
        <span className="font-bold">Back</span>
      </button>

      <h1 className="text-4xl font-display font-black tracking-tight mb-4 uppercase italic">Terms of Service</h1>
      <p className="text-white/40 font-bold mb-10">Last updated: April 2026</p>

      <div className="space-y-8 text-white/80 font-medium leading-relaxed">
        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">1. Acceptance of Terms</h2>
          <p>By accessing or using Lemonade, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">2. Content Ownership</h2>
          <p>Creators retain all copyright ownership of their original works published on Lemonade. By publishing content, you grant Lemonade a non-exclusive, worldwide, royalty-free license to host, display, and distribute your content to other users via the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">3. User Conduct</h2>
          <p>You are responsible for all activity that occurs under your account. You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or libellous.</p>
        </section>

        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">4. Monetization & Payments</h2>
          <p>Lemonade offers a digital currency (Lemons) and premium subscriptions. All purchases are final and non-refundable unless required by law or as stated in our separate refund policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">5. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.</p>
        </section>
      </div>
    </div>
  );
}
