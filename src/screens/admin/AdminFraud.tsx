import React, { useEffect, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { convex } from '../../lib/convex';
import { Button } from '../../components/ui/Button';

export default function AdminFraud() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!convex) return;
    setLoading(true);
    try {
      const data = await convex.query(api.admin.listFraudEvents, {});
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to load fraud events', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const scan = async () => {
    if (!convex) return;
    setLoading(true);
    try {
      await convex.mutation(api.admin.scanEngagementForFraud, { minutes: 60 });
      await load();
    } catch (error) {
      console.error('Failed to scan', error);
    } finally { setLoading(false); }
  };

  const resolve = async (id: string) => {
    if (!convex) return;
    await convex.mutation(api.admin.resolveFraudEvent, { id: id as any, resolved: true, reviewedBy: 'admin' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-black">Fraud Detection</h2>
          <p className="text-sm text-white/40">Scan engagement logs and review flagged events.</p>
        </div>
        <div>
          <Button onClick={scan}>Scan Recent</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
        <div className="divide-y divide-white/5">
          {events.map((e) => (
            <div key={e._id} className="flex items-start justify-between gap-4 p-3">
              <div>
                <div className="text-sm font-bold">{e.type}</div>
                <div className="text-xs text-white/40">User: {e.userId || 'unknown'}</div>
                <div className="text-xs text-white/40 mt-1">{e.description}</div>
              </div>
              <div className="flex gap-2">
                {!e.resolved && <Button onClick={() => resolve(e._id)}>Mark Resolved</Button>}
              </div>
            </div>
          ))}
          {events.length === 0 && (<div className="p-6 text-sm text-white/40">No fraud events.</div>)}
        </div>
      </div>
    </div>
  );
}
