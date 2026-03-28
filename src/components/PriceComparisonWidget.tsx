import { useState, useEffect } from 'react';
import { BuildingStorefrontIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { TrophyIcon } from '@heroicons/react/24/solid';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface PriceRow {
  store: string;
  price: number;
  old_price: number;
  discount: number;
  product_id: number;
  url: string | null;
}

interface PriceComparisonWidgetProps {
  productName: string;
  currentProductId: number;
  currentPrice: number;
}

export default function PriceComparisonWidget({ productName, currentProductId, currentPrice }: PriceComparisonWidgetProps) {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productName) return;
    setLoading(true);
    fetch(`${API_BASE}/api/v1/deals/compare_prices?name=${encodeURIComponent(productName)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { comparison: PriceRow[] }) => {
        // Filter out current product's store if it's the same product_id
        setRows(d.comparison || []);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [productName]);

  if (loading) return null;
  if (rows.length <= 1) return null;

  const cheapest = rows[0];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
        <BuildingStorefrontIcon className="w-4 h-4 text-orange-500" />
        Same product elsewhere:
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
              <th className="text-left pb-2 font-medium">Store</th>
              <th className="text-right pb-2 font-medium">Price</th>
              <th className="text-right pb-2 font-medium">Discount</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isCheapest = row.product_id === cheapest.product_id;
              const isCurrent = row.product_id === currentProductId;
              return (
                <tr
                  key={row.product_id}
                  className={`border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                    isCheapest ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''
                  }`}
                >
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1.5">
                      {isCheapest && (
                        <TrophyIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      )}
                      <span className={`font-medium ${isCurrent ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {row.store}
                        {isCurrent && <span className="ml-1 text-xs text-gray-400">(this deal)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <span className={`font-bold ${isCheapest ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      ${row.price.toFixed(2)}
                    </span>
                    {row.old_price > 0 && row.old_price > row.price && (
                      <span className="text-xs text-gray-400 line-through ml-1">${row.old_price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {row.discount > 0 ? (
                      <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">
                        -{row.discount.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    {isCheapest && row.url && !isCurrent && (
                      <a
                        href={`/deals/${row.product_id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 whitespace-nowrap"
                      >
                        Get cheapest
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {cheapest.price < currentPrice && cheapest.product_id !== currentProductId && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
          Save ${(currentPrice - cheapest.price).toFixed(2)} by getting it at {cheapest.store}!
        </p>
      )}
    </div>
  );
}
