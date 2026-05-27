import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useGamification } from '../../hooks/useGamification';

function sliceStyle(index: number, total: number, color: string) {
  const angle = 360 / total;
  const rotate = index * angle;
  return {
    transform: `rotate(${rotate}deg) skewY(${90 - angle}deg)`,
    background: color,
  } as React.CSSProperties;
}

const COLORS = ['#F6E05E', '#FBCFE8', '#A78BFA', '#60A5FA', '#34D399', '#FB923C', '#F87171', '#C4B5FD'];

export default function SpinWheel() {
  const { inventory, loading, spin } = useGamification();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const items = useMemo(() => inventory || [], [inventory]);
  const totalWeight = items.reduce((s: number, it: any) => s + (it.weight || 1), 0);

  const handleSpin = async () => {
    if (spinning || items.length === 0) return;
    setSpinning(true);
    setResult(null);

    // use current week start
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0,0,0,0);
    weekStart.setDate(now.getDate() - now.getDay());
    const iso = weekStart.toISOString();

    try {
      const res = await spin(iso);
      setResult(res.reward || null);
    } catch (err: any) {
      setResult({ error: err.message || String(err) });
    } finally {
      // ensure wheel stops after animation
      setTimeout(() => setSpinning(false), 3500);
    }
  };

  const wheelRotation = spinning ? 1080 + Math.floor(Math.random() * 360) : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: wheelRotation }}
          transition={{ duration: 3.2, ease: 'circOut' }}
          className="w-64 h-64 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(180deg,#0b0b0b,#131313)' }}
        >
          <div className="w-full h-full relative">
            {items.map((it: any, idx: number) => (
              <div
                key={it.rewardId || idx}
                className="absolute top-0 left-0 w-full h-full origin-center transform"
                style={sliceStyle(idx, Math.max(3, items.length), COLORS[idx % COLORS.length])}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black" style={{ transform: 'skewY(-' + (90 - (360 / Math.max(3, items.length))) + 'deg) rotate(' + (360 / Math.max(3, items.length) / 2) + 'deg)' }}>
                  {it.type}{it.amount ? ` • ${it.amount}` : ''}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="absolute">
          <button onClick={handleSpin} disabled={spinning || loading} className="bg-lemon-muted text-black font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg">
            {spinning ? 'Spinning...' : 'Spin'}
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        {result ? (
          result.error ? (
            <div className="text-sm text-red-400">Error: {result.error}</div>
          ) : (
            <div className="text-sm text-white/90">You won: {result.type}{result.amount ? ` • ${result.amount}` : ''}</div>
          )
        ) : (
          <div className="text-sm text-white/50">Weekly spins available after meeting engagement goals.</div>
        )}
      </div>
    </div>
  );
}
