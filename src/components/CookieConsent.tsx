import { useEffect, useState } from 'react';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const CONSENT_KEY = 'ozvfy_cookie_consent';
const PREFS_KEY = 'ozvfy_cookie_prefs';

interface CookiePrefs {
  analytics: boolean;
  marketing: boolean;
  personalisation: boolean;
}

const DEFAULT_PREFS: CookiePrefs = { analytics: true, marketing: true, personalisation: true };
const ESSENTIAL_PREFS: CookiePrefs = { analytics: false, marketing: false, personalisation: false };

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_PREFS);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
      // Auto-hide after 10s accepting all
      const timer = setTimeout(() => {
        acceptAll();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const save = (p: CookiePrefs, type: string) => {
    localStorage.setItem(CONSENT_KEY, type);
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    setVisible(false);
  };

  const acceptAll = () => save(DEFAULT_PREFS, 'all');
  const essentialOnly = () => save(ESSENTIAL_PREFS, 'essential');
  const savePrefs = () => save(prefs, 'custom');

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">We value your privacy</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              We use cookies to improve your experience and show relevant deals. You can choose what to allow.
            </p>

            {managing && (
              <div className="mt-3 space-y-2.5 border-t border-gray-100 dark:border-gray-800 pt-3">
                {(['analytics', 'marketing', 'personalisation'] as const).map(key => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{key}</span>
                      <p className="text-xs text-gray-400">
                        {key === 'analytics' && 'Understand how you use OzVFY'}
                        {key === 'marketing' && 'Show relevant ads and offers'}
                        {key === 'personalisation' && 'Personalise your deal feed'}
                      </p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={prefs[key]}
                      onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                        prefs[key] ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                        prefs[key] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={acceptAll}
                className="flex-1 min-w-[120px] bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              >
                Accept all
              </button>
              <button
                onClick={essentialOnly}
                className="flex-1 min-w-[120px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              >
                Essential only
              </button>
              {managing ? (
                <button
                  onClick={savePrefs}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 px-3 py-2 transition-colors"
                >
                  Save preferences
                </button>
              ) : (
                <button
                  onClick={() => setManaging(true)}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-2 transition-colors"
                >
                  Manage preferences
                </button>
              )}
            </div>
          </div>
          <button
            onClick={acceptAll}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
