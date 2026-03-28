import { useEffect, useState, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const NOTIF_COUNT_KEY = 'ozvfy_unread_count';
const PUSH_PREFS_KEY = 'ozvfy_push_prefs';

type PushPref = 'price_drops' | 'new_deals' | 'flash_sales' | 'all';

interface PushPrefs {
  type: PushPref;
}

function getUnreadCount(): number {
  try {
    return parseInt(localStorage.getItem(NOTIF_COUNT_KEY) || '0', 10) || 0;
  } catch { return 0; }
}

function setUnreadCount(count: number) {
  try { localStorage.setItem(NOTIF_COUNT_KEY, String(count)); } catch { /* noop */ }
}

function getPushPrefs(): PushPrefs | null {
  try {
    const raw = localStorage.getItem(PUSH_PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function savePushPrefs(prefs: PushPrefs) {
  try { localStorage.setItem(PUSH_PREFS_KEY, JSON.stringify(prefs)); } catch { /* noop */ }
}

const PREF_OPTIONS: { value: PushPref; label: string; emoji: string }[] = [
  { value: 'price_drops', label: 'Price drops', emoji: '📉' },
  { value: 'new_deals', label: 'New deals', emoji: '🆕' },
  { value: 'flash_sales', label: 'Flash sales', emoji: '⚡' },
  { value: 'all', label: 'All notifications', emoji: '🔔' },
];

export default function PushNotificationBell() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(getUnreadCount);
  const [showTooltip, setShowTooltip] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [selectedPref, setSelectedPref] = useState<PushPref>(() => getPushPrefs()?.type || 'all');
  const prevUnread = useRef(unread);
  const prefsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === NOTIF_COUNT_KEY) {
        const newCount = parseInt(e.newValue || '0', 10) || 0;
        if (newCount > prevUnread.current) {
          setShaking(true);
          setTimeout(() => setShaking(false), 2000);
        }
        prevUnread.current = newCount;
        setUnread(newCount);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Close prefs panel on outside click
  useEffect(() => {
    if (!showPrefs) return;
    const handler = (e: MouseEvent) => {
      if (prefsRef.current && !prefsRef.current.contains(e.target as Node)) {
        setShowPrefs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPrefs]);

  const isSubscribed = !!localStorage.getItem('ozvfy_notification_prefs');

  const handleClick = () => {
    if (isSubscribed) {
      // Toggle prefs panel or navigate
      setShowPrefs(prev => !prev);
    } else {
      setUnreadCount(0);
      setUnread(0);
      navigate('/notifications');
    }
  };

  const handleNavClick = () => {
    setShowPrefs(false);
    setUnreadCount(0);
    setUnread(0);
    navigate('/notifications');
  };

  const handlePrefSelect = (pref: PushPref) => {
    setSelectedPref(pref);
    savePushPrefs({ type: pref });
    setShowPrefs(false);
  };

  const badgeLabel = unread > 99 ? '99+' : String(unread);

  return (
    <div className="relative" ref={prefsRef}>
      <button
        onClick={handleClick}
        onMouseEnter={() => !showPrefs && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => !showPrefs && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`relative p-2 rounded-xl text-white hover:bg-white/20 transition-colors ${shaking ? 'animate-[shake_0.5s_ease-in-out_4]' : ''}`}
        aria-label="Notifications"
      >
        {isSubscribed ? (
          <BellSolid className="w-5 h-5 text-orange-500" />
        ) : (
          <BellIcon className="w-5 h-5" />
        )}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !showPrefs && (
        <div className="absolute top-full right-0 mt-1 z-50 whitespace-nowrap bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none">
          {isSubscribed ? 'Notification preferences' : 'Get notified of price drops'}
          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
        </div>
      )}

      {/* Preferences panel */}
      {showPrefs && isSubscribed && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Notify me about</p>
          </div>
          <div className="py-1">
            {PREF_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handlePrefSelect(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  selectedPref === opt.value
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-base">{opt.emoji}</span>
                <span>{opt.label}</span>
                {selectedPref === opt.value && (
                  <span className="ml-auto text-orange-500 text-xs font-bold">Active</span>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2">
            <button
              onClick={handleNavClick}
              className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-12deg); }
          40% { transform: rotate(12deg); }
          60% { transform: rotate(-8deg); }
          80% { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  );
}
