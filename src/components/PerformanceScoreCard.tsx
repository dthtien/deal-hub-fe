import { useEffect, useState, useRef } from 'react';
import { useCountUp } from '../hooks/useCountUp';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Stats {
  totalDeals: number;
  totalStores: number;
  estimatedSavings: number;
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const count = useCountUp(value, 1800);
  return (
    <span className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

const PerformanceScoreCard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch aggregate data from stores index
    Promise.all([
      fetch(`${API_BASE}/api/v1/stores`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`${API_BASE}/api/v1/deals/freshness_stats`).then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([storesData, freshnessData]) => {
        const stores: Array<{ deal_count: number; avg_discount?: number }> = storesData.stores || [];
        const totalDeals = stores.reduce((sum, s) => sum + (s.deal_count || 0), 0);
        const totalStores = stores.length;
        const avgDiscount = stores.reduce((sum, s) => sum + (s.avg_discount || 0), 0) / Math.max(stores.length, 1);
        // Rough estimate: total deals * avg price (~$80 est) * avg discount * 0.001
        const estimatedSavings = Math.round(totalDeals * 80 * (avgDiscount / 100) * 0.001) * 1000;
        const allDeals = (freshnessData?.ultra_fresh || 0) + (freshnessData?.fresh || 0) + (freshnessData?.recent || 0) + (freshnessData?.older || 0);
        setStats({
          totalDeals: Math.max(totalDeals, allDeals),
          totalStores,
          estimatedSavings,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  if (!stats) return null;

  return (
    <div
      ref={cardRef}
      className="bg-gradient-to-br from-orange-500 to-rose-500 dark:from-orange-600 dark:to-rose-600 rounded-2xl p-6 mb-6 text-white shadow-lg"
    >
      <h2 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">OzVFY by the numbers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-extrabold">
            {visible ? <AnimatedNumber value={stats.totalDeals} /> : '—'}
          </div>
          <p className="text-sm text-white/80 mt-1">
            deals tracked across{' '}
            <span className="font-bold">
              {visible ? <AnimatedNumber value={stats.totalStores} /> : '—'}
            </span>{' '}
            stores
          </p>
        </div>
        <div className="text-center sm:border-x border-white/20">
          <div className="text-3xl font-extrabold">
            {visible ? <AnimatedNumber value={stats.estimatedSavings} prefix="$" /> : '—'}
          </div>
          <p className="text-sm text-white/80 mt-1">estimated savings for Australians</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-extrabold">🇦🇺</div>
          <p className="text-sm text-white/80 mt-1">100% Australian deals</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceScoreCard;
