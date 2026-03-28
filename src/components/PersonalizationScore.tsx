import { useMemo } from 'react';
import { Link } from 'react-router-dom';

function computeScore(): { score: number; breakdown: { label: string; value: boolean; pts: number }[] } {
  const breakdown = [
    {
      label: 'Preferences set',
      pts: 30,
      value: (() => {
        try {
          const prefs = localStorage.getItem('ozvfy_preferences');
          if (!prefs) return false;
          const p = JSON.parse(prefs);
          return !!(p && (Array.isArray(p.categories) ? p.categories.length > 0 : false || Array.isArray(p.stores) ? p.stores.length > 0 : false));
        } catch { return false; }
      })(),
    },
    {
      label: 'Browse history',
      pts: 30,
      value: (() => {
        try {
          const history = localStorage.getItem('ozvfy_recent_views');
          if (!history) return false;
          const arr = JSON.parse(history);
          return Array.isArray(arr) && arr.length > 0;
        } catch { return false; }
      })(),
    },
    {
      label: 'Saved deals',
      pts: 20,
      value: (() => {
        try {
          const saved = localStorage.getItem('ozvfy_saved_deals');
          if (!saved) return false;
          const arr = JSON.parse(saved);
          return Array.isArray(arr) && arr.length > 0;
        } catch { return false; }
      })(),
    },
    {
      label: 'Rated deals',
      pts: 20,
      value: (() => {
        try {
          const ratings = localStorage.getItem('ozvfy_ratings');
          if (!ratings) return false;
          const obj = JSON.parse(ratings);
          return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
        } catch { return false; }
      })(),
    },
  ];

  const score = breakdown.filter(b => b.value).reduce((sum, b) => sum + b.pts, 0);
  return { score, breakdown };
}

const PersonalizationScore = () => {
  const { score } = useMemo(() => computeScore(), []);

  if (score === 100) return null; // fully personalised, no nudge needed

  return (
    <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl px-4 py-2.5 mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Your feed is <span className="text-orange-600 dark:text-orange-400 font-extrabold">{score}%</span> personalised
          </span>
          <Link
            to="/subscribe/preferences"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline whitespace-nowrap ml-2 flex-shrink-0"
          >
            Improve your feed &rarr;
          </Link>
        </div>
        <div className="h-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalizationScore;
