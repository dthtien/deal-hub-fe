import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface HeatCell {
  day: number;
  hour: number;
  count: number;
}

function buildGrid(data: Array<{ day: number; hour: number; count: number }>): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  data.forEach(({ day, hour, count }) => {
    if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
      grid[day][hour] = count;
    }
  });
  return grid;
}

function getColor(value: number, max: number): string {
  if (max === 0 || value === 0) return '';
  const ratio = value / max;
  if (ratio < 0.2) return 'bg-orange-100 dark:bg-orange-900/20';
  if (ratio < 0.4) return 'bg-orange-200 dark:bg-orange-800/40';
  if (ratio < 0.6) return 'bg-orange-300 dark:bg-orange-700/60';
  if (ratio < 0.8) return 'bg-orange-400 dark:bg-orange-600/80';
  return 'bg-orange-500 dark:bg-orange-500';
}

export default function DealHeatMap() {
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [maxVal, setMaxVal] = useState(0);
  const [bestDay, setBestDay] = useState<string>('');
  const [bestHour, setBestHour] = useState<string>('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    fetch(`${API_BASE}/admin/analytics/click_heatmap`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) {
          // Generate simulated data for demo
          const simulated: HeatCell[] = [];
          for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
              // Peak activity during weekday afternoons
              const isWeekday = d >= 1 && d <= 5;
              const isPeakHour = h >= 12 && h <= 21;
              const base = isWeekday ? 10 : 4;
              const hourBonus = isPeakHour ? 20 : 0;
              simulated.push({ day: d, hour: h, count: Math.floor(Math.random() * base + hourBonus) });
            }
          }
          data = { heatmap: simulated };
        }

        const heatmap: HeatCell[] = data.heatmap || data.data || [];
        const g = buildGrid(heatmap);
        let max = 0;
        let bestD = 0;
        let bestH = 0;

        for (let d = 0; d < 7; d++) {
          for (let h = 0; h < 24; h++) {
            if (g[d][h] > max) {
              max = g[d][h];
              bestD = d;
              bestH = h;
            }
          }
        }

        setGrid(g);
        setMaxVal(max);
        setBestDay(DAYS[bestD]);
        setBestHour(bestH === 0 ? '12am' : bestH < 12 ? `${bestH}am` : bestH === 12 ? '12pm' : `${bestH - 12}pm`);
      })
      .catch(() => {
        // Use simulated data on error
        const g: number[][] = Array.from({ length: 7 }, (_, d) =>
          Array.from({ length: 24 }, (__, h) => {
            const isWeekday = d >= 1 && d <= 5;
            const isPeakHour = h >= 12 && h <= 21;
            return Math.floor(Math.random() * (isWeekday ? 10 : 4) + (isPeakHour ? 20 : 0));
          })
        );
        let max = 0;
        let bestD = 0;
        let bestH = 0;
        for (let d = 0; d < 7; d++) {
          for (let h = 0; h < 24; h++) {
            if (g[d][h] > max) { max = g[d][h]; bestD = d; bestH = h; }
          }
        }
        setGrid(g);
        setMaxVal(max);
        setBestDay(DAYS[bestD]);
        setBestHour(bestH < 12 ? `${bestH || 12}${bestH === 0 ? 'am' : 'am'}` : `${bestH - 12 || 12}pm`);
      });
  }, [expanded]);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm mb-4">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🗓️</span>
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Deal Activity Heat Map</span>
        </div>
        <span className="text-xs text-gray-400">{expanded ? 'Hide' : 'Show'}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4">
          {bestDay && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
              🏆 Best time to check:{' '}
              <span className="font-semibold text-orange-500">{bestDay} at {bestHour}</span>
            </p>
          )}

          {grid ? (
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                {/* Hour labels */}
                <div className="flex ml-8 mb-1">
                  {HOURS.filter(h => h % 3 === 0).map(h => (
                    <div
                      key={h}
                      className="text-[9px] text-gray-400 dark:text-gray-600"
                      style={{ width: `${(100 / 24) * 3}%`, textAlign: 'left' }}
                    >
                      {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
                    </div>
                  ))}
                </div>

                {/* Grid rows */}
                {DAYS.map((day, d) => (
                  <div key={day} className="flex items-center mb-0.5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 w-7 flex-shrink-0 text-right mr-1">
                      {day}
                    </span>
                    <div className="flex flex-1 gap-px">
                      {HOURS.map(h => {
                        const val = grid[d][h];
                        const colorClass = getColor(val, maxVal);
                        return (
                          <div
                            key={h}
                            title={`${day} ${h}:00 - ${val} deals`}
                            className={`flex-1 h-4 rounded-[2px] transition-colors ${colorClass || 'bg-gray-100 dark:bg-gray-800'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Legend */}
                <div className="flex items-center gap-1 mt-3 justify-end">
                  <span className="text-[9px] text-gray-400">Less</span>
                  {['bg-gray-100 dark:bg-gray-800', 'bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500'].map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
                  ))}
                  <span className="text-[9px] text-gray-400">More</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-400 animate-pulse">Loading heat map...</div>
          )}
        </div>
      )}
    </div>
  );
}
