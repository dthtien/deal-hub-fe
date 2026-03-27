import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const NOTIF_COUNT_KEY = 'ozvfy_notif_count';

function getUnreadCount(): number {
  try {
    return parseInt(localStorage.getItem(NOTIF_COUNT_KEY) || '0', 10) || 0;
  } catch { return 0; }
}

export default function PushNotificationBell() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(getUnreadCount);

  // Re-read on storage changes (e.g., from NotificationsPage marking as read)
  useEffect(() => {
    const handler = () => setUnread(getUnreadCount());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleClick = () => {
    navigate('/notifications');
  };

  const isSubscribed = !!localStorage.getItem('ozvfy_notification_prefs');

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-xl text-white hover:bg-white/20 transition-colors"
      aria-label="Notifications"
      title="Open notifications"
    >
      {isSubscribed ? (
        <BellSolid className="w-5 h-5 text-orange-500" />
      ) : (
        <BellIcon className="w-5 h-5" />
      )}
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}
