import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Download, 
  ChevronLeft,
  DollarSign,
  History,
  Shield,
  ExternalLink,
  MoreVertical,
  Receipt,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPaymentDetail() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('completed');

  // Mock data
  const payment = {
    id: paymentId || 'TRX-9482-LMN',
    user: 'riderezzy',
    email: 'riderezzy@gmail.com',
    type: 'Wallet Top-up',
    amount: 25.00,
    lemons: 2500,
    status: status,
    date: 'Apr 26, 2026',
    time: '4:20 PM',
    paymentMethod: 'Visa ending in 4242',
    reference: 'ch_3NfG99L2eZvKYlo21A6J3n5',
    notes: 'Standard top-up for story unlocks.'
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handleExport = () => {
    alert('Receipt exported as PDF (Mock)');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/payments')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Payments</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
          >
            <Download size={18} />
            Export Receipt
          </button>
          {status === 'pending' && (
            <button 
              onClick={() => handleStatusChange('completed')}
              className="px-6 h-12 bg-green-400 text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Resolve Transaction
            </button>
          )}
          <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Transaction Detail Card */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
                       <Receipt size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-display font-black tracking-tight uppercase italic">Transaction Detail</h2>
                       <p className="text-xs font-black uppercase tracking-widest text-white/30">Ref: {payment.id}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`text-sm font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      status === 'completed' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                      status === 'failed' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                      'bg-white/5 text-white/40 border-white/5'
                    }`}>
                      {status}
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                 <div className="space-y-6">
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Transaction Type</p>
                       <p className="text-lg font-black">{payment.type}</p>
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Amount Charged</p>
                       <p className="text-3xl font-display font-black italic text-lemon-muted">${payment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Items Granted</p>
                       <p className="font-bold flex items-center gap-2">
                          <span className="w-5 h-5 bg-lemon-muted text-black rounded-full flex items-center justify-center text-[10px] font-black">L</span>
                          {payment.lemons} Lemons
                       </p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Date & Time</p>
                       <p className="font-bold text-sm">{payment.date} at {payment.time}</p>
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Payment Method</p>
                       <div className="flex items-center gap-2">
                          <CreditCard size={18} className="text-white/40" />
                          <p className="font-bold text-sm tracking-tight">{payment.paymentMethod}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">Bank Reference</p>
                       <p className="font-mono text-[10px] text-white/40 tracking-wider break-all">{payment.reference}</p>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Internal Notes</p>
                 <p className="text-sm font-medium italic text-white/60">
                    "{payment.notes}"
                 </p>
              </div>
           </div>

           {/* User Context */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <Shield size={20} className="text-lemon-muted" />
                    <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Associated User</h3>
                 </div>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-lemon-muted flex items-center justify-center text-black font-black text-xl">
                       {payment.user[0].toUpperCase()}
                    </div>
                    <div>
                       <p className="font-black text-lg">@{payment.user}</p>
                       <p className="text-sm font-bold text-white/40">{payment.email}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                       <p className="text-[10px] font-black uppercase text-white/30">Total Spend</p>
                       <p className="font-black text-green-400">$245.00</p>
                    </div>
                    <Link to={`/admin/users/${payment.user}`} className="w-12 h-12 bg-white/5 hover:bg-white text-black rounded-2xl flex items-center justify-center transition-all">
                       <ArrowUpRight size={24} className="group-hover:text-black text-white/40" />
                    </Link>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           {/* Actions Card */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 italic">Support Actions</h3>
              <div className="space-y-3">
                 <button className="w-full py-4 bg-white/5 hover:bg-red-400/10 hover:text-red-400 rounded-2xl border border-white/5 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                    <XCircle size={16} />
                    Void Transaction
                 </button>
                 <button className="w-full py-4 bg-white/5 hover:bg-orange-400/10 hover:text-orange-400 rounded-2xl border border-white/5 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                    <Shield size={16} />
                    Mark Suspicious
                 </button>
                 <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95">
                    Contact User
                 </button>
              </div>
           </div>

           {/* Similar Transactions */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <History size={20} className="text-lemon-muted" />
                    <h3 className="text-lg font-display font-black tracking-tight uppercase italic">User History</h3>
                 </div>
                 <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-lemon-muted">See All</button>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'TRX-12', type: 'Premium', amount: '$4.99', date: '2d ago' },
                   { id: 'TRX-09', type: 'Top-up', amount: '$9.99', date: '1w ago' },
                   { id: 'TRX-04', type: 'Top-up', amount: '$25.00', date: '3w ago' },
                 ].map((trx, i) => (
                   <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 border-dashed">
                      <div>
                         <p className="text-sm font-bold">{trx.type}</p>
                         <p className="text-[9px] font-black uppercase text-white/30">{trx.id}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-white/80">{trx.amount}</p>
                         <p className="text-[9px] font-black uppercase text-white/30 text-right">{trx.date}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Admin Internal History / Notes */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                 <Clock size={20} className="text-lemon-muted" />
                 <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Log</h3>
              </div>
              <div className="text-[10px] font-bold space-y-3 mb-6">
                 <p className="text-white/40"><span className="text-white/60">Today:</span> Transaction automatically verified</p>
                 <p className="text-white/40"><span className="text-white/60">Apr 26:</span> Stripe payment confirmed</p>
              </div>
              <textarea 
                placeholder="Add internal transaction note..."
                className="w-full h-24 bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-medium focus:outline-none resize-none mb-4"
              />
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">Add Internal Note</button>
           </div>
        </div>
      </div>
    </div>
  );
}
