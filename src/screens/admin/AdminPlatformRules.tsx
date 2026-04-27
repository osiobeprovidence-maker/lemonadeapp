import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Shield, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Search,
  BookOpen,
  MessageSquare,
  DollarSign
} from 'lucide-react';

const MOCK_RULES = [
  { id: '1', title: 'Explicit Gore', category: 'Safety', status: 'active', desc: 'No graphic violence without content warning tags.' },
  { id: '2', title: 'AI Content', category: 'Integrity', status: 'active', desc: 'All AI-generated work must be tagged as AI.' },
  { id: '3', title: 'Copyright', category: 'Legal', status: 'active', desc: 'Must own 100% of the rights to published works.' },
  { id: '4', title: 'Spamming', category: 'Community', status: 'disabled', desc: 'Repetitive comments or marketing is forbidden.' },
];

export default function AdminPlatformRules() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = () => {
    alert('Platform rules updated successfully! (Mock)');
  };

  const handleAddRule = () => {
    alert('Logic for adding a new rule triggered. (Mock)');
  };

  const handleDeleteRule = (title: string) => {
    if (confirm(`Are you sure you want to delete the rule: ${title}? (Mock)`)) {
      alert(`Rule "${title}" deleted. (Mock)`);
    }
  };

  const handleEditRule = (title: string) => {
    alert(`Editing rule: ${title}. (Mock)`);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Settings</span>
        </button>

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-8 h-12 bg-lemon-muted text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-lemon-muted/20"
        >
          <Save size={20} />
          Save Rules
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight mb-2 uppercase italic">Platform Rules</h1>
          <p className="text-white/40 font-bold">Manage the governance framework and content standards.</p>
        </div>
        <button 
          onClick={handleAddRule}
          className="flex items-center justify-center gap-2 px-6 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
        >
          <Plus size={20} />
          Add New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Search rules, categories, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
          />
        </div>
        <div className="relative">
          <select className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl px-6 font-bold focus:outline-none appearance-none cursor-pointer">
            <option>All Categories</option>
            <option>Safety</option>
            <option>Legal</option>
            <option>Integrity</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_RULES.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())).map((rule) => (
          <div key={rule.id} className="p-8 bg-ink-deep border border-white/5 rounded-[40px] hover:bg-white/2 transition-colors relative group">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      rule.category === 'Safety' ? 'bg-red-400/10 text-red-400' :
                      rule.category === 'Integrity' ? 'bg-purple-400/10 text-purple-400' :
                      'bg-blue-400/10 text-blue-400'
                   }`}>
                      <FileText size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{rule.category}</p>
                      <h3 className="text-xl font-display font-black tracking-tight italic uppercase">{rule.title}</h3>
                   </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                  rule.status === 'active' ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'
                }`}>
                  {rule.status}
                </div>
             </div>
             
             <p className="text-white/60 font-medium mb-8 leading-relaxed italic">"{rule.desc}"</p>

             <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEditRule(rule.title)}
                  className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >Edit Rule</button>
                <button 
                  onClick={() => handleDeleteRule(rule.title)}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-400/10 hover:text-red-400 rounded-xl transition-all border border-white/5"
                >
                   <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Moderation Presets */}
      <div className="p-10 bg-ink-deep border border-white/5 rounded-[40px]">
         <div className="flex items-center gap-2 mb-8">
            <Shield size={24} className="text-lemon-muted" />
            <h3 className="text-xl font-display font-black tracking-tight uppercase italic">Moderation Presets</h3>
         </div>
         <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20">
                     <AlertCircle size={24} />
                  </div>
                  <div>
                     <p className="font-black text-lg">Auto-Flag Threshold</p>
                     <p className="text-sm font-medium text-white/40 italic">Flag stories for review after 5 reports in 1 hour.</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <input type="number" defaultValue={5} className="w-16 h-12 bg-black border border-white/10 rounded-xl px-4 font-black" />
                  <span className="text-sm font-black uppercase tracking-widest text-white/20">Reports</span>
               </div>
            </div>
            
            <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20">
                     <CheckCircle size={24} />
                  </div>
                  <div>
                     <p className="font-black text-lg">Instant Verification</p>
                     <p className="text-sm font-medium text-white/40 italic">Automatically verify creators with portfolios on Trusted Platforms.</p>
                  </div>
               </div>
               <div className="flex items-center h-12 gap-2 p-1.5 bg-black rounded-xl">
                  <button className="px-4 h-full rounded-lg bg-lemon-muted text-black text-[10px] font-black uppercase">Enabled</button>
                  <button className="px-4 h-full rounded-lg text-white/40 text-[10px] font-black uppercase">Disabled</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
