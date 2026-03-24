import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BoltIcon,
  ShieldCheckIcon,
  HeartIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const SITE_URL = 'https://www.ozvfy.com';

const features = [
  {
    icon: MagnifyingGlassIcon,
    title: 'We find the deals',
    desc: 'Our crawlers scan Australia\'s top online stores multiple times a day — automatically surfacing genuine markdowns and price drops.',
  },
  {
    icon: BoltIcon,
    title: 'Updated every few hours',
    desc: 'Deals are refreshed throughout the day so you always see live pricing, not stale screenshots from last week.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Price history tracking',
    desc: 'We track price changes over time so you can see if a "sale" is actually a good deal or just a manipulated RRP.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'No fake deals',
    desc: 'We only list products with a genuine discount — items where the sale price is lower than the tracked regular price.',
  },
];

const stores = [
  'JB Hi-Fi', 'Myer', 'The Iconic', 'ASOS', 'Nike', 'JD Sports',
  'Culture Kings', 'Kmart', 'Big W', 'Office Works', 'Good Buyz', 'Booking.com',
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About OzVFY — Australia's Smartest Deal Finder</title>
        <meta name="description" content="OzVFY automatically finds and tracks the best deals across Australia's top online stores. Learn how we work, which stores we cover, and how we make money." />
        <link rel="canonical" href={`${SITE_URL}/about`} />
      </Helmet>

      <div className="max-w-3xl mx-auto py-10 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            About <span className="text-orange-500">OzVFY</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            Australia's smartest deal finder — we crawl top stores daily so you never miss a bargain.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-7 mb-10 text-white">
          <h2 className="text-xl font-bold mb-2">Our mission</h2>
          <p className="text-white/90 leading-relaxed">
            Australians spend billions online every year — but most people don't have the time to hunt across dozens of stores for the best price. OzVFY does that work for you. We monitor prices, track drops, and surface genuine deals so you can shop smarter without the scroll.
          </p>
        </div>

        {/* How it works */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">How it works</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Stores */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stores we cover</h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {stores.map(store => (
            <Link
              key={store}
              to={`/stores/${encodeURIComponent(store)}`}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full transition-colors"
            >
              <BuildingStorefrontIcon className="w-3.5 h-3.5" />
              {store}
            </Link>
          ))}
          <span className="text-sm text-gray-400 dark:text-gray-500 px-3 py-1.5">+ more coming</span>
        </div>

        {/* Affiliate disclosure */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-10">
          <div className="flex items-start gap-3">
            <CurrencyDollarIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">How we make money</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                OzVFY is free to use. We earn a small commission when you click through to a store and make a purchase via an affiliate link. This never affects the price you pay — the retailer covers our commission. Our deal rankings and listings are based purely on discount percentage and price history, not on which stores pay us more.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-10">
          <div className="flex items-start gap-3">
            <HeartIcon className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">What we stand for</h2>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold mt-0.5">→</span> Transparency — we tell you exactly where prices come from and how discounts are calculated</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold mt-0.5">→</span> Accuracy — expired or out-of-stock deals are removed automatically</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold mt-0.5">→</span> No spam — we don't sell your email or share your data with advertisers</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold mt-0.5">→</span> Community — got a deal we missed? <Link to="/submit" className="text-orange-500 hover:underline">Submit it here</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Get in touch</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Found a broken link? Want to suggest a store? We'd love to hear from you.
          </p>
          <a
            href="mailto:hello@ozvfy.com"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <EnvelopeIcon className="w-4 h-4" /> hello@ozvfy.com
          </a>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
            <Link to="/terms_and_conditions" className="hover:text-orange-500 transition-colors">Terms & Conditions</Link>
            <span>·</span>
            <Link to="/privacy-policy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/subscribe" className="hover:text-orange-500 transition-colors flex items-center gap-1">
              <ArrowRightIcon className="w-3.5 h-3.5" /> Weekly deals newsletter
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
