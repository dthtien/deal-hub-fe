import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  HomeIcon, BuildingStorefrontIcon, MagnifyingGlassIcon,
  HeartIcon, DocumentTextIcon, InformationCircleIcon,
  TicketIcon, CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const SITE_URL = 'https://www.ozvfy.com';

const STORES = [
  'The Iconic', 'ASOS', 'JD Sports', 'Nike', 'Kmart', 'JB Hi-Fi',
  'Myer', 'Culture Kings', 'Big W', 'The Good Guys', 'Good Buyz',
];

const PRICE_POINTS = [50, 100, 200, 500];

const POPULAR_SEARCHES = [
  'airpods', 'headphones', 'coffee machine', 'nike shoes', 'tv', 'laptop',
];

type SitemapLink = { to: string; label: string; external?: boolean };

type SitemapSection = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  links: SitemapLink[];
};

const sections: SitemapSection[] = [
  {
    title: 'Main Pages',
    icon: HomeIcon,
    color: 'text-orange-500',
    links: [
      { to: '/',               label: 'All Deals' },
      { to: '/deals/flash',    label: '⚡ Flash Deals' },
      { to: '/deals/near-me',  label: '📍 Deals Near Me' },
      { to: '/deals/new',      label: 'New Today' },
      { to: '/best-drops',     label: 'Best Price Drops' },
      { to: '/sales-calendar', label: 'Sales Calendar' },
      { to: '/coupons',        label: 'Promo Codes & Coupons' },
    ],
  },
  {
    title: 'Deals Under',
    icon: CurrencyDollarIcon,
    color: 'text-emerald-500',
    links: PRICE_POINTS.map(p => ({
      to: `/deals-under-${p}`,
      label: `Deals Under $${p}`,
    })),
  },
  {
    title: 'Stores',
    icon: BuildingStorefrontIcon,
    color: 'text-sky-500',
    links: STORES.map(s => ({
      to: `/stores/${encodeURIComponent(s)}`,
      label: s,
    })),
  },
  {
    title: 'Coupons by Store',
    icon: TicketIcon,
    color: 'text-violet-500',
    links: STORES.map(s => ({
      to: `/coupons/${encodeURIComponent(s)}`,
      label: `${s} Coupons`,
    })),
  },
  {
    title: 'Popular Searches',
    icon: MagnifyingGlassIcon,
    color: 'text-rose-500',
    links: POPULAR_SEARCHES.map(q => ({
      to: `/deals/search/${encodeURIComponent(q)}`,
      label: `${q.replace(/\b\w/g, c => c.toUpperCase())} Deals`,
    })),
  },
  {
    title: 'Account & Tools',
    icon: HeartIcon,
    color: 'text-rose-400',
    links: [
      { to: '/saved',   label: 'Saved Deals' },
      { to: '/compare', label: 'Compare Deals' },
      { to: '/submit',  label: 'Submit a Deal' },
      { to: '/subscribe',  label: 'Newsletter Subscribe' },
    ],
  },
  {
    title: 'Company',
    icon: InformationCircleIcon,
    color: 'text-gray-500',
    links: [
      { to: '/about',              label: 'About OzVFY' },
      { to: '/privacy-policy',     label: 'Privacy Policy' },
      { to: '/terms_and_conditions', label: 'Terms & Conditions' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <Helmet>
        <title>Sitemap | OzVFY</title>
        <meta name="description" content="Complete sitemap of OzVFY — Australia's deal finder. Browse all pages, stores, categories and deal searches." />
        <link rel="canonical" href={`${SITE_URL}/sitemap`} />
      </Helmet>

      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Sitemap</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Every page on OzVFY — Australia's smartest deal finder.{' '}
            <a href="/sitemap.xml" className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">
              View XML sitemap →
            </a>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(({ title, icon: Icon, color, links }) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${color}`} />
                <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">{title}</h2>
              </div>
              <ul className="space-y-1.5">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-orange-400 transition-colors flex-shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* XML sitemap note */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-start gap-3">
          <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Looking for the machine-readable sitemap?{' '}
            <a href="/sitemap.xml" className="text-orange-500 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
              sitemap.xml
            </a>{' '}
            includes all deal pages, store pages, category pages and search landing pages — updated daily.
          </p>
        </div>
      </div>
    </>
  );
}
