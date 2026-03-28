import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

interface TrendingStore {
  name: string
  click_count: number
  favicon_url: string
}

export default function TrendingStoresWidget() {
  const [stores, setStores] = useState<TrendingStore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/stores/trending`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setStores(d.stores || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3">
          🔥 Trending Stores
        </h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex-shrink-0 flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 w-24">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (stores.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3">
        🔥 Trending Stores
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {stores.map(store => (
          <a
            key={store.name}
            href={`/deals?stores=${encodeURIComponent(store.name)}`}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-700 transition-all"
          >
            <img
              src={store.favicon_url}
              alt={store.name}
              className="w-8 h-8 rounded-lg object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap max-w-[80px] truncate">
              {store.name}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
              {store.click_count.toLocaleString()} clicks
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
