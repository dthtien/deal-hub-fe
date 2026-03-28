import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Metadata {
  hot_count?: number;
  flash_count?: number;
  biggest_drops_count?: number;
  new_today?: number;
}

export default function DealAggregatorWidget() {
  const [meta, setMeta] = useState<Metadata>({});

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/metadata`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setMeta(d.metadata || d))
      .catch(() => {});
  }, []);

  const items = [
    { emoji: '🔥', label: 'Hot', count: meta.hot_count ?? 0, href: '/deals/hot' },
    { emoji: '⚡', label: 'Flash', count: meta.flash_count ?? 0, href: '/deals/flash' },
    { emoji: '📉', label: 'Drops', count: meta.biggest_drops_count ?? 0, href: '/deals/biggest-drops' },
    { emoji: '🆕', label: 'New Today', count: meta.new_today ?? 0, href: '/deals/new-today' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 mb-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {items.map(item => (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            <span>{item.emoji}</span>
            <span className="font-bold text-gray-900 dark:text-white">{item.count.toLocaleString()}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
