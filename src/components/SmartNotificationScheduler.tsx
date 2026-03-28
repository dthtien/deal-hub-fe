import { useState, useEffect } from 'react';
import { BellIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline';

const NOTIFY_HOURS_KEY = 'ozvfy_notify_hours';

interface NotifyHours {
  from: number;
  to: number;
  enabled: boolean;
}

const DEFAULT_HOURS: NotifyHours = { from: 9, to: 11, enabled: false };

// Best posting windows based on deal patterns (AEST)
const BEST_WINDOWS = [
  { label: 'Morning rush', from: 9, to: 11, desc: 'Most deals posted 9–11am AEST' },
  { label: 'Lunch deals', from: 12, to: 14, desc: 'Midday flash deals' },
  { label: 'Evening bargains', from: 18, to: 21, desc: 'End-of-day clearance' },
];

function loadHours(): NotifyHours {
  try {
    const raw = localStorage.getItem(NOTIFY_HOURS_KEY);
    if (!raw) return DEFAULT_HOURS;
    return { ...DEFAULT_HOURS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_HOURS;
  }
}

function saveHours(h: NotifyHours): void {
  try {
    localStorage.setItem(NOTIFY_HOURS_KEY, JSON.stringify(h));
  } catch { /* noop */ }
}

function formatHour(h: number): string {
  if (h === 0) return '12am';
  if (h < 12) return `${h}am`;
  if (h === 12) return '12pm';
  return `${h - 12}pm`;
}

export default function SmartNotificationScheduler() {
  const [hours, setHours] = useState<NotifyHours>(DEFAULT_HOURS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHours(loadHours());
  }, []);

  const update = (patch: Partial<NotifyHours>) => {
    setHours(prev => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleSave = () => {
    saveHours(hours);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500">
          <BellIcon className="w-5 h-5" />
        </span>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Smart Notification Timing</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Get notified when deals are most active</p>
        </div>
      </div>

      {/* Suggestion banner */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-3 mb-4 flex items-start gap-2">
        <ClockIcon className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-orange-700 dark:text-orange-300">
          <strong>Deals are most active at 9am–11am AEST</strong> — enable notifications for that window to catch the best bargains first.
        </p>
      </div>

      {/* Quick window presets */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Best Windows</p>
        <div className="flex flex-wrap gap-2">
          {BEST_WINDOWS.map(w => (
            <button
              key={w.label}
              onClick={() => update({ from: w.from, to: w.to })}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                hours.from === w.from && hours.to === w.to
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500'
              }`}
              title={w.desc}
            >
              {w.label} ({formatHour(w.from)}–{formatHour(w.to)})
            </button>
          ))}
        </div>
      </div>

      {/* Custom time range */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Custom Window</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
            <select
              value={hours.from}
              onChange={e => update({ from: parseInt(e.target.value, 10) })}
              className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-400"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{formatHour(i)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">To</span>
            <select
              value={hours.to}
              onChange={e => update({ to: parseInt(e.target.value, 10) })}
              className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-400"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i} disabled={i <= hours.from}>{formatHour(i)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enable toggle + save */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => update({ enabled: !hours.enabled })}
            className={`relative inline-flex w-10 h-6 items-center rounded-full transition-colors cursor-pointer ${
              hours.enabled ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${
                hours.enabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Notify me {formatHour(hours.from)}–{formatHour(hours.to)} AEST
          </span>
        </label>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            saved
              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {saved ? <><CheckIcon className="w-4 h-4" /> Saved</> : 'Save'}
        </button>
      </div>
    </div>
  );
}
