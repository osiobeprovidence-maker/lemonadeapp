import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Lock, 
  Trash2, 
  ShieldAlert, 
  Power,
  XCircle,
  Plus,
  Check
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { AdminRole, Moderator } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminModerators() {
  const { moderators, adminSession, addModerator, removeModerator, updateModerator } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModName, setNewModName] = useState('');
  const [newModEmail, setNewModEmail] = useState('');
  const [newModRole, setNewModRole] = useState<AdminRole>('moderator');

  if (adminSession?.role !== 'super_admin') {
     return (
       <div className="flex flex-col items-center justify-center p-20 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
             <ShieldAlert size={40} />
          </div>
          <h2 className="text-3xl font-display font-black uppercase italic mb-2">Access Denied</h2>
          <p className="text-white/40 font-bold max-w-sm">Only Super Admins can access moderator management settings. Please contact the system owner.</p>
       </div>
     );
  }

  const handleAddModerator = (e: React.FormEvent) => {
    e.preventDefault();
    addModerator({
      name: newModName,
      email: newModEmail,
      role: newModRole,
      permissions: ['all'], // Default
      status: 'active'
    });
    setNewModName('');
    setNewModEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Moderators</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Manage infrastructure access and permissions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="h-12 px-6 bg-lemon-muted text-black rounded-xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-lemon-muted/20"
        >
          <UserPlus size={18} />
          Add Moderator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {moderators.map((mod) => (
          <div key={mod.id} className="p-8 bg-ink-deep border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-center relative">
                   <ShieldCheck size={32} className={cn(mod.role === 'super_admin' ? "text-lemon-muted" : "text-white/20")} />
                   <div className={cn(
                     "absolute bottom-0 right-0 w-4 h-4 rounded-full border-4 border-black",
                     mod.status === 'active' ? "bg-green-500" : "bg-red-500"
                   )} />
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold">{mod.name}</h4>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                        mod.role === 'super_admin' ? "bg-lemon-muted text-black" : "bg-white/10 text-white/40"
                      )}>{mod.role.replace('_', ' ')}</span>
                   </div>
                   <p className="text-sm text-white/30 font-medium">{mod.email}</p>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateModerator(mod.id, { status: mod.status === 'active' ? 'disabled' : 'active' })}
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                    mod.status === 'active' ? "bg-red-400/5 text-red-400 hover:bg-red-400 hover:text-white" : "bg-green-400/5 text-green-400 hover:bg-green-400 hover:text-white"
                  )}
                >
                   <Power size={18} />
                </button>
                <button 
                   onClick={() => removeModerator(mod.id)}
                   className="w-11 h-11 rounded-xl bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center"
                >
                   <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Add Moderator Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddModal(false)}
               className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-ink-deep border border-white/10 rounded-[3rem] shadow-2xl z-[110] overflow-hidden"
            >
               <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <h3 className="text-xl font-display font-black uppercase italic">Add Moderator</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-white/20 hover:text-white transition-colors">
                     <XCircle size={24} />
                  </button>
               </div>
               
               <form onSubmit={handleAddModerator} className="p-10 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Full Name</label>
                     <input 
                        required
                        type="text" 
                        value={newModName}
                        onChange={(e) => setNewModName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full h-14 bg-black border border-white/5 rounded-2xl px-6 text-white font-bold focus:outline-none focus:border-lemon-muted/50 transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Email Identity</label>
                     <input 
                        required
                        type="email" 
                        value={newModEmail}
                        onChange={(e) => setNewModEmail(e.target.value)}
                        placeholder="mod@lemons.com"
                        className="w-full h-14 bg-black border border-white/5 rounded-2xl px-6 text-white font-bold focus:outline-none focus:border-lemon-muted/50 transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Assigned Role</label>
                     <div className="grid grid-cols-2 gap-3">
                        {(['moderator', 'content_reviewer', 'payment_reviewer'] as const).map((r) => (
                           <button
                              key={r}
                              type="button"
                              onClick={() => setNewModRole(r)}
                              className={cn(
                                "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                newModRole === r ? "bg-lemon-muted text-black border-lemon-muted" : "bg-black border-white/5 text-white/40 hover:border-white/20"
                              )}
                           >
                              {r.replace('_', ' ')}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button 
                     type="submit"
                     className="w-full h-14 bg-lemon-muted text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-lemon-muted/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                  >
                     Confirm Access Grant
                  </button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
