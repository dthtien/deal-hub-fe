import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import QueryString from 'qs';
import { Deal } from '../types';
import Item from './Deals/Item';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SITE_URL = 'https://www.ozvfy.com';

// Black Friday 2026 is Friday 27 November, Cyber Monday is Monday 30 November.
// Times are midnight Melbourne/Sydney time (AEDT, UTC+11).
const BLACK_FRIDAY_START = Date.parse('2026-11-27T00:00:00+11:00');
const CYBER_MONDAY_END = Date.parse('2026-12-01T00:00:00+11:00');

interface StoreSummary {
  name: string;
  deal_count: number;
}

type Phase = 'before' | 'live' | 'over';

function phaseAt(now: number): Phase {
  if (now < BLACK_FRIDAY_START) return 'before';
  if (now < CYBER_MONDAY_END) return 'live';
  return 'over';
}

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, BLACK_FRIDAY_START - now);
  return {
    phase: phaseAt(now),
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

const FAQS = [
  {
    q: 'When is Black Friday 2026 in Australia?',
    a: 'Black Friday is Friday 27 November 2026 and Cyber Monday is Monday 30 November 2026. Many Australian stores start their sales earlier in the week and keep them running over the weekend.',
  },
  {
    q: 'Which Australian stores have Black Friday sales?',
    a: 'Most big Australian retailers run Black Friday sales, including JB Hi-Fi, Myer, Big W and Officeworks. This page shows the biggest discounts we are tracking at each store right now.',
  },
  {
    q: 'How do I know a Black Friday discount is real?',
    a: 'Open any deal on OzVFY to see its price history. If the price went up just before the sale, the "was" price is not a good guide. Set a price alert on items you want and we will tell you when the price drops.',
  },
  {
    q: 'How often are these deals updated?',
    a: 'OzVFY checks prices at Australian stores several times a day, so expired deals drop off and new markdowns appear through the sale.',
  },
];

function DealGrid({ deals, onFilter }: { deals: Deal[]; onFilter: (q: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      {deals.map(deal => (
        <Item key={deal.id} deal={deal} fetchData={onFilter} />
      ))}
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
}

export default function BlackFridayPage() {
  const navigate = useNavigate();
  const { phase, days, hours, minutes, seconds } = useCountdown();
  const [topDeals, setTopDeals] = useState<Deal[]>([]);
  const [topLoading, setTopLoading] = useState(true);
  const [storeDeals, setStoreDeals] = useState<{ store: string; count: number; deals: Deal[] }[]>([]);

  const onFilter = (q: Record<string, unknown>) => navigate(`/?${QueryString.stringify(q)}`);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals?order[discount]=desc&per_page=12`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => setTopDeals(d.products || []))
      .catch(() => {})
      .finally(() => setTopLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/v1/stores`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(async d => {
        const stores: StoreSummary[] = (d.stores || [])
          .filter((s: StoreSummary) => s.deal_count > 0)
          .sort((a: StoreSummary, b: StoreSummary) => b.deal_count - a.deal_count)
          .slice(0, 6);
        const sections = await Promise.all(
          stores.map(s => {
            const qs = QueryString.stringify(
              { stores: [s.name], order: { discount: 'desc' }, per_page: 4 },
              { arrayFormat: 'brackets' },
            );
            return fetch(`${API_BASE}/api/v1/deals?${qs}`)
              .then(r => (r.ok ? r.json() : { products: [] }))
              .then(res => ({ store: s.name, count: s.deal_count, deals: (res.products || []) as Deal[] }))
              .catch(() => ({ store: s.name, count: s.deal_count, deals: [] as Deal[] }));
          }),
        );
        if (!cancelled) setStoreDeals(sections.filter(s => s.deals.length > 0));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const canonicalUrl = `${SITE_URL}/black-friday`;
  const title = 'Black Friday Deals Australia 2026: Best Sales & Discounts | OzVFY';
  const description =
    'The best Black Friday 2026 deals in Australia from JB Hi-Fi, Myer, Big W, Officeworks and more. Biggest discounts, price history and a countdown to Friday 27 November.';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>›</span>
          <Link to="/sales-calendar" className="hover:text-orange-500 transition-colors">Sales Calendar</Link>
          <span>›</span>
          <span className="text-gray-800 dark:text-white">Black Friday</span>
        </nav>

        {/* Hero */}
        <section className="rounded-2xl bg-gray-900 text-white p-6 sm:p-8 mb-8 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">
            Friday 27 November to Monday 30 November 2026
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Black Friday Deals Australia 2026
          </h1>
          {phase === 'before' && (
            <>
              <p className="text-gray-300 mb-5">
                Black Friday starts in:
              </p>
              <div className="flex gap-3 mb-5" aria-live="off">
                {[
                  { v: days, l: 'days' },
                  { v: hours, l: 'hours' },
                  { v: minutes, l: 'mins' },
                  { v: seconds, l: 'secs' },
                ].map(u => (
                  <div key={u.l} className="bg-white/10 rounded-xl px-3 py-2 text-center min-w-[64px]">
                    <div className="text-2xl font-extrabold tabular-nums">{String(u.v).padStart(2, '0')}</div>
                    <div className="text-[11px] uppercase text-gray-400">{u.l}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-300">
                Early sales are already running. These are the biggest discounts we are tracking right now.
              </p>
            </>
          )}
          {phase === 'live' && (
            <p className="text-lg text-gray-200">
              Black Friday sales are on now. Prices are checked several times a day, so come back for new markdowns.
            </p>
          )}
          {phase === 'over' && (
            <p className="text-lg text-gray-200">
              Black Friday 2026 is over. The next big sale is Boxing Day:{' '}
              <Link to="/sales-calendar" className="text-orange-400 underline">see the sales calendar</Link>.
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-5">
            <Link to="/notifications/preferences" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold">
              Get deal alerts
            </Link>
            <Link to="/deals/price-watch" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold">
              Price watch
            </Link>
            <Link to="/gift-guide" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold">
              Christmas gift guide
            </Link>
          </div>
        </section>

        {/* Biggest discounts */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Biggest discounts right now</h2>
          {topLoading ? <SkeletonList count={4} /> : <DealGrid deals={topDeals} onFilter={onFilter} />}
        </section>

        {/* By store */}
        {storeDeals.map(s => (
          <section key={s.store} className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {s.store} Black Friday deals
              </h2>
              <Link
                to={`/stores/${encodeURIComponent(s.store)}`}
                className="text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                All {s.count.toLocaleString()} {s.store} deals →
              </Link>
            </div>
            <DealGrid deals={s.deals} onFilter={onFilter} />
          </section>
        ))}

        {/* Budget links */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Black Friday deals by budget</h2>
          <div className="flex flex-wrap gap-2">
            {[50, 100, 200, 500].map(p => (
              <Link
                key={p}
                to={`/deals-under-${p}`}
                className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:border-orange-400 hover:text-orange-500"
              >
                Under ${p}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Black Friday 2026 FAQ</h2>
          <div className="space-y-4">
            {FAQS.map(f => (
              <div key={f.q}>
                <h3 className="font-semibold text-gray-900 dark:text-white">{f.q}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
