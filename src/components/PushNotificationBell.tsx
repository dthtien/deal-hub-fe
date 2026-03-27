import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { usePushNotifications } from '../hooks/usePushNotifications';

function hasActiveNotificationPrefs(): boolean {
  try {
    const prefs = JSON.parse(localStorage.getItem('ozvfy_notification_prefs') || '{}');
    return Object.values(prefs).some(Boolean);
  } catch { return false; }
}

export default function PushNotificationBell() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const hasPrefs = hasActiveNotificationPrefs();

  if (!isSupported) return null;

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className="relative p-2 rounded-xl text-white hover:bg-white/20 transition-colors"
      title={isSubscribed ? 'Alerts on — click to disable' : 'Get deal alerts'}
    >
      {isLoading ? (
        <svg className="w-5 h-5 animate-spin text-orange-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : isSubscribed ? (
        <BellSolid className="w-5 h-5 text-orange-500" />
      ) : (
        <BellIcon className="w-5 h-5" />
      )}
      {hasPrefs && !isLoading && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
      )}
    </button>
  );
}
