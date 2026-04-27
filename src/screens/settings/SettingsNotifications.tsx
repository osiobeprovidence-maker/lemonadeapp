import React, { useState } from 'react';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { Bell, BookOpen, MessageSquare, Star, CreditCard, Mail, Smartphone } from 'lucide-react';

export default function SettingsNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    newChapters: true,
    creatorReplies: true,
    premiumUpdates: true,
    paymentAlerts: true,
    emailMarketing: false,
    pushActivity: true
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Notification settings updated! (Mock)');
    }, 1000);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SettingsDetailLayout 
      title="Notifications" 
      description="Choose what events you want to be notified about."
      onSave={handleSave}
      isLoading={isLoading}
    >
      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-6 px-4">
             <Smartphone size={20} className="text-lemon-muted" />
             <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Push Notifications</h3>
          </div>
          <div className="space-y-4">
            {[
              { id: 'newChapters', title: 'New Chapters', desc: 'When a story you follow drops a new chapter.', icon: BookOpen },
              { id: 'creatorReplies', title: 'Creator Replies', desc: 'When a creator replies to your comment.', icon: MessageSquare },
              { id: 'premiumUpdates', title: 'Premium & Rewards', desc: 'Alerts about your subscription and special offers.', icon: Star },
              { id: 'paymentAlerts', title: 'Payment Confirmations', desc: 'Receipts and transaction status alerts.', icon: CreditCard },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-6 bg-ink-deep border border-white/5 rounded-[32px]">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                      <item.icon size={24} />
                   </div>
                   <div>
                      <h4 className="font-black text-lg tracking-tight leading-tight">{item.title}</h4>
                      <p className="text-sm font-bold text-white/30 italic">{item.desc}</p>
                   </div>
                </div>
                <button 
                  onClick={() => toggleSetting(item.id as keyof typeof settings)}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings[item.id as keyof typeof settings] ? 'bg-lemon-muted' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${settings[item.id as keyof typeof settings] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
           <div className="flex items-center gap-3 mb-6 px-4">
              <Mail size={20} className="text-lemon-muted" />
              <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Email Preferences</h3>
           </div>
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] space-y-8">
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="font-black text-lg">Marketing & News</h4>
                    <p className="text-sm font-bold text-white/40 italic">New story recommendations and weekly digests.</p>
                 </div>
                 <button 
                  onClick={() => toggleSetting('emailMarketing')}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.emailMarketing ? 'bg-lemon-muted' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${settings.emailMarketing ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="pt-8 border-t border-white/5 border-dashed">
                 <p className="text-xs text-white/20 font-bold italic leading-relaxed">
                    Note: Critical account-related emails (password resets, security alerts) will always be sent regardless of these settings.
                 </p>
              </div>
           </div>
        </section>
      </div>
    </SettingsDetailLayout>
  );
}
