import { useEffect, useState, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const NOTIF_COUNT_KEY = 'ozvfy_unread_count';

function getUnreadCount(): number {
  try {
    return parseInt(localStorage.getItem(NOTIF_COUNT_KEY) || '0', 10) || 0;
  } catch { return 0; }
}

function setUnreadCount(count: number) {
  try { localStorage.setItem(NOTIF_COUNT_KEY, String(count)); } catch { /* noop */ }
}

export default function PushNotificationBell() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(getUnreadCount);
  const [showTooltip, setShowTooltip] = useState(false);
  const [shaking, setShaking] = useState(false);
  const prevUnread = useRef(unread);

  // Re-read on storage changes (e.g., from NotificationsPage marking as read)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === NOTIF_COUNT_KEY) {
        const newCount = parseInt(e.newValue || '0', 10) || 0;
        if (newCount > prevUnread.current) {
          // New notification arrived - shake
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

  const handleClick = () => {
    // Clear badge on click
    setUnreadCount(0);
    setUnread(0);
    navigate('/notifications');
  };

  const isSubscribed = !!localStorage.getItem('ozvfy_notification_prefs');

  const badgeLabel = unread > 99 ? '99+' : String(unread);

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
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
      {showTooltip && (
        <div className="absolute top-full right-0 mt-1 z-50 whitespace-nowrap bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none">
          Get notified of price drops
          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
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
