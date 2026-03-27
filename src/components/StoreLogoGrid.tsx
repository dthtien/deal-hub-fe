import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface StoreInfo {
  name: string;
  deal_count: number;
}

const STORE_INITIALS: Record<string, string> = {
  'JB Hi-Fi': 'JB',
  'Office Works': 'OW',
  'The Good Guys': 'GG',
  'Kmart': 'KM',
  'Big W': 'BW',
  'Target AU': 'TG',
  'ASOS': 'AS',
  'The Iconic': 'TI',
  'Myer': 'MY',
  'Nike': 'NK',
  'Culture Kings': 'CK',
  'JD Sports': 'JD',
  'Glue Store': 'GS',
  'Lorna Jane': 'LJ',
  'Beginning Boutique': 'BB',
  'Universal Store': 'US',
  'Booking.com': 'BK',
  'Good Buyz': 'GB',
};

function StoreLogo({ name }: { name: string }) {
  const initials = STORE_INITIALS[name] || name.slice(0, 2).toUpperCase();
  const colors = [
    'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;
  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold ${colors[colorIdx]}`}>
      {initials}
    </div>
  );
}

export default function StoreLogoGrid() {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/stores`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setStores(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="my-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BuildingStorefrontIcon className="w-5 h-5 text-orange-500" />
          Shop by Store
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  return (
    <section className="my-10">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BuildingStorefrontIcon className="w-5 h-5 text-orange-500" />
        Shop by Store
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {stores.filter(s => s.deal_count > 0).map(store => (
          <Link
            key={store.name}
            to={`/stores/${encodeURIComponent(store.name)}`}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
          >
            <div className="relative">
              <StoreLogo name={store.name} />
              {store.deal_count > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-orange-500 text-white rounded-full px-1 min-w-[18px] text-center leading-[18px]">
                  {store.deal_count > 99 ? '99+' : store.deal_count}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-300 group-hover:text-orange-500 transition-colors text-center max-w-[64px] leading-tight font-medium">
              {store.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
