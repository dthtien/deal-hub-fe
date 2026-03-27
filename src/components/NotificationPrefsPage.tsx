import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Prefs {
  price_drops: boolean;
  new_arrivals: boolean;
  weekly_digest: boolean;
  push_enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

const DEFAULT_PREFS: Prefs = {
  price_drops: true,
  new_arrivals: true,
  weekly_digest: false,
  push_enabled: false,
  frequency: 'daily',
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

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const storedEmail = localStorage.getItem('ozvfy_email') || '';
    setEmail(storedEmail);

    // Try to get subscriber token from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || localStorage.getItem('ozvfy_sub_token');
    if (t) setToken(t);
  }, []);

  const update = (key: keyof Prefs, value: boolean | string) => {
    setPrefs(p => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!token) {
      showToast('No subscription token found. Please subscribe first.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscribers/${token}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            price_drops:    prefs.price_drops,
            new_arrivals:   prefs.new_arrivals,
            weekly_digest:  prefs.weekly_digest,
            frequency:      prefs.frequency,
          }
        }),
      });
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

        {!token && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-400">
            No subscription found. <a href="/subscribe" className="font-semibold underline">Subscribe first</a> to manage preferences.
          </div>
        )}

        {/* Email Notifications */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Notifications</h2>
          </div>
          <div className="space-y-4">
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
          <div className="flex items-center gap-2 mb-4">
            <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Push Notifications</h2>
          </div>
          <Toggle
            checked={prefs.push_enabled}
            onChange={v => update('push_enabled', v)}
            label="Enable Push Notifications"
            description="Receive browser push notifications for deals"
          />
        </section>

        {/* Frequency */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Frequency</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['immediate', 'daily', 'weekly'] as const).map(f => (
              <button
                key={f}
                onClick={() => update('frequency', f)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors capitalize ${
                  prefs.frequency === f
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400'
                }`}
              >
                {f === 'immediate' ? 'Instant' : f === 'daily' ? 'Daily' : 'Weekly'}
              </button>
            ))}
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

        <button
          onClick={handleSave}
          disabled={saving || !token}
          className={`w-full py-3 rounded-2xl text-sm font-bold transition-colors ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50'
          }`}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Preferences'}
        </button>
      </div>
    </>
  );
}
