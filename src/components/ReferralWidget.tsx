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
  signup_count?: number;
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

  const handleWhatsApp = () => {
    if (!data) return;
    const msg = encodeURIComponent(`Check out OzVFY for amazing Aussie deals! ${data.url}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleTelegram = () => {
    if (!data) return;
    const msg = encodeURIComponent(`Check out OzVFY for amazing Aussie deals! ${data.url}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${msg}`, '_blank');
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

  const clicks = data.click_count || 0;
  const signups = data.signup_count || 0;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <GiftIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Invite Friends</h3>
      </div>

      {/* Stats */}
      {(clicks > 0 || signups > 0) && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="font-semibold text-orange-500 dark:text-orange-400">{clicks} click{clicks !== 1 ? 's' : ''}</span>
          {signups > 0 && (
            <>
              <span className="mx-1 text-gray-300 dark:text-gray-600">·</span>
              <span className="font-semibold text-green-500 dark:text-green-400">{signups} signup{signups !== 1 ? 's' : ''}</span>
            </>
          )}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Share your referral link and help others find great deals!
      </p>

      {/* Link + copy */}
      <div className="flex gap-2 mb-3">
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

      {/* Social share buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>
        <button
          onClick={handleTelegram}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          Telegram
        </button>
      </div>

      {/* CTA */}
      <div className="mt-3">
        <button
          onClick={handleCopy}
          className="w-full text-sm font-bold py-2.5 rounded-xl text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <GiftIcon className="w-4 h-4" />
            Invite Friends - Spread the Savings!
          </span>
        </button>
      </div>
    </div>
  );
}
