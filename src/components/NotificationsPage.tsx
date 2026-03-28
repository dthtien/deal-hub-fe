import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BellIcon, HeartIcon, TagIcon, CalendarIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const PREFS_KEY = 'ozvfy_notification_prefs';
const NOTIF_KEY = 'ozvfy_notifications';
const NOTIF_COUNT_KEY = 'ozvfy_notif_count';

interface Prefs {
  savedStoreDeals: boolean;
  priceDrops: boolean;
  dealOfTheDay: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_PREFS: Prefs = {
  savedStoreDeals: true,
  priceDrops: true,
  dealOfTheDay: false,
  weeklyDigest: false,
};

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string; // ISO string
}

const TOGGLES: { key: keyof Prefs; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'savedStoreDeals',
    label: 'New deals from saved stores',
    description: 'Get notified when your favourite stores post new deals.',
    icon: <HeartIcon className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
  },
  {
    key: 'priceDrops',
    label: 'Price drops >20%',
    description: 'Alert me when any deal drops by more than 20%.',
    icon: <TagIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />,
  },
  {
    key: 'dealOfTheDay',
    label: 'Deal of the Day',
    description: "Don't miss our hand-picked daily highlight.",
    icon: <CalendarIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'A weekly email with the best deals of the week.',
    icon: <EnvelopeIcon className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
  },
];

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { /* empty */ }
  return DEFAULT_PREFS;
}

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return [];
}

function saveNotifications(notifs: Notification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  const unreadCount = notifs.filter(n => !n.read).length;
  localStorage.setItem(NOTIF_COUNT_KEY, String(unreadCount));
  window.dispatchEvent(new StorageEvent('storage', { key: NOTIF_COUNT_KEY, newValue: String(unreadCount) }));
}

function getDateGroup(isoStr: string): 'today' | 'yesterday' | 'this_week' | 'older' {
  const now = new Date();
  const d = new Date(isoStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 1 && now.getDate() === d.getDate()) return 'today';
  if (diffDays < 2 && now.getDate() - d.getDate() === 1) return 'yesterday';
  if (diffDays < 7) return 'this_week';
  return 'older';
}

const GROUP_LABELS: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week',
  older: 'Older',
};

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [unread, setUnread] = useState(() => {
    try { return parseInt(localStorage.getItem(NOTIF_COUNT_KEY) || '0', 10) || 0; } catch { return 0; }
  });

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [prefs]);

  const toggle = (key: keyof Prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const markRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveNotifications(updated);
    setUnread(updated.filter(n => !n.read).length);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
    setUnread(0);
  };

  const clearAllRead = () => {
    const updated = notifications.filter(n => !n.read);
    setNotifications(updated);
    saveNotifications(updated);
  };

  // Group notifications by date
  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  const GROUP_ORDER = ['today', 'yesterday', 'this_week', 'older'] as const;
  const hasReadNotifs = notifications.some(n => n.read);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Helmet>
        <title>Notification Preferences | OzVFY</title>
        <meta name="description" content="Manage your deal alert preferences on OzVFY -- get notified about price drops, new deals, and weekly digests." />
        <link rel="canonical" href="https://www.ozvfy.com/notifications" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
          <BellIcon className="w-8 h-8 text-orange-500 dark:text-orange-400" />
          Notifications
          {unread > 0 && (
            <span className="ml-1 inline-flex items-center justify-center bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5 leading-none">
              {unread}
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Mark all read
            </button>
          )}
          {hasReadNotifs && (
            <button
              onClick={clearAllRead}
              className="text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Clear read
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Choose what alerts you receive from OzVFY. Your preferences are saved locally.</p>

      {/* Notification centre - grouped by date */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Notification Centre</h2>
          {GROUP_ORDER.filter(g => grouped[g]?.length > 0).map(group => (
            <div key={group} className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 pl-1">
                {GROUP_LABELS[group]}
              </h3>
              <div className="space-y-2">
                {grouped[group].map(notif => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                      notif.read
                        ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60'
                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-orange-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.body}</p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="flex-shrink-0 text-xs text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preferences */}
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Alert Preferences</h2>
      <div className="space-y-4">
        {TOGGLES.map(({ key, label, description, icon }) => (
          <div
            key={key}
            className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5"
          >
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl flex-shrink-0">{icon}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                prefs[key] ? 'bg-orange-500 dark:bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              role="switch"
              aria-checked={prefs[key]}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-white shadow ring-0 transition duration-200 ${
                  prefs[key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {saved && (
        <p className="text-center text-xs text-green-600 dark:text-green-400 mt-4 animate-pulse">Preferences saved</p>
      )}
    </div>
  );
}
