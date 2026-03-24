import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SITE_URL = 'https://www.ozvfy.com';
const LAST_UPDATED = '24 March 2026';

const sections = [
  {
    title: '1. Who we are',
    content: `OzVFY (ozvfy.com) is an Australian deal aggregation website. We automatically track prices and surface discounts from Australian online retailers. References to "we", "us", or "our" refer to OzVFY.`,
  },
  {
    title: '2. Information we collect',
    content: `We collect minimal personal information. Specifically:

• Email address — only if you voluntarily subscribe to our newsletter or set up a price alert. We do not share this with third parties.
• Browsing behaviour — we use anonymous analytics (page views, clicks) to understand which deals are popular. This data is aggregated and cannot identify you personally.
• Push notification subscription token — if you opt in to browser push notifications, we store a subscription token to deliver alerts. You can revoke this at any time through your browser settings.`,
  },
  {
    title: '3. Cookies',
    content: `We use cookies and localStorage to:

• Remember your dark/light mode preference
• Store your recently viewed deals locally in your browser (never sent to our servers)
• Remember your saved deals (if you have an account)

We do not use advertising cookies or third-party tracking cookies.`,
  },
  {
    title: '4. Affiliate links',
    content: `OzVFY participates in affiliate programs. When you click a "Get Deal" button and make a purchase, we may earn a small commission from the retailer. This is at no extra cost to you — the retailer pays the commission, not you.

Affiliate relationships do not influence which deals we show or how we rank them. Rankings are based on discount percentage and price history data only.`,
  },
  {
    title: '5. How we use your information',
    content: `We use your email address solely to:

• Send the weekly deals newsletter (if you subscribed)
• Send price drop alerts for products you have saved (if you set an alert)
• Respond to enquiries you send us

We will never sell, rent, or share your email address with any third party for marketing purposes.`,
  },
  {
    title: '6. Data retention',
    content: `We retain your email address for as long as you remain subscribed. You can unsubscribe at any time using the link in any newsletter email, or by contacting us directly. Upon unsubscription, your email is marked inactive and no further emails are sent.`,
  },
  {
    title: '7. Third-party services',
    content: `OzVFY may use the following third-party services:

• Vercel — website hosting and edge delivery
• PostgreSQL (via Hetzner) — database hosting in Germany/EU
• Telegram — deal alerts published to our public channel (@ozvfys)

Each of these services has their own privacy policy. We do not share personally identifiable information with any of these services beyond what is necessary to operate the site.`,
  },
  {
    title: '8. Your rights',
    content: `You have the right to:

• Access the personal information we hold about you
• Request correction of inaccurate information
• Request deletion of your data
• Withdraw consent for marketing emails at any time

To exercise any of these rights, contact us at hello@ozvfy.com.`,
  },
  {
    title: '9. Security',
    content: `We take reasonable steps to protect your information. Our site is served over HTTPS. Passwords (if you create an account) are hashed and never stored in plain text. We do not store payment information — all purchases are completed directly on the retailer's website.`,
  },
  {
    title: '10. Children',
    content: `OzVFY is not directed at children under the age of 13. We do not knowingly collect personal information from children.`,
  },
  {
    title: '11. Changes to this policy',
    content: `We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect any changes. Continued use of the site after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '12. Contact',
    content: `If you have questions about this Privacy Policy or how your data is handled, please contact us at hello@ozvfy.com.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | OzVFY</title>
        <meta name="description" content="OzVFY's Privacy Policy — how we collect, use, and protect your personal information." />
        <link rel="canonical" href={`${SITE_URL}/privacy-policy`} />
      </Helmet>

      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-8">
          {sections.map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link to="/about" className="hover:text-orange-500 transition-colors">About OzVFY</Link>
          <Link to="/terms_and_conditions" className="hover:text-orange-500 transition-colors">Terms & Conditions</Link>
          <Link to="/" className="hover:text-orange-500 transition-colors">← Back to deals</Link>
        </div>
      </div>
    </>
  );
}
