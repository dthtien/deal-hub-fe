import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BellIcon, CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { TOP_CATEGORIES } from '../utils/categoryNormalizer';

const API_BASE = import.meta.env.VITE_API_URL || '';
const EMAIL_KEY = 'ozvfy_email';

interface AlertState {
  [category: string]: boolean;
}

export default function CategoryAlertsPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || '');
  const [alerts, setAlerts] = useState<AlertState>({});
  const [loading, setLoading] = useState<string | null>(null);

  // Persist email
  useEffect(() => {
    if (email) localStorage.setItem(EMAIL_KEY, email);
  }, [email]);

  const toggle = async (category: string) => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address first', 'error');
      return;
    }

    const currentlyOn = alerts[category];
    setLoading(category);

    try {
      if (currentlyOn) {
        const res = await fetch(`${API_BASE}/api/v1/category_alerts`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, category }),
        });
        if (!res.ok) throw new Error('Failed');
        setAlerts(a => ({ ...a, [category]: false }));
        showToast(`Unsubscribed from ${category} alerts`, 'success');
      } else {
        const res = await fetch(`${API_BASE}/api/v1/category_alerts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, category }),
        });
        if (!res.ok) throw new Error('Failed');
        setAlerts(a => ({ ...a, [category]: true }));
        showToast(`Subscribed to ${category} alerts!`, 'success');
      }
    } catch {
      showToast('Something went wrong. Try again.', 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Helmet>
        <title>Category Deal Alerts | OzVFY</title>
        <meta name="description" content="Get notified when new deals drop in your favourite categories." />
      </Helmet>

      <div className="flex items-center gap-3 mb-6">
        <BellIcon className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Category Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new deals drop in your favourite categories</p>
        </div>
      </div>

      {/* Email input */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <EnvelopeIcon className="w-4 h-4" />
          Your email address
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">We'll send deal alerts to this address. Unsubscribe anytime.</p>
      </div>

      {/* Category toggles */}
      <div className="space-y-3">
        {TOP_CATEGORIES.map(cat => {
          const isOn = alerts[cat.label] ?? false;
          const isLoading = loading === cat.label;
          return (
            <div
              key={cat.label}
              className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{cat.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {isOn ? (
                    <span className="flex items-center gap-1 text-emerald-500">
                      <CheckCircleIcon className="w-3 h-3" /> Alerts active
                    </span>
                  ) : 'No alerts set'}
                </p>
              </div>
              <button
                onClick={() => toggle(cat.label)}
                disabled={isLoading}
                aria-pressed={isOn}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60 ${
                  isOn ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isOn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
