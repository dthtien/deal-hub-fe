import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Toys',
  'Food & Drink', 'Travel', 'Books', 'Gaming', 'Automotive', 'Health',
];

const STORES = [
  'JB Hi-Fi', 'The Good Guys', 'Kmart', 'Big W', 'Target AU', 'ASOS',
  'The Iconic', 'Nike', 'Myer', 'Office Works', 'JD Sports', 'Culture Kings',
];

interface Prefs {
  categories: string[];
  stores: string[];
  budget: number;
}

const TOTAL_STEPS = 4;

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [prefs, setPrefs] = useState<Prefs>({ categories: [], stores: [], budget: 200 });

  useEffect(() => {
    try {
      const done = localStorage.getItem('ozvfy_onboarded');
      if (!done) {
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch { /* noop */ }
  }, []);

  const goTo = (nextStep: number, dir: 'left' | 'right') => {
    setSlideDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 220);
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      goTo(step + 1, 'left');
    } else {
      save();
    }
  };

  const handleBack = () => {
    if (step > 1) goTo(step - 1, 'right');
  };


  const dismiss = () => {
    try { localStorage.setItem('ozvfy_onboarded', '1'); } catch { /* noop */ }
    setVisible(false);
  };

  const save = async () => {
    try {
      localStorage.setItem('ozvfy_onboarded', '1');
      localStorage.setItem('ozvfy_browse_prefs', JSON.stringify(prefs));
    } catch { /* noop */ }
    try {
      await fetch(`${API_BASE}/api/v1/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      });
    } catch { /* ignore */ }
    setVisible(false);
  };

  const toggleCategory = (c: string) => {
    setPrefs(p => ({
      ...p,
      categories: p.categories.includes(c) ? p.categories.filter(x => x !== c) : [...p.categories, c],
    }));
  };

  const toggleStore = (s: string) => {
    setPrefs(p => ({
      ...p,
      stores: p.stores.includes(s) ? p.stores.filter(x => x !== s) : [...p.stores, s],
    }));
  };

  if (!visible) return null;

  const slideClass = animating
    ? slideDir === 'left'
      ? 'opacity-0 translate-x-4'
      : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={dismiss}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label="Close"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-5 pb-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === step ? 'bg-orange-500 w-4' : i < step ? 'bg-orange-300 dark:bg-orange-700' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <div
          className={`p-6 transition-all duration-200 ease-in-out ${slideClass}`}
          style={{ minHeight: 320 }}
        >
          {step === 0 && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to OzVFY!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
                Australia's best deals aggregator. We'll help you discover the hottest deals from your favourite stores.
              </p>
              <div className="flex gap-3 text-2xl mt-2">
                <span title="Electronics">💻</span>
                <span title="Fashion">👗</span>
                <span title="Sports">⚽</span>
                <span title="Gaming">🎮</span>
                <span title="Home">🏠</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                What do you shop for?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                We'll show you the best deals in these categories.
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
                      prefs.categories.includes(cat)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Favourite stores?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Tap stores you love to get their best deals first.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {STORES.map(store => (
                  <button
                    key={store}
                    onClick={() => toggleStore(store)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium transition-all border text-center ${
                      prefs.stores.includes(store)
                        ? 'bg-orange-500 text-white border-orange-500 scale-95'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Budget range?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                We'll prioritise deals within your budget.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">$0</span>
                  <span className="text-xl font-bold text-orange-500">${prefs.budget}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">$500+</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={prefs.budget}
                  onChange={e => setPrefs(p => ({ ...p, budget: Number(e.target.value) }))}
                  className="w-full accent-orange-500"
                />
                <div className="flex gap-2 flex-wrap">
                  {[50, 100, 200, 300, 500].map(val => (
                    <button
                      key={val}
                      onClick={() => setPrefs(p => ({ ...p, budget: val }))}
                      className={`px-3 py-1 text-sm rounded-lg border font-medium transition-colors ${
                        prefs.budget === val
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              {step >= 2 && (
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Back
                </button>
              )}
              <button
                onClick={dismiss}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {'Skip'}
              </button>
            </div>
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {step === 0 ? "Let's start!" : step === TOTAL_STEPS - 1 ? "Let's go!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
