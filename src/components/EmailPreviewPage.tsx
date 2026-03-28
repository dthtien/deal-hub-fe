import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

const isAdmin = () => {
  try { return !!localStorage.getItem('ozvfy_admin'); } catch { return false; }
};

interface MockData {
  productName: string;
  oldPrice: string;
  newPrice: string;
  discount: string;
  store: string;
  imageUrl: string;
  alertTarget: string;
}

const DEFAULTS: MockData = {
  productName: 'Apple AirPods Pro (2nd Gen)',
  oldPrice: '399.00',
  newPrice: '249.00',
  discount: '37.6',
  store: 'JB Hi-Fi',
  imageUrl: 'https://via.placeholder.com/200x200?text=Product',
  alertTarget: '270.00',
};

const RE_ENGAGEMENT_MOCK = {
  subscriberName: 'Alex',
  daysSinceVisit: 14,
  deals: [
    { name: 'Apple AirPods Pro (2nd Gen)', store: 'JB Hi-Fi', price: '249.00', oldPrice: '399.00', discount: '37' },
    { name: 'Dyson V12 Detect Slim Vacuum', store: 'The Good Guys', price: '699.00', oldPrice: '999.00', discount: '30' },
    { name: 'Samsung 65" 4K QLED TV', store: 'Harvey Norman', price: '1299.00', oldPrice: '1999.00', discount: '35' },
  ],
};

export default function EmailPreviewPage() {
  const [mock, setMock] = useState<MockData>(DEFAULTS);
  const [activeTemplate, setActiveTemplate] = useState<'price_alert' | 're_engagement'>('price_alert');

  if (!isAdmin()) return <Navigate to="/" replace />;

  const dropPercent = mock.oldPrice && mock.newPrice
    ? (((parseFloat(mock.oldPrice) - parseFloat(mock.newPrice)) / parseFloat(mock.oldPrice)) * 100).toFixed(1)
    : mock.discount;

  const dealUrl = `https://www.ozvfy.com/deals/1`;
  const unsubUrl = `https://www.ozvfy.com/unsubscribe?email=preview@example.com`;

  return (
    <>
      <Helmet><title>Email Preview | OzVFY Admin</title></Helmet>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Email Preview</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Preview email templates.</p>

        {/* Template selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTemplate('price_alert')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTemplate === 'price_alert'
                ? 'bg-orange-500 text-white'
                : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400'
            }`}
          >
            Price Alert Email
          </button>
          <button
            onClick={() => setActiveTemplate('re_engagement')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTemplate === 're_engagement'
                ? 'bg-orange-500 text-white'
                : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400'
            }`}
          >
            Re-engagement Email
          </button>
        </div>

        {activeTemplate === 're_engagement' ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Email preview (re_engagement template) - Mock: {RE_ENGAGEMENT_MOCK.subscriberName}, {RE_ENGAGEMENT_MOCK.daysSinceVisit} days since last visit</p>
            <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', padding: '32px 24px', textAlign: 'center' }}>
                <h1 style={{ color: 'white', margin: 0, fontSize: 28, fontWeight: 800 }}>We miss you! 👋</h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0', fontSize: 16 }}>Here are today's best deals, just for you</p>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ color: '#374151', fontSize: 15 }}>Hi {RE_ENGAGEMENT_MOCK.subscriberName},</p>
                <p style={{ color: '#6b7280', fontSize: 14 }}>It's been {RE_ENGAGEMENT_MOCK.daysSinceVisit} days since you visited OzVFY. We've been busy finding amazing deals for you!</p>
                {RE_ENGAGEMENT_MOCK.deals.map((deal, i) => (
                  <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 4px', fontSize: 15 }}>{deal.name}</p>
                    <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px' }}>{deal.store}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: '#f97316' }}>${deal.price}</span>
                      <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through' }}>${deal.oldPrice}</span>
                      <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>-{deal.discount}%</span>
                    </div>
                    <a href="https://www.ozvfy.com/deals/1" style={{ display: 'inline-block', marginTop: 10, background: '#f97316', color: 'white', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Get Deal</a>
                  </div>
                ))}
                <div style={{ textAlign: 'center', margin: '24px 0' }}>
                  <a href="https://www.ozvfy.com" style={{ display: 'inline-block', background: '#f97316', color: 'white', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>See All Deals</a>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>
                  You're receiving this because you subscribed to OzVFY.{' '}
                  <a href="https://www.ozvfy.com/unsubscribe" style={{ color: '#9ca3af' }}>Unsubscribe</a>
                </p>
              </div>
            </div>
          </div>
        ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Controls */}
          <div className="lg:w-72 flex-shrink-0 space-y-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Mock Data</h2>
              {([
                ['productName', 'Product Name'],
                ['oldPrice', 'Old Price ($)'],
                ['newPrice', 'New Price ($)'],
                ['discount', 'Discount (%)'],
                ['store', 'Store'],
                ['imageUrl', 'Image URL'],
                ['alertTarget', 'Alert Target ($)'],
              ] as [keyof MockData, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium block mb-1">{label}</label>
                  <input
                    className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={mock[key]}
                    onChange={e => setMock(m => ({ ...m, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Email preview (alert_triggered template)</p>

              {/* Rendered email */}
              <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <div style={{ background: '#f97316', padding: '20px 24px', textAlign: 'center' }}>
                  <p style={{ color: 'white', fontSize: 28, margin: 0 }}>🔔</p>
                  <h1 style={{ color: 'white', margin: '8px 0 0', fontSize: 20 }}>Price Drop Alert!</h1>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                  <p style={{ color: '#374151', marginBottom: 20 }}>
                    Good news! A product you're watching has dropped in price.
                  </p>

                  {/* Product card */}
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                    {mock.imageUrl && (
                      <div style={{ textAlign: 'center', background: '#f9fafb', padding: 16 }}>
                        <img src={mock.imageUrl} alt={mock.productName}
                          style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                      </div>
                    )}
                    <div style={{ padding: 16 }}>
                      <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 4px', fontSize: 15, lineHeight: 1.4 }}>
                        {mock.productName}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 12px' }}>{mock.store}</p>

                      {parseFloat(dropPercent) > 0 && (
                        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 6, padding: '10px 12px', marginBottom: 12 }}>
                          <p style={{ color: '#065f46', fontWeight: 700, margin: 0, fontSize: 14 }}>
                            ↓ Price dropped {dropPercent}% since you set your alert
                          </p>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: '#f97316' }}>${mock.newPrice}</span>
                        {mock.oldPrice && (
                          <span style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>${mock.oldPrice}</span>
                        )}
                        {parseFloat(mock.discount) > 0 && (
                          <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                            -{parseFloat(mock.discount).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      <a href={dealUrl}
                        style={{ display: 'block', textAlign: 'center', background: '#f97316', color: 'white', padding: '14px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
                        Get Deal →
                      </a>
                    </div>
                  </div>

                  <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                    Your alert was set for a target price of ${mock.alertTarget}. This deal has now met or exceeded your target.
                  </p>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px', textAlign: 'center' }}>
                  <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>
                    You received this email because you set a price alert on{' '}
                    <a href="https://www.ozvfy.com" style={{ color: '#f97316' }}>OzVFY</a>.
                    <br />
                    <a href={unsubUrl} style={{ color: '#9ca3af' }}>Unsubscribe</a> from price alerts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
