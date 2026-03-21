import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

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

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      {status === 'loading' && (
        <>
          <ArrowPathIcon className="w-12 h-12 mx-auto text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Processing your request...</p>
        </>
      )}
      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unsubscribed</h1>
          <p className="text-gray-500 text-sm mb-6">{message}</p>
          <p className="text-xs text-gray-400 mb-6">Changed your mind? You can always re-subscribe.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/subscribe" className="text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
              Re-subscribe
            </Link>
            <Link to="/" className="text-sm border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 px-4 py-2 rounded-xl transition-colors">
              Browse deals
            </Link>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8">
          <XCircleIcon className="w-12 h-12 mx-auto text-rose-500 mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Oops</h1>
          <p className="text-rose-600 text-sm mb-6">{message}</p>
          <Link to="/" className="text-sm text-orange-500 hover:underline">← Back to home</Link>
        </div>
      )}
    </div>
  );
};

export default UnsubscribePage;
