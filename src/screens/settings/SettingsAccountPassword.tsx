import React, { useState } from 'react';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function SettingsAccountPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Password updated successfully! (Mock)');
    }, 1500);
  };

  const toggleVisibility = (key: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SettingsDetailLayout 
      title="Change Password" 
      description="Keep your account secure with a strong password."
      onSave={handleSave}
      isLoading={isLoading}
    >
      <div className="flex justify-center mb-10">
        <div className="w-20 h-20 rounded-full bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
           <ShieldCheck size={40} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Current Password</label>
          <div className="relative">
             <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type={showPasswords.current ? 'text' : 'password'} 
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-12 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
            />
            <button 
              type="button"
              onClick={() => toggleVisibility('current')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-white/5 my-8 border-dashed border-b" />

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">New Password</label>
          <div className="relative">
             <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type={showPasswords.new ? 'text' : 'password'} 
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-12 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
            />
            <button 
              type="button"
              onClick={() => toggleVisibility('new')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Confirm New Password</label>
          <div className="relative">
             <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type={showPasswords.confirm ? 'text' : 'password'} 
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-12 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
            />
            <button 
              type="button"
              onClick={() => toggleVisibility('confirm')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 mt-10">
         <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Password Requirements</h4>
         <ul className="space-y-3">
            {[
              'At least 8 characters long',
              'Must include one special character',
              'Must include one number',
              'Cannot be same as previous password'
            ].map((req, i) => (
              <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/40">
                 <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                 {req}
              </li>
            ))}
         </ul>
      </div>
    </SettingsDetailLayout>
  );
}
