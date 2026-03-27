import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resubStatus, setResubStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link. Please check your email.');
      return;
    }

    fetch(`${API_BASE}/api/v1/subscribers/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success');
          setMessage(data.message || 'Unsubscribed successfully.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Something went wrong.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [token]);

  const handleResubscribe = async () => {
    if (!token) return;
    setResubStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscribers/${encodeURIComponent(token)}/resubscribe`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setResubStatus('done');
        setMessage(data.message || 'You have been re-subscribed!');
      } else {
        setResubStatus('error');
      }
    } catch {
      setResubStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      {status === 'loading' && (
        <>
          <ArrowPathIcon className="w-12 h-12 mx-auto text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Processing your request...</p>
        </>
      )}
      {status === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8">
          <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {resubStatus === 'done' ? 'Re-subscribed!' : 'Unsubscribed'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>

          {resubStatus === 'idle' && (
            <>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">What would you like to do?</p>
              <div className="flex flex-col gap-3">
                <Link
                  to={`/subscribe/preferences?token=${token}`}
                  className="text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 px-4 py-2.5 rounded-xl transition-colors"
                >
                  📉 Just reduce emails
                </Link>
                <button
                  onClick={handleResubscribe}
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  🔔 Re-subscribe
                </button>
                <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-4 py-2.5 rounded-xl transition-colors">
                  Browse deals →
                </Link>
              </div>
            </>
          )}

          {resubStatus === 'loading' && (
            <ArrowPathIcon className="w-6 h-6 mx-auto text-orange-500 animate-spin" />
          )}

          {resubStatus === 'done' && (
            <Link to="/" className="text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors inline-block">
              Browse deals
            </Link>
          )}

          {resubStatus === 'error' && (
            <p className="text-sm text-rose-500 mt-2">Something went wrong. Please try again.</p>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-8">
          <XCircleIcon className="w-12 h-12 mx-auto text-rose-500 mb-3" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops</h1>
          <p className="text-rose-600 dark:text-rose-400 text-sm mb-6">{message}</p>
          <Link to="/" className="text-sm text-orange-500 hover:underline">← Back to home</Link>
        </div>
      )}
    </div>
  );
};

export default UnsubscribePage;
