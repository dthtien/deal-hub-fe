import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { EnvelopeIcon, FireIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STORES = ['ASOS', 'The Iconic', 'Kmart', 'Big W', 'JB Hi-Fi', 'Myer', 'Nike', 'Culture Kings', 'The Good Guys', 'Office Works'];
const CATEGORIES = ['clothing', 'shoes', 'electronics', 'home', 'beauty', 'sports', 'toys', 'books', 'gaming', 'accessories'];

const SubscribePage = () => {
  const [email, setEmail] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriber: {
            email,
            preferences: {
              stores: selectedStores,
              categories: selectedCategories,
            }
          }
        })
      });
      const data = await res.json();
      if (res.ok || res.status === 200) {
        setStatus('success');
        setMessage(data.message || 'Subscribed!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Subscribe to Weekly Deals | OzVFY</title>
        <meta name="description" content="Get Australia's best deals delivered to your inbox every week. Free, no spam." />
      </Helmet>

      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <EnvelopeIcon className="w-14 h-14 mx-auto text-orange-500 mb-4" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Weekly Deals Digest
          </h1>
          <p className="text-gray-500 text-lg">
            Get Australia's top 10 deals every Monday morning. Free, no spam, unsubscribe anytime.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center bg-green-50 border border-green-200 rounded-2xl p-8">
            <CheckCircleIcon className="w-14 h-14 mx-auto text-green-500 mb-3" />
            <p className="text-lg font-bold text-green-700 mb-2">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              Your first digest will arrive next Monday. Keep an eye on your inbox!
            </p>
            <Link to="/" className="text-orange-500 hover:underline text-sm">← Browse deals now</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your email address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              />
            </div>

            {/* Store preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Favourite stores <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <p className="text-xs text-gray-400 mb-4">We'll prioritise deals from these stores.</p>
              <div className="flex flex-wrap gap-2">
                {STORES.map(store => (
                  <button
                    key={store}
                    type="button"
                    onClick={() => toggleItem(selectedStores, setSelectedStores, store)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      selectedStores.includes(store)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>
            </div>

            {/* Category preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Favourite categories <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <p className="text-xs text-gray-400 mb-4">We'll curate deals that match your interests.</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleItem(selectedCategories, setSelectedCategories, cat)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors ${
                      selectedCategories.includes(cat)
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {status === 'error' && (
              <p className="text-sm text-rose-500 bg-rose-50 px-4 py-3 rounded-xl">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-base"
            >
              {status === 'loading' ? 'Subscribing...' : <span className="flex items-center justify-center gap-2"><FireIcon className="w-4 h-4" />Subscribe — it's free!</span>}
            </button>

            <p className="text-center text-xs text-gray-400">
              No spam. Unsubscribe anytime. We may earn affiliate commissions on deals.
            </p>
          </form>
        )}
      </div>
    </>
  );
};

export default SubscribePage;
