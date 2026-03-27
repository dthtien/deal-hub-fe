import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';
const DISMISSED_KEY = 'ozvfy_newsletter_dismissed';
const SUBSCRIBED_KEY = 'ozvfy_subscribed';

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Don't show if already dismissed or subscribed
    try {
      if (
        localStorage.getItem(DISMISSED_KEY) === '1' ||
        localStorage.getItem(SUBSCRIBED_KEY) === '1'
      ) return;
    } catch { return; }

    const handleScroll = () => {
      if (hasTriggered.current) return;
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && scrolled / total >= 0.6) {
        hasTriggered.current = true;
        setVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* noop */ }
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok || res.status === 422) {
        setSuccess(true);
        try { localStorage.setItem(SUBSCRIBED_KEY, '1'); } catch { /* noop */ }
        setTimeout(() => setVisible(false), 2500);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-base">Get daily deals 🎁</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Australia's best deals, in your inbox every morning.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-2 flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-2">
            <span className="text-2xl">🎉</span>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">You're in! Check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100
                focus:outline-none focus:border-orange-400 transition-colors"
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold
                py-2.5 rounded-xl transition-colors"
            >
              {loading ? 'Subscribing...' : 'Get daily deals'}
            </button>
          </form>
        )}

        <button
          onClick={dismiss}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-2 transition-colors"
        >
          No thanks
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
