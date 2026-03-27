import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TrophyIcon, FireIcon, BuildingStorefrontIcon, TagIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface LeaderProduct {
  id: number;
  name: string;
  price: number;
  store: string;
  image_url: string;
  discount?: number;
  vote_count?: number;
  click_total?: number;
}

interface TopStore {
  store: string;
  avg_discount: number;
  deal_count: number;
}

interface LeaderboardData {
  most_voted: LeaderProduct[];
  most_clicked: LeaderProduct[];
  top_stores: TopStore[];
  biggest_discounts: LeaderProduct[];
}

const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600', 'text-gray-500', 'text-gray-500'];
const rankEmojis = ['🥇', '🥈', '🥉', '4th', '5th'];

function DealRow({ product, rank, extra }: { product: LeaderProduct; rank: number; extra?: string }) {
  return (
    <Link to={`/deals/${product.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
      <span className={`text-lg font-bold w-8 text-center flex-shrink-0 ${rankColors[rank]}`}>{rankEmojis[rank]}</span>
      <img src={product.image_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-500 dark:group-hover:text-orange-400">{product.name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{product.store} · <span className="font-semibold text-gray-700 dark:text-gray-300">${product.price}</span></p>
      </div>
      {extra && <span className="text-xs font-bold text-orange-500 dark:text-orange-400 flex-shrink-0">{extra}</span>}
    </Link>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/leaderboard`)
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <p className="text-center py-24 text-gray-400 dark:text-gray-500">Failed to load leaderboard.</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Helmet>
        <title>Deal Leaderboard — Top Deals in Australia | OzVFY</title>
        <meta name="description" content="See the most popular and top-rated deals in Australia right now. Updated daily on OzVFY." />
        <link rel="canonical" href="https://www.ozvfy.com/leaderboard" />
      </Helmet>
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white mb-2">
        <TrophyIcon className="w-8 h-8 text-yellow-500" />
        Leaderboard
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4">Top deals, stores, and discounts on OzVFY.</p>
      <Link to="/leaderboard/price-drops" className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
        💸 View Price Drop Leaderboard →
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section icon={<TrophyIcon className="w-5 h-5 text-yellow-500" />} title="Most Voted Deals">
          {data.most_voted.length === 0
            ? <p className="text-sm text-gray-400 dark:text-gray-500 italic">No votes yet.</p>
            : data.most_voted.map((p, i) => <DealRow key={p.id} product={p} rank={i} extra={p.vote_count !== undefined ? `+${p.vote_count} votes` : undefined} />)
          }
        </Section>

        <Section icon={<FireIcon className="w-5 h-5 text-orange-500" />} title="Most Clicked Deals">
          {data.most_clicked.length === 0
            ? <p className="text-sm text-gray-400 dark:text-gray-500 italic">No clicks yet.</p>
            : data.most_clicked.map((p, i) => <DealRow key={p.id} product={p} rank={i} extra={p.click_total !== undefined ? `${p.click_total} clicks` : undefined} />)
          }
        </Section>

        <Section icon={<BuildingStorefrontIcon className="w-5 h-5 text-blue-500" />} title="Top Stores by Avg Discount">
          {data.top_stores.length === 0
            ? <p className="text-sm text-gray-400 dark:text-gray-500 italic">No data.</p>
            : data.top_stores.map((s, i) => (
              <Link key={s.store} to={`/stores/${encodeURIComponent(s.store)}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <span className={`text-lg font-bold w-8 text-center flex-shrink-0 ${rankColors[i]}`}>{rankEmojis[i]}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400">{s.store}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{s.deal_count} deals</p>
                </div>
                <span className="text-sm font-bold text-rose-500 dark:text-rose-400">-{s.avg_discount}% avg</span>
              </Link>
            ))
          }
        </Section>

        <Section icon={<TagIcon className="w-5 h-5 text-rose-500" />} title="Biggest Discounts">
          {data.biggest_discounts.length === 0
            ? <p className="text-sm text-gray-400 dark:text-gray-500 italic">No data.</p>
            : data.biggest_discounts.map((p, i) => <DealRow key={p.id} product={p} rank={i} extra={p.discount ? `-${p.discount}%` : undefined} />)
          }
        </Section>
      </div>
    </div>
  );
}
