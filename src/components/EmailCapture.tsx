import { FireIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const EmailCapture = () => {
  const [email, setEmail] = useState('');
  const [newArrivals, setNewArrivals] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/v1/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriber: { email, preferences: { new_arrivals: newArrivals } } })
      });
      if (!res.ok) throw new Error('Failed');

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center my-4 flex items-center justify-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-green-500" />
        <p className="text-green-700 dark:text-green-400 font-medium">You're in! We'll send the best deals to your inbox.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-5 my-6 text-white">
      <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><FireIcon className="w-5 h-5" />Get Daily Deals in Your Inbox</h3>
      <p className="text-sm text-orange-100 mb-3">Be the first to know about the best sales across Australia's top stores.</p>
      <label className="flex items-center gap-2 text-sm text-orange-100 mb-3 cursor-pointer">
        <input type="checkbox" checked={newArrivals} onChange={e => setNewArrivals(e.target.checked)} className="rounded" />
        Also notify me of new deals from my saved stores
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && <p className="text-xs text-red-200 mt-2">Something went wrong. Try again.</p>}
    </div>
  );
};

export default EmailCapture;
