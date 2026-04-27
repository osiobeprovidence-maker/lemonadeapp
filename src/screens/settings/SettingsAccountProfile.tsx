import React, { useState } from 'react';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { User, Camera, Mail, AtSign, FileText } from 'lucide-react';

export default function SettingsAccountProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Riderezzy',
    username: 'riderezzy',
    bio: 'Avid reader and occasional critic. Love psychological thrillers.',
    email: 'riderezzy@gmail.com'
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Profile updated successfully! (Mock)');
    }, 1000);
  };

  return (
    <SettingsDetailLayout 
      title="Profile Info" 
      description="How you appear to other readers and creators."
      onSave={handleSave}
      isLoading={isLoading}
    >
      <div className="flex flex-col items-center mb-10">
        <div className="relative group cursor-pointer">
          <div className="w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 overflow-hidden ring-4 ring-white/5 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" 
              alt="Avatar"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
             <Camera size={24} className="text-white" />
          </div>
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/30">Tap to change avatar</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Full Name</label>
          <div className="relative">
             <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Username</label>
          <div className="relative">
             <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Bio</label>
          <div className="relative">
             <FileText className="absolute left-5 top-6 text-white/20" size={18} />
             <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full h-32 bg-white/5 border border-white/5 rounded-3xl pl-12 pr-6 pt-5 font-medium focus:outline-none focus:border-lemon-muted/50 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="space-y-2 opacity-50">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Email Address</label>
          <div className="relative">
             <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type="email" 
              readOnly
              value={formData.email}
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 font-bold cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] font-bold text-white/20 ml-4 italic">Email cannot be changed manually.</p>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
