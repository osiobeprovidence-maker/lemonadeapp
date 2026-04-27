import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
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

      <h1 className="text-4xl font-display font-black tracking-tight mb-4 uppercase italic">Privacy Policy</h1>
      <p className="text-white/40 font-bold mb-10">Last updated: April 2026</p>

      <div className="space-y-8 text-white/80 font-medium leading-relaxed">
        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your name, email address, username, and bio when you create an account. We also collect usage data, such as your reading history and interactions with stories.</p>
        </section>

        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">2. How We Use Your Information</h2>
          <p>We use the information we collect to maintain and improve our services, personalize your experience, process your transactions, and communicate with you about your account and platform updates.</p>
        </section>

        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">3. Information Sharing</h2>
          <p>We do not sell your personal information to third parties. We may share information with service providers who help us operate the platform or in response to legal requests.</p>
        </section>

        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">4. Data Security</h2>
          <p>We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. However, no internet transmission is ever completely secure or error-free.</p>
        </section>

        <section>
          <h2 className="text-xl font-display font-black uppercase italic mb-4 text-white">5. Your Choices</h2>
          <p>You can view and update your profile information in your account settings. You can also control certain privacy preferences, such as whether your reading activity is visible to others.</p>
        </section>
      </div>
    </div>
  );
}
