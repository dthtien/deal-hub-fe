import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Skeleton } from '@heroui/react'

const API_BASE = import.meta.env.VITE_API_URL || ''

interface StorePrice {
  store: string
  price: number
  old_price: number
  discount: number
  url: string
  image_url: string
  deal_id: number
}

interface PricePoint {
  price: number
  recorded_at: string
}

interface BestPriceData {
  slug: string
  name: string
  search_term: string
  current_best_price: number
  highest_price: number
  lowest_ever_price: number
  savings_vs_highest: number
  product_count: number
  stores: StorePrice[]
  price_history: PricePoint[]
  best_deal: {
    id: number
    name: string
    price: number
    old_price: number
    discount: number
    store: string
    image_url: string
    store_url: string
    categories: string[]
  }
}

function formatPrice(price: number): string {
  return `$${Number(price).toFixed(2)}`
}

function formatChartDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
  })
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-10 w-3/4 rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-48 w-48 rounded-xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
          <Skeleton className="h-6 w-1/4 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export default function BestPricePage() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<BestPriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setData(null)
    fetch(`${API_BASE}/api/v1/seo/best_price/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true)
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (d) setData(d)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <LoadingSkeleton />

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Product Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          We couldn't find any deals matching "{slug?.replace(/-/g, ' ')}".
        </p>
        <Link
          to="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Browse All Deals
        </Link>
      </div>
    )
  }

  if (!data) return null

  const chartData = [...data.price_history].reverse().map((point) => ({
    date: formatChartDate(point.recorded_at),
    price: Number(point.price),
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    image: data.best_deal.image_url,
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: data.current_best_price,
      highPrice: data.highest_price,
      priceCurrency: 'AUD',
      offerCount: data.product_count,
    },
  }

  const metaDescription = `Find the best price for ${data.name} in Australia. Current best: ${formatPrice(data.current_best_price)}. Compare prices across ${data.product_count} store${data.product_count !== 1 ? 's' : ''}. Save up to ${data.savings_vs_highest}% vs highest price.`

  return (
    <>
      <Helmet>
        <title>Best price for {data.name} in Australia | OzVFY</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`Best price for ${data.name} in Australia | OzVFY`} />
        <meta property="og:description" content={metaDescription} />
        {data.best_deal.image_url && (
          <meta property="og:image" content={data.best_deal.image_url} />
        )}
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Best price for ${data.name} in Australia | OzVFY`} />
        <meta name="twitter:description" content={metaDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* H1 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Best price for {data.name} in Australia
        </h1>

        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Product Image */}
            {data.best_deal.image_url && (
              <div className="flex-shrink-0">
                <img
                  src={data.best_deal.image_url}
                  alt={data.name}
                  className="w-40 h-40 object-contain rounded-xl bg-gray-50 dark:bg-gray-700 p-2"
                />
              </div>
            )}

            {/* Price Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Current Best
                  </p>
                  <p className="text-3xl font-bold text-orange-500">
                    {formatPrice(data.current_best_price)}
                  </p>
                </div>
                <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-600" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Lowest Ever
                  </p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                    {formatPrice(data.lowest_ever_price)}
                  </p>
                </div>
                <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-600" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Highest
                  </p>
                  <p className="text-2xl font-semibold text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(data.highest_price)}
                  </p>
                </div>
              </div>

              {data.savings_vs_highest > 0 && (
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  🎉 You save up to{' '}
                  <span className="font-bold">{data.savings_vs_highest}%</span> vs highest price
                </p>
              )}

              <a
                href={data.best_deal.store_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
              >
                Get Best Deal →
              </a>

              {data.best_deal.categories && data.best_deal.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.best_deal.categories.slice(0, 5).map((cat) => (
                    <Link
                      key={cat}
                      to={`/categories/${encodeURIComponent(cat)}`}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Comparison Table */}
        {data.stores.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Compare prices across {data.stores.length} store{data.stores.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Was
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Saving
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.stores.map((store, idx) => (
                    <tr
                      key={`${store.store}-${idx}`}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${idx === 0 ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {idx === 0 && (
                          <span className="inline-block mr-2 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-semibold">
                            Best
                          </span>
                        )}
                        {store.store}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(store.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">
                        {store.old_price && store.old_price > store.price ? (
                          <span className="line-through">{formatPrice(store.old_price)}</span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {store.discount ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {store.discount}% off
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={store.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-block text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
                        >
                          Get Deal
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Price History Chart */}
        {chartData.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Price History
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                  width={60}
                />
                <Tooltip
                  formatter={(value: unknown) => [value != null ? `$${Number(value).toFixed(2)}` : '—', 'Price']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Related Deals */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Related Deals
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Looking for more deals? Browse our full deals directory.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              All Deals
            </Link>
            <Link
              to="/best-drops"
              className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Best Price Drops
            </Link>
            {data.best_deal.categories && data.best_deal.categories.length > 0 && (
              <Link
                to={`/categories/${encodeURIComponent(data.best_deal.categories[0])}`}
                className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                More {data.best_deal.categories[0]} Deals
              </Link>
            )}
            <Link
              to={`/stores/${encodeURIComponent(data.best_deal.store)}`}
              className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              {data.best_deal.store} Deals
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
