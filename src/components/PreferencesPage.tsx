import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircleIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CATEGORIES = ['clothing', 'shoes', 'electronics', 'home', 'beauty', 'sports', 'toys', 'books', 'gaming', 'accessories', 'food', 'travel'];
const FREQUENCIES = [
  { value: 'daily', label: 'Daily', desc: 'Get deals every morning' },
  { value: 'weekly', label: 'Weekly', desc: 'Monday roundup' },
  { value: 'never', label: 'Never', desc: 'Pause all digests' },
] as const;

export default function PreferencesPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'never'>('weekly');
  const [categories, setCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    // Load current preferences
    // No GET endpoint, so just use defaults
  }, [token]);

  const toggle = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing token.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscribers/${encodeURIComponent(token)}/update_preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          preferences: { frequency, categories, max_price: maxPrice }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Preferences saved!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to save.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Helmet>
        <title>Email Preferences – OzVFY</title>
      </Helmet>

      <div className="flex items-center gap-3 mb-8">
        <AdjustmentsHorizontalIcon className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Preferences</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Personalise your deal digest</p>
        </div>
      </div>

      {!token && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          Missing token. Please use the link from your email.
        </div>
      )}

      {status === 'success' ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-green-700 dark:text-green-300">{message}</p>
          <Link to="/" className="mt-4 inline-block text-sm text-orange-500 hover:underline">← Browse deals</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Digest Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    frequency === f.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-300'
                  }`}
                >
                  <div className={`text-sm font-bold ${frequency === f.value ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>{f.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Categories of Interest</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggle(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors border ${
                    categories.includes(cat)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Max price slider */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Max Price: <span className="text-orange-600 dark:text-orange-400">${maxPrice}</span>
            </label>
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>$0</span><span>$500</span></div>
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !token}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {status === 'loading' ? 'Saving…' : 'Save Preferences'}
          </button>
        </form>
      )}
    </div>
  );
}
