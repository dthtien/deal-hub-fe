import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GiftIcon, DevicePhoneMobileIcon, UserIcon, HeartIcon, CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_count: number;
}

const GUIDE_META: Record<string, { icon: React.ElementType; color: string; emoji: string }> = {
  'gifts-under-50': { icon: CurrencyDollarIcon, color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400', emoji: '💵' },
  'gifts-for-him': { icon: UserIcon, color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400', emoji: '👨' },
  'gifts-for-her': { icon: HeartIcon, color: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400', emoji: '👩' },
  'tech-gifts': { icon: DevicePhoneMobileIcon, color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400', emoji: '💻' },
};

const GIFT_SLUGS = ['gifts-under-50', 'gifts-for-him', 'gifts-for-her', 'tech-gifts'];

function getSeasonalBanner(): string | null {
  const month = new Date().getMonth() + 1; // 1-12
  if (month === 3 || month === 4) return 'Easter Gift Ideas 🐣';
  if (month === 12) return 'Christmas Gift Ideas 🎄';
  if (month === 5) return "Mother's Day Gift Ideas 💐";
  if (month === 9) return "Father's Day Gift Ideas 🎁";
  return null;
}

export default function GiftGuidePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const seasonalBanner = getSeasonalBanner();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/collections`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const all: Collection[] = d.collections || [];
        const guides = all.filter(c => GIFT_SLUGS.includes(c.slug));
        setCollections(guides);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Seasonal banner */}
      {seasonalBanner && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-300 dark:from-orange-600 dark:to-amber-500 p-6 text-center shadow-lg">
          <h2 className="text-2xl font-extrabold text-white drop-shadow">{seasonalBanner}</h2>
          <p className="text-white/90 mt-1 text-sm">Curated gift ideas for everyone on your list</p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <GiftIcon className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Gift Guide</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Curated collections to help you find the perfect gift</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {collections.length === 0
            ? GIFT_SLUGS.map(slug => {
                const meta = GUIDE_META[slug] || { icon: GiftIcon, color: 'bg-gray-100 dark:bg-gray-800 text-gray-500', emoji: '🎁' };
                const Icon = meta.icon;
                return (
                  <Link
                    key={slug}
                    to={`/collections/${slug}`}
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-3"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${meta.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors capitalize">
                        {slug.replace(/-/g, ' ')}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Browse deals →</p>
                    </div>
                  </Link>
                );
              })
            : collections.map(c => {
                const meta = GUIDE_META[c.slug] || { icon: GiftIcon, color: 'bg-gray-100 dark:bg-gray-800 text-gray-500', emoji: '🎁' };
                const Icon = meta.icon;
                return (
                  <button
                    key={c.slug}
                    onClick={() => navigate(`/collections/${c.slug}`)}
                    className="group text-left rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-3"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                        {meta.emoji} {c.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/30 rounded-full px-2 py-0.5 self-start">
                      {c.product_count} deals
                    </span>
                  </button>
                );
              })
          }
        </div>
      )}
    </div>
  );
}
