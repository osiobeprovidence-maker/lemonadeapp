import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsDetailLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
  isLoading?: boolean;
}

export default function SettingsDetailLayout({ 
  title, 
  description, 
  children, 
  onSave,
  isLoading
}: SettingsDetailLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-4xl mx-auto pb-32 md:pb-12">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Settings</span>
        </button>

        {onSave && (
          <button 
            onClick={onSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 h-10 bg-lemon-muted text-black rounded-xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-display font-black tracking-tight mb-2 uppercase italic">{title}</h1>
        <p className="text-white/40 font-bold">{description}</p>
      </motion.div>

      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
