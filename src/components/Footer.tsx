import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '/logo.png';
import { FireIcon, LightBulbIcon, HeartIcon, ShoppingBagIcon, EnvelopeIcon, ArrowRightIcon, CalendarIcon, TagIcon, MagnifyingGlassIcon, SparklesIcon, ArrowTrendingDownIcon, ClockIcon, TrophyIcon, BellIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';
const currentYear = new Date().getFullYear();

const popularSearches = [
  { label: 'AirPods Deals',        keyword: 'airpods' },
  { label: 'Headphones Deals',     keyword: 'headphones' },
  { label: 'Coffee Machine Deals', keyword: 'coffee machine' },
  { label: 'Nike Shoes Deals',     keyword: 'nike shoes' },
  { label: 'TV Deals',             keyword: 'tv' },
  { label: 'Laptop Deals',         keyword: 'laptop' },
];

const footerLinks = [
  { label: 'Trending Deals',  to: '/',              icon: FireIcon },
  { label: 'New Today',       to: '/deals/new',         icon: SparklesIcon },
  { label: 'This Week',       to: '/deals/this-week',   icon: CalendarIcon },
  { label: 'Price Drops',     to: '/best-drops',        icon: ArrowTrendingDownIcon },
  { label: 'Expiring Soon',   to: '/deals/expiring',    icon: ClockIcon },
  { label: 'Submit a Deal',   to: '/submit',         icon: LightBulbIcon },
  { label: 'Saved Deals',     to: '/saved',          icon: HeartIcon },
  { label: 'The Iconic',      to: '/stores/The%20Iconic', icon: ShoppingBagIcon },
  { label: 'JD Sports',       to: '/stores/JD%20Sports',  icon: ShoppingBagIcon },
  { label: 'JB Hi-Fi',        to: '/stores/JB%20Hi-Fi',   icon: ShoppingBagIcon },
  { label: 'Beginning Boutique', to: '/stores/Beginning%20Boutique', icon: ShoppingBagIcon },
  { label: 'Universal Store',    to: '/stores/Universal%20Store',    icon: ShoppingBagIcon },
  { label: 'Coupons',          to: '/coupons',              icon: TagIcon },
  { label: 'Sales Calendar',  to: '/sales-calendar',      icon: CalendarIcon },
  { label: 'Leaderboard',      to: '/leaderboard',           icon: TrophyIcon },
  { label: 'Notifications',   to: '/notifications',         icon: BellIcon },
  { label: 'Search History',  to: '/search-history',        icon: MagnifyingGlassIcon },
  { label: 'Deals by Budget', to: '/deals-under',          icon: TagIcon },
  { label: 'Deals Under $50', to: '/deals-under-50',      icon: TagIcon },
  { label: 'Deals Under $100', to: '/deals-under-100',    icon: TagIcon },
  { label: 'Collections',      to: '/collections',         icon: SparklesIcon },
];

export default function Footer() {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [footerEmail, setFooterEmail] = useState('');
  const [dailyAlerts, setDailyAlerts] = useState(false);
  const [footerSubStatus, setFooterSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/metadata`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setSubscriberCount(d.subscriber_count ?? null))
      .catch(() => {});
  }, []);

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail) return;
    setFooterSubStatus('loading');
    try {
      const body: Record<string, unknown> = { email: footerEmail };
      if (dailyAlerts) body.preferences = { daily_alerts: true };
      const r = await fetch(`${API_BASE}/api/v1/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok || r.status === 422) {
        setFooterSubStatus('success');
        setFooterEmail('');
      } else {
        setFooterSubStatus('error');
      }
    } catch {
      setFooterSubStatus('error');
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="OzVFY" className="w-10 h-10 rounded-xl" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">OzVFY</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Australia's smartest deal finder. We crawl top stores daily so you never miss a bargain.
            </p>
            {subscriberCount !== null && (
              <p className="text-sm font-semibold text-orange-500 dark:text-orange-400 mt-2">
                Join {subscriberCount.toLocaleString()} deal hunters
              </p>
            )}
            <div className="flex items-center gap-3 mt-4">
              <a href="https://www.facebook.com/aussiedealshub" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="https://www.instagram.com/aussiedealshub/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
              </a>
              <a href="https://x.com/hub_aussie52616" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {footerLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">
                    <l.icon className="w-3.5 h-3.5" />{l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular searches */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Popular Searches</h3>
            <ul className="space-y-2.5">
              {popularSearches.map(s => (
                <li key={s.keyword}>
                  <Link
                    to={`/deals/search/${encodeURIComponent(s.keyword)}`}
                    className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-3.5 h-3.5" />{s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'About OzVFY',        to: '/about' },
                { label: 'Privacy Policy',     to: '/privacy-policy' },
                { label: 'Terms & Conditions', to: '/terms_and_conditions' },
                { label: 'Alcohol Policy (18+)', to: '/terms_and_conditions' },
                { label: 'Submit a Deal',       to: '/submit' },
                { label: 'Newsletter Preview',  to: '/email-preview' },
              { label: 'Sitemap',             to: '/sitemap' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter CTA */}
          <div className="col-span-full sm:col-span-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Weekly Deals</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Top 10 deals every Monday. Free.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Weekly digest · No spam · Unsubscribe anytime</p>
            {subscriberCount !== null && subscriberCount > 0 && (
              <p className="text-xs text-orange-500 font-semibold mb-3">🎉 Join {subscriberCount.toLocaleString()} deal hunters</p>
            )}
            {footerSubStatus === 'success' ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">✅ You're subscribed! Check your inbox.</p>
            ) : (
              <form onSubmit={handleFooterSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={footerEmail}
                    onChange={e => setFooterEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 min-w-0 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-orange-400"
                  />
                  <button
                    type="submit"
                    disabled={footerSubStatus === 'loading'}
                    className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors flex-shrink-0"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailyAlerts}
                    onChange={e => setDailyAlerts(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">I want daily deal alerts</span>
                </label>
                {footerSubStatus === 'error' && (
                  <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">&copy; {currentYear} OzVFY. All rights reserved.</p>
          <p className="text-xs text-gray-400">We may earn commissions on purchases through affiliate links.</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">🔞 Alcohol deals are for 18+ only. Please drink responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
