import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon, ClockIcon, TagIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import SmartNotificationScheduler from './SmartNotificationScheduler';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Prefs {
  price_drops: boolean;
  new_arrivals: boolean;
  weekly_digest: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  categories: string[];
  max_price: string;
  expiry_alerts: boolean;
  expiry_hours_before: number;
}

const DEFAULT_PREFS: Prefs = {
  price_drops: true,
  new_arrivals: true,
  weekly_digest: false,
  push_enabled: false,
  email_enabled: true,
  frequency: 'daily',
  categories: [],
  max_price: '',
  expiry_alerts: false,
  expiry_hours_before: 24,
};

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
          checked ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

function PermissionBadge({ permission }: { permission: NotificationPermission }) {
  const config = {
    granted: { label: 'Allowed', cls: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
    denied:  { label: 'Blocked', cls: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
    default: { label: 'Not set', cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
  };
  const c = config[permission] || config.default;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.cls}`}>
      <ShieldCheckIcon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

const EMAIL_FREQUENCIES = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'daily',     label: 'Daily digest' },
  { value: 'weekly',    label: 'Weekly only' },
  { value: 'never',     label: 'Never' },
] as const;

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [apiLoaded, setApiLoaded] = useState(false);
  const { showToast } = useToast();

  const sessionId = typeof window !== 'undefined'
    ? (localStorage.getItem('ozvfy_session_id') || '')
    : '';

  useEffect(() => {
    const storedEmail = localStorage.getItem('ozvfy_email') || '';
    setEmail(storedEmail);
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || localStorage.getItem('ozvfy_sub_token');
    if (t) setToken(t);

    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }

    // Load saved prefs from API
    if (sessionId) {
      fetch(`${API_BASE}/api/v1/notification_preferences?session_id=${encodeURIComponent(sessionId)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => {
          const p = d.preferences || {};
          if (Object.keys(p).length > 0) {
            setPrefs(prev => ({
              ...prev,
              email_enabled:        p.email_enabled        ?? prev.email_enabled,
              push_enabled:         p.push_enabled         ?? prev.push_enabled,
              frequency:            p.frequency            ?? prev.frequency,
              categories:           Array.isArray(p.categories) ? p.categories : prev.categories,
              max_price:            p.max_price            ?? prev.max_price,
              expiry_alerts:        p.expiry_alerts        ?? prev.expiry_alerts,
              expiry_hours_before:  p.expiry_hours_before  ?? prev.expiry_hours_before,
            }));
          }
          setApiLoaded(true);
        })
        .catch(() => setApiLoaded(true));
    } else {
      setApiLoaded(true);
    }
  }, [sessionId]);

  const update = (key: keyof Prefs, value: boolean | string | string[] | number) => {
    setPrefs(p => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        session_id:          sessionId,
        email_enabled:       prefs.email_enabled,
        push_enabled:        prefs.push_enabled,
        frequency:           prefs.frequency,
        categories:          prefs.categories,
        max_price:           prefs.max_price,
        expiry_alerts:       prefs.expiry_alerts,
        expiry_hours_before: prefs.expiry_hours_before,
      };

      const res = await fetch(`${API_BASE}/api/v1/notification_preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Also update subscriber prefs if token exists
      if (token) {
        await fetch(`${API_BASE}/api/v1/subscribers/${token}/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: {
              price_drops:   prefs.price_drops,
              new_arrivals:  prefs.new_arrivals,
              weekly_digest: prefs.weekly_digest,
              frequency:     prefs.frequency,
            }
          }),
        }).catch(() => {});
      }

      if (res.ok) {
        setSaved(true);
        showToast('Preferences saved!', 'success');
      } else {
        showToast('Failed to save preferences.', 'error');
      }
    } catch {
      showToast('Network error. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (pushPermission !== 'granted') {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm !== 'granted') {
        showToast('Please allow notifications to send a test.', 'error');
        return;
      }
    }
    setTestSending(true);
    try {
      // eslint-disable-next-line no-new
      new Notification('OzVFY Test Notification', {
        body: 'Your deal notifications are working! Great savings await.',
        icon: '/logo.png',
      });
      showToast('Test notification sent!', 'success');
    } catch {
      showToast('Could not send test notification.', 'error');
    } finally {
      setTestSending(false);
    }
  };

  if (!apiLoaded) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Notification Preferences - OzVFY</title>
        <meta name="description" content="Manage your OzVFY notification preferences" />
      </Helmet>

      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <BellIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Notification Preferences</h1>
            {email && <p className="text-sm text-gray-400">{email}</p>}
          </div>
        </div>

        {/* Email Notifications */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Notifications</h2>
          </div>
          <div className="space-y-4">
            <Toggle
              checked={prefs.email_enabled}
              onChange={v => update('email_enabled', v)}
              label="Enable Email Notifications"
              description="Receive deal alerts and digests by email"
            />
            <Toggle
              checked={prefs.price_drops}
              onChange={v => update('price_drops', v)}
              label="Price Drops"
              description="Get notified when prices drop on your saved deals"
            />
            <Toggle
              checked={prefs.new_arrivals}
              onChange={v => update('new_arrivals', v)}
              label="New Deals"
              description="Be the first to know about fresh deals"
            />
            <Toggle
              checked={prefs.weekly_digest}
              onChange={v => update('weekly_digest', v)}
              label="Weekly Digest"
              description="A weekly roundup of the best deals"
            />
          </div>
        </section>

        {/* Push Notifications */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Push Notifications</h2>
            </div>
            {'Notification' in window && <PermissionBadge permission={pushPermission} />}
          </div>
          <div className="space-y-3">
            <Toggle
              checked={prefs.push_enabled}
              onChange={v => update('push_enabled', v)}
              label="Enable Push Notifications"
              description="Receive browser push notifications for deals"
            />
            {pushPermission === 'denied' && (
              <p className="text-xs text-red-500 dark:text-red-400">
                Push notifications are blocked by your browser. Go to browser settings to allow them.
              </p>
            )}
            <button
              onClick={handleTestNotification}
              disabled={testSending}
              className="w-full mt-1 py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {testSending ? 'Sending...' : 'Send Test Notification'}
            </button>
          </div>
        </section>

        {/* Email Frequency */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Frequency</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EMAIL_FREQUENCIES.map(f => (
              <button
                key={f.value}
                onClick={() => update('frequency', f.value)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                  prefs.frequency === f.value
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Expiry Alerts */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expiry Alerts</h2>
          </div>
          <div className="space-y-4">
            <Toggle
              checked={prefs.expiry_alerts}
              onChange={v => update('expiry_alerts', v)}
              label="Deal expiry alerts"
              description="Get notified when your saved deals are about to expire"
            />
            {prefs.expiry_alerts && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Notify me <span className="text-orange-500">{prefs.expiry_hours_before}h</span> before expiry
                </p>
                <div className="flex flex-wrap gap-2">
                  {[1, 6, 24, 48].map(h => (
                    <button
                      key={h}
                      onClick={() => update('expiry_hours_before', h)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                        prefs.expiry_hours_before === h
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500'
                      }`}
                    >
                      {h === 1 ? '1 hour' : h === 48 ? '2 days' : `${h} hours`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Category Alerts */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category Alerts</h2>
            </div>
            <Link
              to="/alerts/categories"
              className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            >
              Manage
            </Link>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get notified when new deals drop in your favourite categories like Women's Fashion, Electronics, and more.
          </p>
          <Link
            to="/alerts/categories"
            className="mt-3 inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <BellIcon className="w-4 h-4" />
            Set up category alerts
          </Link>
        </section>

        {/* Smart notification timing */}
        <SmartNotificationScheduler />

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 rounded-2xl text-sm font-bold transition-colors ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50'
          }`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </>
  );
}
