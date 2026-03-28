import { useState, useEffect } from 'react';

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

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<Prefs>({ categories: [], stores: [], budget: 200 });

  useEffect(() => {
    try {
      const done = localStorage.getItem('ozvfy_onboarded');
      if (!done) {
        // Delay slightly so the page renders first
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch { /* noop */ }
  }, []);

  const handleSkip = () => {
    if (step < 3) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(s => s + 1);
    } else {
      save();
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Progress */}
        <div className="flex gap-1 p-4 pb-0">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>

        <div className="p-6">
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
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {step === 3 ? "Let's go!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
