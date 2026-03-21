import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LightBulbIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STORES = ['ASOS', 'The Iconic', 'Kmart', 'Big W', 'JB Hi-Fi', 'Myer', 'Nike', 'Culture Kings', 'JD Sports', 'The Good Guys', 'Office Works', 'Glue Store', 'Other'];

const SubmitDealPage = () => {
  const [form, setForm] = useState({
    title: '', url: '', price: '', old_price: '', store: '', description: '', submitted_by_email: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/deal_submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_submission: form }),
      });
      const data = await res.json();
      if (res.ok || res.status === 201) {
        setStatus('success');
        setMessage(data.message || 'Deal submitted!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <>
      <Helmet>
        <title>Submit a Deal | OzVFY</title>
        <meta name="description" content="Found a great deal? Share it with the OzVFY community." />
      </Helmet>

      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <LightBulbIcon className="w-14 h-14 mx-auto text-orange-500 mb-4" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Submit a Deal</h1>
          <p className="text-gray-500">Found a bargain? Share it with thousands of Australian deal hunters.</p>
        </div>

        {status === 'success' ? (
          <div className="text-center bg-green-50 border border-green-200 rounded-2xl p-8">
            <CheckCircleIcon className="w-14 h-14 mx-auto text-green-500 mb-3" />
            <p className="text-lg font-bold text-green-700 mb-2">{message}</p>
            <p className="text-sm text-gray-500 mb-6">Our team will review it and publish it if it's a genuine deal.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setStatus('idle'); setForm({ title: '', url: '', price: '', old_price: '', store: '', description: '', submitted_by_email: '' }); }}
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
                Submit another
              </button>
              <Link to="/" className="text-sm border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 px-4 py-2 rounded-xl transition-colors">
                Browse deals
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <label className={labelClass}>Deal title *</label>
                <input required value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Nike Air Max 90 — 40% off" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Deal URL *</label>
                <input required type="url" value={form.url} onChange={e => set('url', e.target.value)}
                  placeholder="https://www.store.com.au/product/..." className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Sale price ($) *</label>
                  <input required type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)}
                    placeholder="49.99" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Original price ($)</label>
                  <input type="number" step="0.01" min="0" value={form.old_price} onChange={e => set('old_price', e.target.value)}
                    placeholder="99.99" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Store</label>
                <select value={form.store} onChange={e => set('store', e.target.value)} className={inputClass}>
                  <option value="">Select a store...</option>
                  {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={3} placeholder="Why is this a great deal? Any promo code or conditions?"
                  className={`${inputClass} resize-none`} />
              </div>

              <div>
                <label className={labelClass}>Your email <span className="text-gray-400 font-normal">(optional — we'll credit you)</span></label>
                <input type="email" value={form.submitted_by_email} onChange={e => set('submitted_by_email', e.target.value)}
                  placeholder="you@example.com" className={inputClass} />
              </div>
            </div>

            {status === 'error' && (
              <p className="text-sm text-rose-500 bg-rose-50 px-4 py-3 rounded-xl">{message}</p>
            )}

            <button type="submit" disabled={status === 'loading'}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-base">
              {status === 'loading' ? 'Submitting...' : <span className="flex items-center justify-center gap-2"><LightBulbIcon className="w-4 h-4" />Submit Deal</span>}
            </button>

            <p className="text-center text-xs text-gray-400">
              We review all submissions. Spam, fake deals, or self-promotion will be rejected.
            </p>
          </form>
        )}
      </div>
    </>
  );
};

export default SubmitDealPage;
