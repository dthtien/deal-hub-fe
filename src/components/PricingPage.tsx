import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckIcon } from '@heroicons/react/24/solid';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  badge: string;
  price: string;
  priceNote: string;
  highlight: boolean;
  cta: string;
  ctaLink: string;
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    badge: '',
    price: '$0',
    priceNote: 'forever',
    highlight: false,
    cta: 'Get Started',
    ctaLink: '/',
    features: [
      { text: 'Browse all deals',             included: true },
      { text: 'Save up to 10 deals',           included: true },
      { text: 'Basic price alerts',            included: true },
      { text: 'Weekly digest email',           included: false },
      { text: 'Instant price alerts',          included: false },
      { text: 'Early flash deal access',       included: false },
      { text: 'Priority support',              included: false },
    ],
  },
  {
    name: 'Pro',
    badge: '⭐',
    price: '$4.99',
    priceNote: 'per month',
    highlight: true,
    cta: 'Go Pro',
    ctaLink: '/subscribe',
    features: [
      { text: 'Everything in Free',            included: true },
      { text: 'Unlimited saved deals',         included: true },
      { text: 'Daily digest email',            included: true },
      { text: 'Instant price alerts',          included: true },
      { text: 'Advanced deal filters',         included: true },
      { text: 'Early flash deal access',       included: false },
      { text: 'Priority support',              included: false },
    ],
  },
  {
    name: 'VIP',
    badge: '💎',
    price: '$9.99',
    priceNote: 'per month',
    highlight: false,
    cta: 'Go VIP',
    ctaLink: '/subscribe',
    features: [
      { text: 'Everything in Pro',             included: true },
      { text: 'Early access to flash deals',   included: true },
      { text: 'Priority support',              included: true },
      { text: 'Exclusive VIP-only deals',      included: true },
      { text: 'Personal deal concierge',       included: true },
      { text: 'Custom price alert rules',      included: true },
      { text: 'Export deal history CSV',       included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <Helmet>
        <title>Pricing | OzVFY</title>
        <meta name="description" content="Choose your OzVFY plan. Free, Pro, or VIP — save smarter on Australian deals." />
      </Helmet>
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Simple, honest pricing</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Start free. Upgrade when you want more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                plan.highlight
                  ? 'border-orange-400 dark:border-orange-500 shadow-xl bg-orange-50 dark:bg-orange-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {plan.badge && <span>{plan.badge}</span>}
                  {plan.name}
                </h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">{plan.priceNote}</span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${f.included ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600 line-through'}`}>
                    <CheckIcon className={`w-4 h-4 flex-shrink-0 ${f.included ? 'text-green-500' : 'text-gray-300 dark:text-gray-700'}`} />
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaLink}
                className={`w-full text-center py-3 px-6 rounded-xl font-bold text-sm transition-all ${
                  plan.highlight
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
          Cancel anytime. No lock-in contracts. &nbsp;
          <Link to="/" className="text-orange-500 hover:underline">Back to deals</Link>
        </p>
      </div>
    </>
  );
}
