import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationBell() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

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
    </button>
  );
}
