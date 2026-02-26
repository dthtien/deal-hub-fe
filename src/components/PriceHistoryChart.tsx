import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PricePoint {
  date: string;
  price: number;
}

interface PriceHistoryChartProps {
  productId: number;
  currentPrice: number;
}

const PriceHistoryChart = ({ productId, currentPrice }: PriceHistoryChartProps) => {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/v1/products/${productId}/price_history`
        );
        if (!res.ok) return;
        const data = await res.json();
        setHistory(data.price_history ?? []);
      } catch {
        // silently fail — chart just won't show
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [productId]);

  if (loading) {
    return (
      <div className="h-24 flex items-center justify-center">
        <div className="text-xs text-gray-400 animate-pulse">Loading price history...</div>
      </div>
    );
  }

  if (history.length < 2) return null;

  const lowestPrice = Math.min(...history.map((p) => p.price));
  const isAtLowest = currentPrice <= lowestPrice;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Price History</p>
        {isAtLowest && (
          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
            🎯 Lowest ever!
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-AU')}
          />
          <ReferenceLine
            y={lowestPrice}
            stroke="#16a34a"
            strokeDasharray="3 3"
            label={{ value: `Low $${lowestPrice}`, fontSize: 9, fill: '#16a34a', position: 'insideTopRight' }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;
