import React, { useEffect, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { convex } from '../../lib/convex';
import { Button } from '../../components/ui/Button';
import { Plus, Trash, Edit } from 'lucide-react';

export default function AdminRewards() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ rewardId: '', type: 'lemon_coins', amount: 0, weight: 1, active: true });

  const load = async () => {
    if (!convex) return;
    setLoading(true);
    try {
      const data = await convex.query(api.admin.listSpinRewards, {});
      setItems(data || []);
    } catch (error) {
      console.error('Failed to load rewards', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!convex) return;
    try {
      if (editing) {
        await convex.mutation(api.admin.updateSpinReward, { id: editing._id as any, updates: { ...form } });
      } else {
        await convex.mutation(api.admin.createSpinReward, { ...form, rewardId: form.rewardId || `r_${Math.random().toString(36).slice(2,7)}` });
      }
      setForm({ rewardId: '', type: 'lemon_coins', amount: 0, weight: 1, active: true });
      setEditing(null);
      await load();
    } catch (error) {
      console.error('Failed to save reward', error);
    }
  };

  const remove = async (id: string) => {
    if (!convex) return;
    try {
      await convex.mutation(api.admin.deleteSpinReward, { id: id as any });
      await load();
    } catch (error) {
      console.error('Failed to delete reward', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-black">Rewards Inventory</h2>
          <p className="text-sm text-white/40">Configure weekly spin wheel rewards and weights.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setEditing(null); setForm({ rewardId: '', type: 'lemon_coins', amount: 0, weight: 1, active: true }); }}>
            <Plus size={14} /> New Reward
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
          <h3 className="font-black mb-4">Create / Edit</h3>
          <div className="grid gap-3">
            <input value={form.rewardId} onChange={(e) => setForm((f) => ({ ...f, rewardId: e.target.value }))} placeholder="Reward ID" className="w-full p-3 rounded-lg bg-black-core border border-white/10" />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full p-3 rounded-lg bg-black-core border border-white/10">
              <option value="lemon_coins">Lemon Coins</option>
              <option value="golden_ink">Golden Ink</option>
              <option value="airtime">Airtime</option>
              <option value="data">Data</option>
              <option value="cash">Cash</option>
              <option value="gift_card">Gift Card</option>
              <option value="premium">Premium Access</option>
              <option value="bonus_spin">Bonus Spin</option>
              <option value="cosmetic">Cosmetic</option>
              <option value="badge">Badge</option>
            </select>
            <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} placeholder="Amount (optional)" className="w-full p-3 rounded-lg bg-black-core border border-white/10" />
            <input type="number" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))} placeholder="Weight (higher = more likely)" className="w-full p-3 rounded-lg bg-black-core border border-white/10" />
            <label className="flex items-center gap-3"><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Active</label>
            <div className="flex gap-2 mt-2">
              <Button onClick={save}>Save</Button>
              <Button variant="ghost" onClick={() => { setEditing(null); setForm({ rewardId: '', type: 'lemon_coins', amount: 0, weight: 1, active: true }); }}>Cancel</Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-white/5 p-6 bg-ink-deep">
          <h3 className="font-black mb-4">Configured Rewards</h3>
          <div className="divide-y divide-white/5">
            {items.map((it) => (
              <div key={it._id} className="flex items-center justify-between gap-4 p-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="rounded-md bg-white/5 px-2 py-1 text-xs font-black">{it.type}</div>
                    <div className="text-sm font-bold">{it.rewardId}</div>
                  </div>
                  <div className="text-xs text-white/40">Amount: {it.amount ?? '-'} • Weight: {it.weight}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => { setEditing(it); setForm({ rewardId: it.rewardId, type: it.type, amount: it.amount || 0, weight: it.weight || 1, active: !!it.active }); }}>
                    <Edit size={14} />
                  </Button>
                  <Button variant="destructive" onClick={() => remove(it._id)}>
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="p-6 text-center text-sm text-white/40">No rewards configured yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
