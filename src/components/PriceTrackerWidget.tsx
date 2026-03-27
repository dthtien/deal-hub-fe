import { useEffect, useState } from 'react';
import { BellIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface PriceAlert {
  id: number;
  product_id: number;
  product_name?: string;
  target_price: number;
  current_price?: number;
  triggered: boolean;
  keyword?: string;
}

function PriceTrackerContent() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const email = typeof localStorage !== 'undefined' ? localStorage.getItem('ozvfy_email') : null;

  const fetchAlerts = () => {
    if (!email) { setLoading(false); return; }
    fetch(`${API_BASE}/api/v1/price_alerts?email=${encodeURIComponent(email)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setAlerts(d.price_alerts || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, [email]);

  const removeAlert = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/v1/price_alerts/${id}`, { method: 'DELETE' });
      setAlerts(a => a.filter(x => x.id !== id));
    } catch { /* silent */ }
  };

  if (!email) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        Set your email in your profile to track prices.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        No price alerts set yet. Browse deals and click 🔔 to track!
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {alerts.map(alert => {
        const status = alert.triggered ? 'triggered' : 'waiting';
        return (
          <li key={alert.id} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {alert.product_name || alert.keyword || `Product #${alert.product_id}`}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Target: <span className="font-semibold text-orange-500">${alert.target_price}</span>
                </span>
                {alert.current_price != null && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Now: <span className="font-semibold">${alert.current_price}</span>
                  </span>
                )}
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  status === 'triggered'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                }`}>
                  {status === 'triggered' ? '✅ Triggered' : '⏳ Waiting'}
                </span>
              </div>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-rose-500 transition-colors"
              title="Remove alert"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Inline version for ProfilePage */
export function PriceTrackerInline() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BellIcon className="w-5 h-5 text-orange-500" />
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Price Alerts</h2>
      </div>
      <PriceTrackerContent />
    </div>
  );
}

/** Floating widget for bottom-right corner */
export default function PriceTrackerWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {open && (
        <div className="mb-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Price Alerts</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <PriceTrackerContent />
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg transition-colors"
      >
        <BellIcon className="w-4 h-4" />
        <span>Price Alerts</span>
        {open ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronUpIcon className="w-3 h-3" />}
      </button>
    </div>
  );
}
