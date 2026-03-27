import { useState, useEffect } from 'react';
import { ClipboardDocumentIcon, CheckIcon, GiftIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getSessionId(): string {
  let id = localStorage.getItem('ozvfy_session_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('ozvfy_session_id', id);
  }
  return id;
}

interface ReferralData {
  code: string;
  url: string;
  click_count: number;
}

export default function ReferralWidget() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = getSessionId();
    fetch(`${API_BASE}/api/v1/referrals/link?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 animate-pulse">
        <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <GiftIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Refer a Friend</h3>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Share your referral link and help others find great deals!
        {data.click_count > 0 && (
          <span className="ml-2 font-semibold text-orange-500 dark:text-orange-400">
            {data.click_count} click{data.click_count !== 1 ? 's' : ''}
          </span>
        )}
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={data.url}
          className="flex-1 min-w-0 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 cursor-text"
          onFocus={e => e.target.select()}
        />
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex-shrink-0 ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {copied
            ? <><CheckIcon className="w-4 h-4" /> Copied!</>
            : <><ClipboardDocumentIcon className="w-4 h-4" /> Copy</>
          }
        </button>
      </div>
    </div>
  );
}
