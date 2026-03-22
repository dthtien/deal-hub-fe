import { next } from '@vercel/edge';

export const config = {
  matcher: [
    '/',
    '/deals/:id*',
    '/stores/:name*',
    '/brands/:name*',
    '/categories/:name*',
    '/coupons/:store*',
  ],
};

const BOT_AGENTS =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|discordbot|rogerbot|semrushbot|ahrefsbot/i;

const API_BASE = 'https://api.ozvfy.com';
const SITE_URL = 'https://www.ozvfy.com';

function isBot(req: Request): boolean {
  const ua = req.headers.get('user-agent') || '';
  return BOT_AGENTS.test(ua);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeJsonLd(str: string): string {
  return str.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/"/g, '\\"');
}

function buildHtml(meta: {
  title: string;
  description: string;
  image?: string;
  url: string;
  price?: string;
  brand?: string;
}): string {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const u = escapeHtml(meta.url);
  const img = meta.image ? escapeHtml(meta.image) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t}</title>
  <meta name="description" content="${d}" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:url" content="${u}" />
  <meta property="og:site_name" content="OzVFY" />
  <meta property="og:type" content="website" />
  ${img ? `<meta property="og:image" content="${img}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  ${img ? `<meta name="twitter:image" content="${img}" />` : ''}
  ${meta.price ? `<meta property="product:price:amount" content="${escapeHtml(meta.price)}" />
  <meta property="product:price:currency" content="AUD" />
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Product","name":"${escapeJsonLd(meta.title)}","description":"${escapeJsonLd(meta.description)}","image":"${escapeJsonLd(meta.image || '')}","brand":{"@type":"Brand","name":"${escapeJsonLd(meta.brand || '')}"},"offers":{"@type":"Offer","price":"${escapeJsonLd(meta.price)}","priceCurrency":"AUD","availability":"https://schema.org/InStock"}}
  </script>` : ''}
  <link rel="canonical" href="${u}" />
</head>
<body>
  <div id="root"></div>
  <noscript>This page requires JavaScript.</noscript>
</body>
</html>`;
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export default async function middleware(req: Request): Promise<Response> {
  if (!isBot(req)) return next();

  const url = new URL(req.url);
  const pathname = url.pathname;
  const canonicalUrl = `${SITE_URL}${pathname}`;

  try {
    // Deal page: /deals/:id
    const dealMatch = pathname.match(/^\/deals\/(\d+)/);
    if (dealMatch) {
      const id = dealMatch[1];
      const res = await fetch(`${API_BASE}/api/v1/deals/${id}`);
      if (res.ok) {
        const deal = await res.json();
        const discountText = deal.discount > 0 ? `${Math.round(deal.discount)}% Off ` : '';
        const wasText = deal.old_price > 0 ? ` (was $${deal.old_price})` : '';
        return htmlResponse(
          buildHtml({
            title: `${discountText}${deal.name} – $${deal.price}${wasText} | ${deal.store} | OzVFY`,
            description: `${discountText ? `Save ${discountText}on ` : ''}${deal.name} at ${deal.store}. Now only $${deal.price}${wasText}. Find the best Australian deals at OzVFY — updated daily.`,
            image: deal.image_url,
            url: canonicalUrl,
            price: String(deal.price),
            brand: deal.brand,
          }),
        );
      }
    }

    // Store page: /stores/:name
    const storeMatch = pathname.match(/^\/stores\/(.+)/);
    if (storeMatch) {
      const name = decodeURIComponent(storeMatch[1]);
      return htmlResponse(
        buildHtml({
          title: `${name} Deals & Sales | OzVFY`,
          description: `Browse the latest ${name} deals and discounts. Find the best prices from ${name} curated daily at OzVFY.`,
          url: canonicalUrl,
        }),
      );
    }

    // Brand page: /brands/:name
    const brandMatch = pathname.match(/^\/brands\/(.+)/);
    if (brandMatch) {
      const name = decodeURIComponent(brandMatch[1]);
      return htmlResponse(
        buildHtml({
          title: `${name} Deals & Discounts Australia | OzVFY`,
          description: `Find the best ${name} deals and discounts in Australia. Shop ${name} products at the lowest prices, curated daily at OzVFY.`,
          url: canonicalUrl,
        }),
      );
    }

    // Category page: /categories/:name
    const catMatch = pathname.match(/^\/categories\/(.+)/);
    if (catMatch) {
      const name = decodeURIComponent(catMatch[1]);
      return htmlResponse(
        buildHtml({
          title: `${name} Deals & Sales Australia | OzVFY`,
          description: `Shop the best ${name} deals in Australia. Hundreds of ${name} discounts curated daily from top Australian stores.`,
          url: canonicalUrl,
        }),
      );
    }

    // Coupon page: /coupons/:store
    const couponMatch = pathname.match(/^\/coupons\/(.+)/);
    if (couponMatch) {
      const name = decodeURIComponent(couponMatch[1]);
      return htmlResponse(
        buildHtml({
          title: `${name} Promo Codes & Discount Codes 2026 | OzVFY`,
          description: `Latest ${name} promo codes, discount codes and deals. Save money with verified ${name} coupons at OzVFY.`,
          url: canonicalUrl,
        }),
      );
    }

    // Homepage
    if (pathname === '/') {
      return htmlResponse(
        buildHtml({
          title:
            'OzVFY — Best Deals in Australia | Save on Fashion, Electronics & More',
          description:
            "Discover the best deals across Australia's top stores — ASOS, The Iconic, JB Hi-Fi, Kmart & more. Save big every day on fashion, electronics and lifestyle.",
          url: canonicalUrl,
          image: `${SITE_URL}/logo.png`,
        }),
      );
    }
  } catch {
    // On error, fall through to normal React app
  }

  return next();
}
