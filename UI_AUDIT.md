# OzVFY UI/UX Design Audit

**Auditor:** Senior UI/UX Design Agent  
**Date:** 2026-03-27  
**Stack:** React + Vite + Tailwind CSS v3  
**Site:** https://www.ozvfy.com  
**Audience:** Australian bargain hunters  

---

## Executive Summary

OzVFY has a solid foundation — a consistent orange brand identity, a logical information architecture, and good dark mode coverage. The main issues are **information overload before the deal list** (too many sections pushing deals below the fold), **badge clutter on deal cards**, **missing keyboard accessibility (focus rings)**, and a few missed performance opportunities. The homepage is ambitious but risks overwhelming users before they get to browse.

---

## Dimension Ratings

### 1. Visual Hierarchy — 7/10

**Strengths:**
- Clear page title with orange accent on "Australia"
- Large animated stats bar creates a strong first impression
- `text-4xl font-extrabold` price on deal detail page is appropriately dominant
- Orange header gradient immediately communicates brand

**Weaknesses:**
- The listing page stacks 6+ promotional sections (HotDeals, DealOfTheDay, DealOfTheWeek, Trending, PersonalisedFeed, RecentlyViewed) before the searchable deal list. Users who want to browse/search must scroll past ~800px of content.
- Section headings (`text-lg font-bold`) all have the same visual weight — no clear "primary" vs "secondary" sections

**Fix:**
```jsx
// Collapse secondary sections behind a "More featured deals" toggle, 
// or move HotDeals to a sidebar on desktop:
<aside className="hidden lg:block w-64 flex-shrink-0">
  <HotDeals />
</aside>
```

---

### 2. Deal Card Design — 6/10

**Strengths:**
- Horizontal card layout allows a reasonable amount of info per card
- Discount badge (red `-X%`) overlaid on the image is a common and effective pattern
- Multiple status badges (New, Today, Best, Drop, Bundle, Hot) communicate deal quality

**Weaknesses:**
- **Badge overload**: Up to 6 badges can appear simultaneously on a single card (top-left, top-right, bottom-left, bottom-right, plus inline price badges). This creates visual noise.
- **Price was too small** at `text-xl` — for a deals site, price is the primary CTA-adjacent element and should dominate. **(Fixed: now `text-2xl font-extrabold text-orange-600`)**
- The IIFE pattern for rendering age badges (`{!deal.expired && (() => { ... })()}`) produces hard-to-maintain conditional rendering
- Compact mode (`compact=true`) hides tags and categories, making cards in that mode feel generic

**Fix — Badge priority system:**
```tsx
// Show max 2 badges. Priority: Expired > Featured > New > Best > Discount
const primaryBadge = deal.expired ? 'expired' :
  deal.featured ? 'featured' :
  hoursAgo < 6 ? 'new' : null;

const secondaryBadge = !deal.expired && deal.best_deal ? 'best' :
  deal.discount ? 'discount' : null;
```

---

### 3. Navigation UX — 7/10

**Strengths:**
- Store strip with popular stores immediately visible below header
- Category chips on homepage provide quick discovery
- Breadcrumb on deal detail page gives context
- "Explore More" section on deal detail excellent for internal linking

**Weaknesses:**
- **No search bar in the nav/header** — the search field is buried below HotDeals, DealOfTheDay, etc. on the listing page. For a deals aggregator, search should be in the header or visible on load.
- Store strip is orange-on-orange-gradient — text has moderate contrast (white/80 opacity on dark-ish orange). Would benefit from a subtle background change on active store.
- Mobile menu is very sparse: only "Log in / Sign up" and "Saved Deals" — no quick links to categories or popular stores.

**Fix — Add search to header:**
```tsx
// In MenuBar.tsx, add between logo and right actions:
<div className="hidden sm:flex flex-1 max-w-md mx-4">
  <input
    type="search"
    placeholder="Search deals..."
    className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/60 
               border border-white/30 focus:outline-none focus:bg-white/30 text-sm"
    onKeyDown={e => e.key === 'Enter' && navigate(`/?query=${e.currentTarget.value}`)}
  />
</div>
```

---

### 4. Mobile Responsiveness — 6/10

**Strengths:**
- `flex-1` on "Get Deal" button stretches to full width on mobile — good tap target
- Image/content split in deal cards adapts (`w-40 sm:w-48`)
- Scrollable horizontal sections (HotDeals, similar deals) work well on mobile

**Weaknesses:**
- Deal cards in list mode are `flex` rows — on small screens (375px), the image side (`w-40` = 160px) takes up 43% of the card width, leaving only ~215px for title, price, badges, and 4 action buttons. Very cramped.
- Action buttons in deal cards: 5 buttons (`Get Deal` + Bell + Compare + Share + Vote) crammed into one row — on 375px screens these will overflow or the vote buttons may be cut off.
- The filter bar uses `flex-wrap` which is good, but the State dropdown + Sort could stack oddly on smaller phones.
- Hot Deals horizontal scroll cards (`w-44`) are a good size for mobile.

**Fix — Grid layout for mobile deal cards:**
```tsx
// Consider switching to a 2-column grid on mobile for compact cards:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
  {deals.map(deal => <Item key={deal.id} deal={deal} compact={isMobile} ... />)}
</div>
```

---

### 5. Dark Mode Quality — 7/10

**Strengths:**
- Consistent `dark:bg-gray-900 dark:bg-gray-800` card backgrounds
- Dark mode toggle in header, state persisted
- `dark:border-gray-700/800` borders properly soften in dark mode
- Smooth transition via `*, *::before, *::after { transition: background-color 0.2s ... }`

**Weaknesses:**
- The global transition on all elements can cause jarring flashes on page load for users who prefer dark mode (system preference), as the page flashes light then transitions to dark.
- Some `bg-emerald-50`, `bg-rose-50`, `bg-orange-50` tinted backgrounds lack dark equivalents (e.g., category tags in Item.tsx hover: `hover:bg-orange-100` has no `dark:hover:bg-orange-900/20`)
- The footer's email subscribe form background isn't explicitly dark-mode-coded (checked from patterns)

**Fix — Prevent flash on load:**
```html
<!-- In index.html, before React loads: -->
<script>
  if (localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

---

### 6. Color Usage — 7/10

**Strengths:**
- Orange-500/600 consistently used as primary brand color
- Rose-500 for discount/expired badges — clear danger/alert meaning
- Emerald-500 for "good" indicators (price drops, new deals)
- Amber-400 for "best deal" — appropriate warm tone

**Weaknesses:**
- Orange-400 used for "X days ago" badge but orange-500 for "Featured" — inconsistent orange shades signal different things
- The header gradient (`from-orange-500 to-red-500`) plus the store strip (`from-orange-600 to-red-600`) creates two slightly different orange-to-red bands — feels slightly muddy side by side
- Category hover colors in deal cards: `hover:bg-orange-100 hover:text-orange-600` but no `dark:hover:bg-orange-900/20 dark:hover:text-orange-400`

**Fix:**
```tsx
// Standardize category button hover:
className="... hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
```

---

### 7. Typography — 7/10

**Strengths:**
- Font hierarchy is logical: `text-3xl/4xl font-extrabold` for h1, `text-xl font-bold` for section headings, `text-sm` for card titles
- `line-clamp-2` on card titles prevents layout breakage
- `leading-snug` on titles appropriate for deal names (can be long)

**Weaknesses:**
- Card title is `text-sm font-semibold` — for a deals site where the product name is crucial, this may be too small, especially for users in 60+ demographic
- No custom font configured in `tailwind.config.js` — using system fonts which vary widely across OS (Georgia on Safari, Roboto on Android, etc.)
- Section labels ("Community verdict", "Share or compare") use `text-xs font-bold text-gray-400 uppercase tracking-wide` — this style is used for many labels, making them all feel equal weight

**Fix — Consider adding Inter:**
```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
},
```

---

### 8. Whitespace & Density — 5/10

**Strengths:**
- Deal cards have `p-4` padding, comfortable for content
- `gap-3` between cards provides breathing room
- Deal detail page has well-spaced sections with `mb-3` between cards

**Weaknesses:**
- **Major issue**: The homepage stacks HotDeals + DealOfTheDay + DealOfTheWeek + Trending + PersonalisedFeed + RecentlyViewed + HeroStatsBar + TrendingCategories + FilterBar before any browseable deals. This is ~1,500–2,000px of content above the deal list. Users have to scroll aggressively.
- The HotDeals section alone is `mb-8` and shows 8 cards. Combined with DealOfTheDay and DealOfTheWeek, this means 10+ deals are shown in "promo" sections before the "main" list, which is confusing — are these separate?
- The store strip + nav together create a very tall header band on desktop (~100px), with the inner nav at 64px and the store strip at ~44px.

**Fix:**
Limit the homepage to ONE featured section above the filter bar:
```tsx
// Keep only HotDeals (or DealOfTheDay) above the fold
// Move the rest to a "Featured" sidebar or collapse them:
<HotDeals />
{/* Move DealOfTheDay, DealOfTheWeek, Trending below the filter/list */}
```

---

### 9. CTAs — 8/10

**Strengths:**
- "Get Deal" button is orange-500, full-width on mobile (via `flex-1`), has a shopping bag icon
- On deal detail, the CTA is `py-4` (large touch target), `w-full`, bold, has store name ("Get this deal at {store}")
- "Alert me when price drops" as a secondary CTA is a great conversion tool
- Disabled state handled with `disabled:opacity-50`

**Weaknesses:**
- **No focus rings** on the "Get Deal" button — keyboard/screen reader users can't tell where focus is. **(Fixed: added `focus-visible:ring-2 focus-visible:ring-orange-400`)**
- The "Alert me" CTA button on the detail page is styled as a secondary outline button — fine, but visually it competes with the share/compare/print buttons below which are similarly outlined
- On deal cards, the "Get Deal" button is `px-5 py-2` which is fine on desktop but on mobile where it's `flex-1`, it's fine too. However with 4 other icon buttons next to it, the visual weight is diluted.

---

### 10. Trust Signals — 6/10

**Strengths:**
- Affiliate disclosure banner on deal detail page — transparent and dismissable
- Vote buttons (upvote/downvote) with counts add social proof
- "X people viewed" counter for popular deals
- Price history chart shows transparency about price trends
- "Best price in 90 days" badge on deal cards/detail

**Weaknesses:**
- No user reviews or star ratings visible
- No "Last verified" date prominently shown (only the small date at bottom of detail page)
- The site has no visible SSL badge, trust badges, or "Australian owned" signals in the header or footer that reassure first-time visitors
- Deal age indicators ("3d ago") suggest some deals may be stale — there should be a "verified today" badge for fresh deals

**Fix:**
```tsx
// Add an "AU" trust badge to the footer or header:
<div className="flex items-center gap-1.5 text-xs text-white/70">
  <span>🇦🇺</span> <span>Australian deals, updated daily</span>
</div>
```

---

### 11. Performance Hints — 7/10

**Strengths:**
- `LazyImage` component used throughout deal cards and HotDeals
- Infinite scroll pagination avoids loading all deals at once
- Metadata fetched separately from deals for independent caching
- `similar` deals fetched lazily only after main deal loads

**Weaknesses:**
- **Deal show main image** had no `loading="lazy"` — **(Fixed: added `loading="lazy"`)**
- Similar deals images also lacked `loading="lazy"` — **(Fixed)**
- No `srcSet` or responsive images — all images loaded at their native size
- The global CSS transition `*, *::before, *::after { transition: ... }` applies to ALL elements including SVGs and spans — this is expensive for browsers to handle on scroll-heavy pages
- No route-level code splitting (all routes imported directly in App.tsx)

**Fix — Route-level splitting:**
```tsx
// In App.tsx, use React.lazy:
const DealShow = React.lazy(() => import('./components/Deals/Show'));
const CouponsPage = React.lazy(() => import('./components/CouponsPage'));
// Wrap Routes in <Suspense fallback={<div>Loading...</div>}>
```

---

### 12. Accessibility — 5/10

**Strengths:**
- `alt={deal.name}` passed to images
- `title` attributes on icon-only buttons (BellIcon, ScaleIcon)
- `aria-label` would benefit from being added but title is a fallback
- Error boundary on DealShow prevents full-page crashes

**Weaknesses:**
- **No focus rings on interactive elements** — the global CSS transition suppresses default browser outlines without providing custom alternatives. **(Fixed: added `focus-visible:ring-2` to Get Deal buttons)**
- Icon-only action buttons (Bell, Compare, Share) use `title=""` but not `aria-label=""` — screen readers may not reliably read `title`
- No `aria-live` region for the deal count / loading state — screen reader users don't know when new deals load
- Color is used as the sole differentiator for some statuses (e.g., green = good deal, orange = ok deal) — users with color blindness can't distinguish without the emoji/text labels (which are present, so partially ok)
- `<button>` used as store filter with no `role` or accessible name beyond text content

**Fix:**
```tsx
// Replace title= with aria-label= on icon buttons:
<button aria-label="Set price alert" onClick={() => setShowAlert(true)} ...>
  <BellIcon className="w-4 h-4" />
</button>

<button aria-label={comparing ? 'Remove from compare' : 'Add to compare'} ...>
  <ScaleIcon className="w-4 h-4" />
</button>
```

---

## Top 10 Actionable Improvements (ordered by impact)

### #1 — Move Deal List Above the Fold (CRITICAL)
**Problem:** 6+ sections (HotDeals, DealOfTheDay, DealOfTheWeek, Trending, PersonalisedFeed, RecentlyViewed) appear before the searchable deal list. Users must scroll 1,500–2,000px before they can browse.

**Fix:**
```tsx
// In Deals/index.tsx, restructure:
<>
  <div className="py-8 mb-2">
    <h1>Best deals in <span className="text-orange-500">Australia</span></h1>
  </div>
  
  {/* FilterBar first — search is the primary intent */}
  <FilterBar ... />
  
  {/* ONE featured section — collapsed by default on mobile */}
  <details open className="mb-6 group">
    <summary className="cursor-pointer text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 select-none list-none flex items-center gap-2">
      <FireIcon className="w-4 h-4 text-orange-500" /> Featured picks
      <ChevronDownIcon className="w-4 h-4 group-open:rotate-180 transition-transform" />
    </summary>
    <HotDeals />
  </details>
  
  {/* Deal list immediately after */}
  <List ... />
</>
```

**Expected impact:** +20–35% engagement with deal list. Users who come to browse/search find content immediately.

---

### #2 — Add Search Bar to Navigation Header
**Problem:** The search field is buried below promotional content. Search is the #1 intent for returning users.

**Fix (MenuBar.tsx):**
```tsx
{/* Add after logo, before right actions: */}
<div className="hidden sm:flex flex-1 max-w-sm mx-4">
  <form onSubmit={e => { e.preventDefault(); navigate(`/?query=${(e.currentTarget.elements[0] as HTMLInputElement).value}`); }}
    className="w-full relative">
    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
    <input
      type="search"
      placeholder="Search deals..."
      className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/60
                 border border-white/30 focus:outline-none focus:bg-white/30 text-sm"
    />
  </form>
</div>
```

**Expected impact:** +15–25% search usage, reduced friction for returning users.

---

### #3 — Fix Badge Overload on Deal Cards
**Problem:** Cards can display up to 6 simultaneous overlapping badges in the image area (discount, expired, featured, new/today/Xd-ago, best, bundle, drop). This creates visual noise and dilutes each badge's impact.

**Fix (Item.tsx):** Implement a badge priority system:
```tsx
// Primary badge (top-left): only most important state
const primaryBadge = deal.expired ? (
  <span className="...bg-gray-500">Expired</span>
) : hasDiscount ? (
  <span className="...bg-rose-500">-{deal.discount}%</span>
) : null;

// Secondary badge (top-right): only one
const hoursAgo = (Date.now() - new Date(deal.created_at).getTime()) / 36e5;
const secondaryBadge = deal.featured ? (
  <span className="...bg-orange-500">★ Featured</span>
) : hoursAgo < 6 ? (
  <span className="...bg-emerald-500">🆕 New</span>
) : deal.best_deal ? (
  <span className="...bg-amber-400">🏆 Best</span>
) : null;

// Remove bottom badges — move deal_score/price_trend to the price row below
```

**Expected impact:** Cleaner card design, each badge has more impact, reduced cognitive load.

---

### #4 — Keyboard Accessibility: Focus Rings on All Interactive Elements
**Problem:** No visible focus rings on any buttons, links, or inputs. Keyboard users and screen reader users cannot navigate the site. **(Partially fixed: Get Deal buttons now have `focus-visible:ring-2`)**

**Fix — Add to all action buttons:**
```tsx
// Reusable class string:
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900';

// Apply to all <button> and <Link> components
// Also add to inputs in FilterBar:
<input className="... focus:ring-2 focus:ring-orange-400 focus:outline-none" />
```

**Expected impact:** WCAG 2.1 AA compliance for keyboard navigation. Reduces legal risk, improves usability for power users.

---

### #5 — Add Icon-Only Button aria-labels
**Problem:** The Bell (price alert), Scale (compare), Share buttons in deal cards only have `title=""` attributes, which are not reliable for screen readers.

**Fix (Item.tsx):**
```tsx
<button
  onClick={() => setShowAlert(true)}
  aria-label="Set price alert"
  title="Price alert"
  className="...">
  <BellIcon className="w-4 h-4" />
</button>

<button
  onClick={() => toggleCompare(deal.id)}
  aria-label={comparing ? 'Remove from compare' : 'Add to compare (max 3)'}
  title={comparing ? 'Remove from compare' : 'Add to compare'}
  ...>
  <ScaleIcon className="w-4 h-4" />
</button>
```

**Expected impact:** Screen reader usability, WCAG compliance.

---

### #6 — Lazy-load Route Components (Code Splitting)
**Problem:** All 35+ route components are eagerly imported in App.tsx, meaning users must download JavaScript for every page regardless of which route they visit.

**Fix (App.tsx):**
```tsx
import { lazy, Suspense } from 'react';
const DealShow = lazy(() => import('./components/Deals/Show'));
const CouponsPage = lazy(() => import('./components/CouponsPage'));
const SaleCalendarPage = lazy(() => import('./components/SaleCalendarPage'));
// ... etc for all non-critical routes

// Wrap Routes:
<Suspense fallback={<div className="flex-1 flex items-center justify-center py-20">
  <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
</div>}>
  <Routes>...</Routes>
</Suspense>
```

**Expected impact:** 30–50% reduction in initial JS bundle size. Faster first load for new users.

---

### #7 — Fix Dark Mode Flash on Page Load
**Problem:** Users with system dark mode preference see a flash of light content before DarkModeContext loads and applies the `dark` class.

**Fix (index.html):**
```html
<head>
  <!-- Add BEFORE other scripts: -->
  <script>
    try {
      const stored = localStorage.getItem('darkMode');
      if (stored === 'true' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  </script>
</head>
```

**Expected impact:** Eliminates jarring flash for dark mode users. Professional feel.

---

### #8 — Mobile Action Button Overflow in Deal Cards
**Problem:** 5 action elements in the card footer (`Get Deal` + Bell + Compare + Share + VoteButtons) can overflow on small screens (375px). VoteButtons is a component with up/down controls, making this 6-7 interactive elements in one row.

**Fix (Item.tsx):**
```tsx
{/* Restructure actions: primary CTA full row, secondary icons below */}
<div className="flex flex-col gap-2 mt-3">
  <button onClick={handleGetDeal} ...>
    <ShoppingBagIcon className="w-4 h-4" />
    {isRedirecting ? 'Opening...' : 'Get Deal'}
  </button>
  <div className="flex items-center gap-2">
    <button aria-label="Set price alert" ...><BellIcon /></button>
    <button aria-label="Compare" ...><ScaleIcon /></button>
    <ShareDeal deal={deal} />
    <VoteButtons dealId={deal.id} compact />
  </div>
</div>
```

**Expected impact:** No overflow on 375px screens, cleaner visual hierarchy.

---

### #9 — "Deals Under $X" Nav Improvements
**Problem:** The `DealsUnderNav` component appears between the hero text and promotional sections. Its visual treatment is unclear from the code but budget-based navigation is a high-intent entry point that deserves prominent placement.

**Fix:** Add budget price filters directly to the FilterBar:
```tsx
// In FilterBar.tsx, add quick price filters:
const BUDGETS = ['$25', '$50', '$100', '$200'];
<div className="flex gap-2 mt-2">
  {BUDGETS.map(b => (
    <Link key={b} to={`/deals-under-${b.slice(1)}`}
      className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300
                 hover:border-orange-400 hover:text-orange-500 transition-colors">
      Under {b}
    </Link>
  ))}
</div>
```

**Expected impact:** Budget filtering is a high-intent feature that drives conversion.

---

### #10 — Add "Last Verified" Trust Badge to Deal Cards
**Problem:** Deals can become stale. The only date shown is a small `updated_at` text at the bottom of deal cards in light gray. Users have no confident sense of whether a deal is still active.

**Fix (Item.tsx):**
```tsx
{/* Show "Verified today" for deals updated in last 24h */}
{(() => {
  const updatedHoursAgo = (Date.now() - new Date(deal.updated_at).getTime()) / 36e5;
  if (updatedHoursAgo < 24) return (
    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
      ✓ Verified today
    </span>
  );
  return null;
})()}
```

**Expected impact:** Trust signal, reduces bounce rate from users unsure if deal is still valid.

---

## Implemented Quick Wins

The following 3 changes were implemented and committed:

### ✅ QW1: Larger, More Prominent Deal Card Price
**File:** `src/components/Deals/Item.tsx`  
**Change:** Price changed from `text-xl font-bold text-gray-900 dark:text-white` → `text-2xl font-extrabold text-orange-600 dark:text-orange-400`  
**Why:** On a deals site, price is the primary decision signal. Making it orange and larger increases scannability significantly. The color also ties it to the brand while making the number pop against the white/dark card background.

### ✅ QW2: Focus-Visible Rings on Get Deal CTAs
**Files:** `src/components/Deals/Item.tsx`, `src/components/Deals/Show.tsx`  
**Change:** Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900` to both Get Deal buttons  
**Why:** Keyboard and screen reader users had no visible focus indicator. This uses `focus-visible` (not `focus`) so it only shows for keyboard navigation, not mouse clicks — no visual noise for mouse users.

### ✅ QW3: `loading="lazy"` on Deal Show Images
**File:** `src/components/Deals/Show.tsx`  
**Change:** Added `loading="lazy"` to the main product image and all similar deals images  
**Why:** The deal detail page's main image was loaded eagerly even when below the fold (e.g., if the page skeleton loads first). Lazy loading defers network requests until the image is near the viewport, improving Time to Interactive and reducing bandwidth for users who bounce before seeing the image.

---

## TypeScript Verification

```
$ cd /tmp/deal-hub-fe && npx tsc --noEmit
(no output — 0 errors)
```

All changes pass TypeScript strict checking.

---

## Brand & Design Principles to Maintain

1. **Orange-500** is the primary action color — keep it for CTAs, active states, and key highlights only. Overuse dilutes it.
2. **Dark mode first**: Any new component must include `dark:` variants for all background, border, and text colors.
3. **Australian feel**: AUD `$` prefix (already in use), AU states in FilterBar, en-AU locale for dates. Keep these.
4. **Rounded corners**: `rounded-xl` and `rounded-2xl` are used consistently — maintain this softness, it's distinctive.
5. **Tailwind v3 only**: No `gray-950`, `orange-950`, or `*-925` — use `/30`, `/20` opacity modifiers instead.

---

*Report generated by OzVFY Design Audit Agent — 2026-03-27*
