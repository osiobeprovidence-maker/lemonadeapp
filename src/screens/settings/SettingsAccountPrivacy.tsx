import React, { useState } from 'react';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { Shield, Eye, BookOpen, BadgeCheck, Lock } from 'lucide-react';

export default function SettingsAccountPrivacy() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    publicProfile: true,
    showReadingActivity: false,
    showSupportBadges: true,
    allowDirectMessages: true
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Privacy settings updated! (Mock)');
    }, 1000);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SettingsDetailLayout 
      title="Privacy Settings" 
      description="Control who can see your activity and profile."
      onSave={handleSave}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {[
          { 
            id: 'publicProfile', 
            title: 'Public Profile', 
            desc: 'Allow others to find and view your reader profile.', 
            icon: Eye 
          },
          { 
            id: 'showReadingActivity', 
            title: 'Show Reading Activity', 
            desc: 'Display what you are currently reading on your profile.', 
            icon: BookOpen 
          },
          { 
            id: 'showSupportBadges', 
            title: 'Show Support Badges', 
            desc: 'Display badges earned from supporting creators.', 
            icon: BadgeCheck 
          },
          { 
            id: 'allowDirectMessages', 
            title: 'Allow Direct Messages', 
            desc: 'Permit other users to send you messages.', 
            icon: Lock 
          }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => toggleSetting(item.id as keyof typeof settings)}
            className="w-full flex items-center justify-between p-6 bg-ink-deep border border-white/5 rounded-[32px] hover:bg-white/5 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-colors ${settings[item.id as keyof typeof settings] ? 'text-lemon-muted bg-lemon-muted/10' : 'text-white/20'}`}>
                  <item.icon size={24} />
               </div>
               <div>
                  <h3 className="font-black text-lg tracking-tight leading-tight">{item.title}</h3>
                  <p className="text-sm font-bold text-white/30 italic">{item.desc}</p>
               </div>
            </div>
            <div className={`w-14 h-8 rounded-full transition-all relative ${settings[item.id as keyof typeof settings] ? 'bg-lemon-muted' : 'bg-white/10'}`}>
               <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${settings[item.id as keyof typeof settings] ? 'left-7' : 'left-1'}`} />
            </div>
          </button>
        ))}
      </div>

      <div className="p-8 bg-blue-400/5 rounded-[40px] border border-blue-400/10 mt-10">
         <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-blue-400" />
            <h4 className="text-lg font-display font-black uppercase italic tracking-tight text-blue-400">Security Note</h4>
         </div>
         <p className="text-sm font-bold text-white/60 leading-relaxed italic">
            Lemonade takes your privacy seriously. We never share your personal data or reading habits with third-party advertisers. All data is encrypted and handled according to our Privacy Policy.
         </p>
      </div>
    </SettingsDetailLayout>
  );
}
