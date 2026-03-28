import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BellIcon, HeartIcon, TagIcon, CalendarIcon, EnvelopeIcon, PauseCircleIcon, PlayCircleIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || '';
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

interface PriceAlertEntry {
  id: number;
  email: string;
  product_id: number;
  product_name?: string;
  current_price?: number;
  target_price?: number;
  status: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [unread, setUnread] = useState(() => {
    try { return parseInt(localStorage.getItem(NOTIF_COUNT_KEY) || '0', 10) || 0; } catch { return 0; }
  });
  const { showToast } = useToast();
  const [alertEmail, setAlertEmail] = useState('');
  const [priceAlerts, setPriceAlerts] = useState<PriceAlertEntry[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchAlerts = (email: string) => {
    if (!email.trim()) return;
    setAlertsLoading(true);
    fetch(`${API_BASE}/api/v1/price_alerts?email=${encodeURIComponent(email)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setPriceAlerts(d.price_alerts || []))
      .catch(() => showToast('Failed to load alerts', 'error'))
      .finally(() => setAlertsLoading(false));
  };

  const handlePauseAll = () => {
    if (!alertEmail.trim()) return;
    setBulkActionLoading(true);
    fetch(`${API_BASE}/api/v1/price_alerts/bulk_status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: alertEmail, status: 'paused' }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => {
        showToast('All alerts paused', 'success');
        fetchAlerts(alertEmail);
      })
      .catch(() => showToast('Failed to pause alerts', 'error'))
      .finally(() => setBulkActionLoading(false));
  };

  const handleResumeAll = () => {
    if (!alertEmail.trim()) return;
    setBulkActionLoading(true);
    fetch(`${API_BASE}/api/v1/price_alerts/bulk_status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: alertEmail, status: 'active' }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => {
        showToast('All alerts resumed', 'success');
        fetchAlerts(alertEmail);
      })
      .catch(() => showToast('Failed to resume alerts', 'error'))
      .finally(() => setBulkActionLoading(false));
  };

  const handleDeleteAll = () => {
    if (!alertEmail.trim()) return;
    setBulkActionLoading(true);
    fetch(`${API_BASE}/api/v1/price_alerts/bulk_destroy`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: alertEmail }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => {
        showToast('All alerts deleted', 'success');
        setPriceAlerts([]);
        setConfirmDeleteAll(false);
      })
      .catch(() => showToast('Failed to delete alerts', 'error'))
      .finally(() => setBulkActionLoading(false));
  };

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

      {/* Bulk Price Alert Management */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Price Alert Management</h2>
          <Link
            to="/alerts/history"
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
          >
            <ClockIcon className="w-3.5 h-3.5" />
            View history
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Enter your email to manage your price alerts in bulk.</p>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={alertEmail}
              onChange={e => setAlertEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={() => fetchAlerts(alertEmail)}
              disabled={!alertEmail.trim() || alertsLoading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {alertsLoading ? 'Loading...' : 'Load'}
            </button>
          </div>

          {priceAlerts.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={handlePauseAll}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm font-semibold rounded-xl border border-amber-200 dark:border-amber-800 transition-colors disabled:opacity-50"
                >
                  <PauseCircleIcon className="w-4 h-4" />
                  Pause all alerts
                </button>
                <button
                  onClick={handleResumeAll}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-semibold rounded-xl border border-green-200 dark:border-green-800 transition-colors disabled:opacity-50"
                >
                  <PlayCircleIcon className="w-4 h-4" />
                  Resume all
                </button>
                {!confirmDeleteAll ? (
                  <button
                    onClick={() => setConfirmDeleteAll(true)}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete all alerts
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Are you sure?</span>
                    <button
                      onClick={handleDeleteAll}
                      disabled={bulkActionLoading}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      Yes, delete all
                    </button>
                    <button
                      onClick={() => setConfirmDeleteAll(false)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {priceAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{alert.product_name || `Product #${alert.product_id}`}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Target: ${alert.target_price} {alert.current_price ? `| Current: $${alert.current_price}` : ''}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      alert.status === 'paused'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>
                      {alert.status === 'paused' ? 'Paused' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {priceAlerts.length === 0 && alertEmail && !alertsLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No price alerts found for this email.</p>
          )}
        </div>
      </div>
    </div>
  );
}
