import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BellIcon, HeartIcon, TagIcon, CalendarIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const PREFS_KEY = 'ozvfy_notification_prefs';

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
  } catch {}
  return DEFAULT_PREFS;
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [prefs]);

  const toggle = (key: keyof Prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Helmet>
        <title>Notification Preferences | OzVFY</title>
        <meta name="description" content="Manage your deal alert preferences on OzVFY — get notified about price drops, new deals, and weekly digests." />
        <link rel="canonical" href="https://www.ozvfy.com/notifications" />
      </Helmet>
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white mb-2">
        <BellIcon className="w-8 h-8 text-orange-500 dark:text-orange-400" />
        Notification Preferences
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Choose what alerts you receive from OzVFY. Your preferences are saved locally.</p>

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
        <p className="text-center text-xs text-green-600 dark:text-green-400 mt-4 animate-pulse">✓ Preferences saved</p>
      )}
    </div>
  );
}
