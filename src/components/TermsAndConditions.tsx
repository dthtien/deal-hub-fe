import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const LAST_UPDATED = '24 March 2026';

const sections = [
  {
    title: '1. Introduction',
    content: 'Welcome to OzVFY. By using our website, you agree to comply with and be bound by the following terms and conditions. Please review these terms carefully.',
  },
  {
    title: '2. Use of the Website',
    content: 'You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of, restrict or inhibit anyone else\'s use and enjoyment of the website.',
  },
  {
    title: '3. Intellectual Property',
    content: 'All content included on this site, such as text, graphics, logos, and software, is the property of OzVFY or its content suppliers and is protected by international copyright laws.',
  },
  {
    title: '4. Product and Service Descriptions',
    content: 'We strive to ensure that the information on our website is accurate and up-to-date. However, we do not warrant that product descriptions or other content on this site are accurate, complete, reliable, current, or error-free. All product prices and availability are subject to change without notice.',
  },
  {
    title: '5. Pricing',
    content: 'All prices displayed on our website are sourced from third-party websites and are for reference purposes only. Prices are subject to change without notice. While we strive to ensure the accuracy of pricing information, errors may occur. We do not process payments or handle transactions, and we are not responsible for any discrepancies in pricing or product information. Please refer to the respective third-party websites for the most accurate and up-to-date information.',
  },
  {
    title: '6. Affiliate Links',
    content: 'OzVFY participates in affiliate marketing programs. When you click a link to a retailer\'s website and make a purchase, we may earn a commission at no additional cost to you. Affiliate relationships do not influence the deals or products we feature.',
  },
  {
    title: '7. Third-Party Links',
    content: 'Our website may contain links to third-party websites that are not owned or controlled by OzVFY. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. You acknowledge and agree that OzVFY shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods, or services available on or through any such websites.',
  },
  {
    title: '8. Limitation of Liability',
    content: 'To the fullest extent permitted by applicable law, OzVFY shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our website or the information displayed on it.',
  },
  {
    title: '9. Changes to Terms and Conditions',
    content: 'OzVFY reserves the right to change these terms and conditions at any time without prior notice. Any changes will be posted on this page, and it is your responsibility to review these terms regularly to ensure you are aware of any changes.',
  },
  {
    title: '10. Contact Information',
    content: 'If you have any questions about these Terms and Conditions, please contact us at hello@ozvfy.com.',
  },
];

const TermsAndConditions = () => (
  <>
    <Helmet>
      <title>Terms & Conditions | OzVFY</title>
      <meta name="description" content="OzVFY Terms and Conditions — the rules governing use of our deal finder website." />
    </Helmet>

    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8">
        {sections.map(({ title, content }) => (
          <div key={title}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link to="/about" className="hover:text-orange-500 transition-colors">About OzVFY</Link>
        <Link to="/privacy-policy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
        <Link to="/" className="hover:text-orange-500 transition-colors">← Back to deals</Link>
      </div>
    </div>
  </>
);

export default TermsAndConditions;
