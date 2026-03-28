import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { TagIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface AlertHistory {
  id: number;
  product_id: number;
  product_name: string;
  product_image_url: string | null;
  store: string | null;
  store_url: string | null;
  target_price: number | null;
  triggered_price: number | null;
  triggered_at: string | null;
  status: string;
  created_at: string;
}

interface Metadata {
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const PriceAlertHistoryPage = () => {
  const [email, setEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('ozvfy_alert_email') || '';
    if (stored) {
      setInputEmail(stored);
      setEmail(stored);
    }
  }, []);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(`${API_BASE}/api/v1/price_alerts/history?email=${encodeURIComponent(email)}&page=${page}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        setHistory(d.history || []);
        setMetadata(d.metadata || null);
      })
      .catch(() => showToast('Failed to load alert history', 'error'))
      .finally(() => setLoading(false));
  }, [email, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;
    localStorage.setItem('ozvfy_alert_email', inputEmail.trim());
    setPage(1);
    setEmail(inputEmail.trim());
  };

  const statusColor = (status: string) => {
    if (status === 'triggered') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (status === 'expired') return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <Helmet>
        <title>Price Alert History | OzVFY</title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/notifications" className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-orange-500" />
            Price Alert History
          </h1>
        </div>

        {/* Email search form */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="email"
            value={inputEmail}
            onChange={e => setInputEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && email && history.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <TagIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No triggered or expired alerts</p>
            <p className="text-sm mt-1">Set price alerts on deals to get notified when prices drop.</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <>
            <div className="space-y-3 mb-6">
              {history.map(alert => (
                <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex gap-3 items-start">
                  {/* Product image */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                    {alert.product_image_url ? (
                      <img
                        src={alert.product_image_url}
                        alt={alert.product_name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <TagIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {alert.product_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      {alert.store && <span>{alert.store}</span>}
                      {alert.triggered_at && (
                        <span>{new Date(alert.triggered_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs mb-2">
                      {alert.target_price != null && (
                        <span className="text-gray-500 dark:text-gray-400">
                          Target: <span className="font-semibold text-gray-700 dark:text-gray-200">${Number(alert.target_price).toFixed(2)}</span>
                        </span>
                      )}
                      {alert.triggered_price != null && (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          Triggered at: ${Number(alert.triggered_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                      {alert.store_url && (
                        <a
                          href={alert.store_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 font-medium transition-colors"
                        >
                          <ShoppingBagIcon className="w-3.5 h-3.5" />
                          Shop again
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {metadata && metadata.total_pages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {metadata.page} of {metadata.total_pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(metadata.total_pages, p + 1))}
                  disabled={page >= metadata.total_pages}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PriceAlertHistoryPage;
