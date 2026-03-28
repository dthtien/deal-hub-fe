import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, XMarkIcon, ShareIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'ozvfy_install_dismissed';
const DISMISSED_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isDismissed(): boolean {
  try {
    const val = localStorage.getItem(DISMISSED_KEY);
    if (!val) return false;
    const ts = parseInt(val, 10);
    return Date.now() - ts < DISMISSED_DURATION_MS;
  } catch { return false; }
}

function setDismissed() {
  try { localStorage.setItem(DISMISSED_KEY, String(Date.now())); } catch { /* noop */ }
}

function detectPlatform(): 'ios' | 'android' | 'desktop' {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function trackInstall(event: string) {
  const sessionId = localStorage.getItem('ozvfy_session_id') || '';
  fetch(`${API_BASE}/api/v1/search/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, session_id: sessionId }),
  }).catch(() => { /* silent */ });
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const platform = detectPlatform();

  useEffect(() => {
    if (isDismissed()) return;

    // For iOS, show after a short delay (no beforeinstallprompt event)
    if (platform === 'ios') {
      // Only show if not running in standalone mode
      const isStandalone = ('standalone' in navigator) && (navigator as unknown as { standalone?: boolean }).standalone;
      if (!isStandalone) {
        const t = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(t);
      }
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [platform]);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      trackInstall('pwa_install');
      setShow(false);
    }
  };

  const dismiss = () => {
    setShow(false);
    setDismissed();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4 flex items-start gap-3">
      <div className="flex-shrink-0 bg-orange-500 text-white rounded-xl p-2">
        <ArrowDownTrayIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Install OzVFY App</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Get instant deal alerts, offline access &amp; faster loading.</p>

        {platform === 'ios' && (
          <div className="mt-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
              <DevicePhoneMobileIcon className="w-3.5 h-3.5" /> iOS Install
            </p>
            <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
              <li className="flex items-center gap-1">
                <span>1.</span>
                <span>Tap <ShareIcon className="w-3 h-3 inline" /> Share in Safari</span>
              </li>
              <li>2. Scroll down and tap <strong>Add to Home Screen</strong></li>
              <li>3. Tap <strong>Add</strong> to confirm</li>
            </ol>
          </div>
        )}

        {platform === 'android' && (
          <div className="mt-2 p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-400">
              Tap <strong>Install</strong> below or use your browser menu &rarr; <strong>Add to Home Screen</strong>
            </p>
          </div>
        )}

        {platform !== 'ios' && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={install}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-gray-500 dark:text-gray-400 text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Not now
            </button>
          </div>
        )}

        {platform === 'ios' && (
          <button
            onClick={dismiss}
            className="mt-2 w-full text-center px-3 py-1.5 text-gray-500 dark:text-gray-400 text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Dismiss for 30 days
          </button>
        )}
      </div>
      <button onClick={dismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-0.5">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default InstallPrompt;
