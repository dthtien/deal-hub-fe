import { useState } from 'react';
import { Deal } from '../types';
import { BellIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PriceAlertModal = ({ deal, onClose }: { deal: Deal; onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(String(Math.floor(deal.price * 0.9)));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/price_alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_alert: { email, target_price: targetPrice } })
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><BellIcon className="w-5 h-5" />Price Alert</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        <p className="text-sm text-gray-500 mb-1 truncate">{deal.name}</p>
        <p className="text-sm text-gray-400 mb-4">Current price: <span className="font-bold text-green-600">${deal.price}</span></p>

        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-2" />
            <p className="font-semibold">Alert set!</p>
            <p className="text-sm text-gray-500 mt-1">We'll email you when it drops to ${targetPrice}</p>
            <button onClick={onClose} className="mt-4 text-sm text-orange-500 hover:text-orange-600">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Alert me when price drops to</label>
              <div className="flex items-center border rounded-lg px-3 mt-1">
                <span className="text-gray-400 mr-1">$</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  className="flex-1 py-2 text-sm outline-none bg-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Your email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
            </div>
            {status === 'error' && <p className="text-xs text-red-500">Something went wrong. Try again.</p>}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Setting alert...' : <span className="flex items-center justify-center gap-2"><BellIcon className="w-4 h-4" />Notify Me</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PriceAlertModal;
