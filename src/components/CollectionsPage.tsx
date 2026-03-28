import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  product_count: number;
  updated_at?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const COVER_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/v1/collections`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setCollections(d.collections || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Helmet><title>Curated Collections | OzVFY</title></Helmet>
      <div className="py-8">
        <div className="flex items-center gap-3 mb-6">
          <SparklesIcon className="w-7 h-7 text-orange-500 dark:text-orange-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Curated Collections</h1>
          <button
            onClick={load}
            disabled={loading}
            className="ml-auto flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors disabled:opacity-50"
            aria-label="Refresh collections"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {collections.map((col, idx) => (
              <Link
                key={col.id}
                to={`/collections/${col.slug}`}
                className="group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900"
              >
                {col.cover_image_url ? (
                  <img src={col.cover_image_url} alt={col.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className={`w-full h-40 bg-gradient-to-br ${COVER_COLORS[idx % COVER_COLORS.length]} flex items-center justify-center`}>
                    <SparklesIcon className="w-12 h-12 text-white/70" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">{col.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 mb-1">
                    <p className="text-xs text-orange-500 dark:text-orange-400 font-semibold">{col.product_count} deals</p>
                    {col.updated_at && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">Updated {timeAgo(col.updated_at)}</p>
                    )}
                  </div>
                  {col.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{col.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
