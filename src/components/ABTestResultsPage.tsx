import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

const isAdmin = () => {
  try { return !!localStorage.getItem('ozvfy_admin'); } catch { return false; }
};

interface ExperimentVariant {
  name: string;
  impressions: number;
  clicks: number;
}

interface Experiment {
  name: string;
  variants: ExperimentVariant[];
}

// Simulate A/B test data from localStorage tracking logs
function loadExperimentsFromStorage(): Experiment[] {
  try {
    const raw = localStorage.getItem('ozvfy_ab_experiments');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  // Simulated fallback data
  return [
    {
      name: 'homepage_hero_cta',
      variants: [
        { name: 'control', impressions: 842, clicks: 112 },
        { name: 'variant_a', impressions: 851, clicks: 145 },
      ],
    },
    {
      name: 'deal_card_layout',
      variants: [
        { name: 'grid', impressions: 1230, clicks: 198 },
        { name: 'list', impressions: 1189, clicks: 221 },
        { name: 'compact', impressions: 1102, clicks: 167 },
      ],
    },
    {
      name: 'filter_sidebar_position',
      variants: [
        { name: 'left', impressions: 670, clicks: 87 },
        { name: 'top', impressions: 643, clicks: 102 },
      ],
    },
  ];
}

export default function ABTestResultsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    setExperiments(loadExperimentsFromStorage());
  }, []);

  if (!isAdmin()) return <Navigate to="/" replace />;

  const getWinner = (exp: Experiment): string | null => {
    if (exp.variants.length < 2) return null;
    const withRate = exp.variants.map(v => ({ ...v, rate: v.impressions > 0 ? v.clicks / v.impressions : 0 }));
    const sorted = [...withRate].sort((a, b) => b.rate - a.rate);
    if (sorted[0].rate - sorted[1].rate > 0.01) return sorted[0].name;
    return null;
  };

  return (
    <>
      <Helmet><title>A/B Test Results | OzVFY Admin</title></Helmet>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">A/B Test Results</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Simulated experiment data from visitor tracking. Data sourced from <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">localStorage</code> and search tracking.
        </p>

        <div className="space-y-6">
          {experiments.map(exp => {
            const winner = getWinner(exp);
            const totalImpressions = exp.variants.reduce((s, v) => s + v.impressions, 0);

            return (
              <div key={exp.name} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">{exp.name.replace(/_/g, ' ')}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{exp.variants.length} variants &middot; {totalImpressions.toLocaleString()} total impressions</p>
                  </div>
                  {winner && (
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                      Winner: {winner}
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Variant</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Impressions</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Clicks</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Click Rate</th>
                        <th className="px-5 py-3 w-48">Distribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {exp.variants.map(v => {
                        const rate = v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0;
                        const isWinner = winner === v.name;
                        return (
                          <tr key={v.name} className={isWinner ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}>
                            <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                              {v.name}
                              {isWinner && <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">best</span>}
                            </td>
                            <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-400">{v.impressions.toLocaleString()}</td>
                            <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-400">{v.clicks.toLocaleString()}</td>
                            <td className={`px-5 py-3 text-right font-bold ${isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}>
                              {rate.toFixed(1)}%
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isWinner ? 'bg-emerald-500' : 'bg-orange-400'}`}
                                    style={{ width: `${rate.toFixed(1)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 w-10 text-right">{rate.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
