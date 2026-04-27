import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Search, 
  Filter, 
  ExternalLink,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  Download,
  Calendar,
  Wallet,
  Zap,
  MoreVertical,
  RotateCcw,
  CheckCircle2,
  FileText,
  User
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminPayments() {
  const { allUsers } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'wallet' | 'premium' | 'unlocks' | 'support'>('all');

  // Mock transactions
  const transactions = [
    { id: 'tx1', user: 'leke_adesina', type: 'wallet', amount: 5000, status: 'success', date: '2026-04-26', ref: 'LMN-9382' },
    { id: 'tx2', user: 'tunde_b', type: 'premium', amount: 1500, status: 'success', date: '2026-04-25', ref: 'LMN-1122' },
    { id: 'tx3', user: 'zaria_w', type: 'unlock', amount: 120, status: 'success', date: '2026-04-25', ref: 'LMN-5541' },
    { id: 'tx4', user: 'leke_adesina', type: 'support', amount: 1000, status: 'success', date: '2026-04-24', ref: 'LMN-0092' },
    { id: 'tx5', user: 'guest_user', type: 'wallet', amount: 10000, status: 'failed', date: '2026-04-23', ref: 'LMN-6672' },
  ];

  const handleExport = () => {
    alert('Exporting payment report as CSV... (Mock Download)');
  };

  const handleRefund = (id: string) => {
    if (confirm(`Inititate refund for transaction ${id}? (Mock)`)) {
      alert('Refund processed successfully! (Mock)');
    }
  };

  const handleVerify = (id: string) => {
    alert(`Transaction ${id} verified manually. (Mock)`);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Financial Ops</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Transaction audit and platform revenue tracking</p>
        </div>
        <button 
          onClick={handleExport}
          className="h-12 px-6 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
        >
           <Download size={18} />
           Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '₦4,250,000', icon: DollarSign, color: 'text-green-500' },
          { label: 'Wallet Vol.', value: '₦1,840,000', icon: Wallet, color: 'text-blue-500' },
          { label: 'Premium Sub', value: '422 Active', icon: Zap, color: 'text-lemon-muted' },
          { label: 'Pending Payout', value: '₦842,000', icon: CreditCard, color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-ink-deep border border-white/5 rounded-[2rem] space-y-4">
             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/5", stat.color)}>
                <stat.icon size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                <h3 className="text-2xl font-display font-black">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="flex bg-ink-deep p-1.5 rounded-2xl border border-white/5 gap-1 overflow-x-auto scrollbar-hide w-fit">
        {(['all', 'wallet', 'premium', 'unlocks', 'support'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              filter === f ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10" : "text-white/40 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">User Context</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Transaction Type</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Ref / ID</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Gross Amount</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {transactions.map((tx) => (
                 <tr key={tx.id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="p-6">
                       <p 
                        className="font-bold text-white group-hover:text-lemon-muted transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/users/${tx.user}`)}
                       >@{tx.user}</p>
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{tx.date}</p>
                    </td>
                    <td className="p-6">
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border",
                         tx.type === 'premium' ? "bg-lemon-muted/10 text-lemon-muted border-lemon-muted/20" :
                         tx.type === 'wallet' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                         "bg-white/5 text-white/40 border-white/5"
                       )}>
                          {tx.type}
                       </span>
                    </td>
                    <td className="p-6">
                       <span className="font-mono text-xs text-white/30">{tx.ref}</span>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-bold text-sm",
                            tx.status === 'failed' ? "text-red-500" : "text-white"
                          )}>₦{(tx.amount ?? 0).toLocaleString()}</span>
                          {tx.status === 'success' ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          )}
                       </div>
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/admin/payments/${tx.id}`)}
                            className="w-10 h-10 rounded-xl bg-lemon-muted/10 text-lemon-muted flex items-center justify-center hover:bg-lemon-muted hover:text-black transition-all"
                            title="View Receipt"
                          >
                             <FileText size={18} />
                          </button>
                          <div className="relative group/menu">
                            <button className="w-10 h-10 rounded-xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                               <MoreVertical size={18} />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-ink-deep border border-white/10 rounded-2xl shadow-2xl z-50 py-2 opacity-0 scale-95 pointer-events-none group-focus-within/menu:opacity-100 group-focus-within/menu:scale-100 group-focus-within/menu:pointer-events-auto transition-all origin-top-right">
                               <button 
                                onClick={() => handleVerify(tx.id)}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3 text-green-500"
                               >
                                  <CheckCircle2 size={16} />
                                  Verify Transaction
                               </button>
                               <button 
                                onClick={() => handleRefund(tx.id)}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3 text-red-400"
                               >
                                  <RotateCcw size={16} />
                                  Refund Payment
                               </button>
                               <button 
                                onClick={() => navigate(`/admin/users/${tx.user}`)}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3"
                               >
                                  <User size={16} />
                                  View User Profile
                               </button>
                            </div>
                          </div>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
