import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { useToast } from './context/ToastContext'

// Core components (not lazy - needed immediately)
import Footer from './components/Footer'
import Deals from './components/Deals'
import MenuBar from './components/MenuBar'
import DealShow from './components/Deals/Show'
import CompareBar from './components/CompareBar'
import NewsletterPopup from './components/NewsletterPopup'
import ToastContainer from './components/Toast'
import InstallPrompt from './components/InstallPrompt'
import BottomNav from './components/BottomNav'
import BackToTop from './components/BackToTop'
import CookieConsent from './components/CookieConsent'
import PerformanceWidget from './components/PerformanceWidget'
import TrendingTicker from './components/TrendingTicker'
import SeasonalBanner from './components/SeasonalBanner'
import NotFoundPage from './components/NotFoundPage'
import OnboardingModal from './components/OnboardingModal'

// Lazy-loaded heavy pages
const StoreComparePage      = lazy(() => import('./components/StoreComparePage'))
const DealCompare           = lazy(() => import('./components/DealCompare'))
const AdvancedSearchPage    = lazy(() => import('./components/AdvancedSearchPage'))
const LeaderboardPage           = lazy(() => import('./components/LeaderboardPage'))
const CategoryLeaderboardPage   = lazy(() => import('./components/CategoryLeaderboardPage'))
const SaleCalendarPage      = lazy(() => import('./components/SaleCalendarPage'))
const DealsMapPage          = lazy(() => import('./components/DealsMapPage'))
const ActivityFeedPage      = lazy(() => import('./components/ActivityFeedPage'))
const GiftGuidePage         = lazy(() => import('./components/GiftGuidePage'))
const HighQualityPage       = lazy(() => import('./components/HighQualityPage'))
const CategoryAlertsPage    = lazy(() => import('./components/CategoryAlertsPage'))
const Insurances            = lazy(() => import('./components/Insurances'))
const NewQuote              = lazy(() => import('./components/Quotes/New'))
const TermsAndConditions    = lazy(() => import('./components/TermsAndConditions'))
const QuoteShow             = lazy(() => import('./components/Quotes/Show'))
const CarsCheck             = lazy(() => import('./components/cars/Check'))
const SavedDealsPage        = lazy(() => import('./components/SavedDealsPage'))
const StorePage             = lazy(() => import('./components/StorePage'))
const CategoryPage          = lazy(() => import('./components/CategoryPage'))
const BrandPage             = lazy(() => import('./components/BrandPage'))
const BrandsIndexPage       = lazy(() => import('./components/BrandsIndexPage'))
const SubscribePage         = lazy(() => import('./components/SubscribePage'))
const UnsubscribePage       = lazy(() => import('./components/UnsubscribePage'))
const SubmitDealPage        = lazy(() => import('./components/SubmitDealPage'))
const CouponsPage           = lazy(() => import('./components/CouponsPage'))
const CouponStorePage       = lazy(() => import('./components/CouponStorePage'))
const DealsUnderPage        = lazy(() => import('./components/DealsUnderPage'))
const DealsUnderIndexPage   = lazy(() => import('./components/DealsUnderIndexPage'))
const StoresDirectoryPage   = lazy(() => import('./components/StoresDirectoryPage'))
const PriceDropLeaderboardPage = lazy(() => import('./components/PriceDropLeaderboardPage'))
const ShareLeaderboardPage     = lazy(() => import('./components/ShareLeaderboardPage'))
const NotificationsPage     = lazy(() => import('./components/NotificationsPage'))
const NotificationPrefsPage = lazy(() => import('./components/NotificationPrefsPage'))
const SearchLandingPage     = lazy(() => import('./components/SearchLandingPage'))
const NewDealsPage          = lazy(() => import('./components/NewDealsPage'))
const WeeklyDealsPage       = lazy(() => import('./components/WeeklyDealsPage'))
const BestDropsPage         = lazy(() => import('./components/BestDropsPage'))
const PastDealsOfDayPage    = lazy(() => import('./components/PastDealsOfDayPage'))
const ExpiringPage          = lazy(() => import('./components/ExpiringPage'))
const AboutPage             = lazy(() => import('./components/AboutPage'))
const EmailPreviewPage      = lazy(() => import('./components/EmailPreviewPage'))
const CrawlerHealthPage     = lazy(() => import('./components/CrawlerHealthPage'))
const PrivacyPolicyPage     = lazy(() => import('./components/PrivacyPolicyPage'))
const SitemapPage           = lazy(() => import('./components/SitemapPage'))
const ServerErrorPage       = lazy(() => import('./components/ServerErrorPage'))
const PriceTrackerWidget    = lazy(() => import('./components/PriceTrackerWidget'))
const ProfilePage           = lazy(() => import('./components/ProfilePage'))
const PricingPage           = lazy(() => import('./components/PricingPage'))
const CollectionsPage       = lazy(() => import('./components/CollectionsPage'))
const ABTestResultsPage     = lazy(() => import('./components/ABTestResultsPage'))
const CollectionDetailPage  = lazy(() => import('./components/CollectionDetailPage'))
const SearchHistoryPage     = lazy(() => import('./components/SearchHistoryPage'))
const FlashDealsPage        = lazy(() => import('./components/FlashDealsPage'))
const DealsNearMePage       = lazy(() => import('./components/DealsNearMePage'))
const BundlesPage           = lazy(() => import('./components/BundlesPage'))
const PreferencesPage       = lazy(() => import('./components/PreferencesPage'))
const PriceWatchPage        = lazy(() => import('./components/PriceWatchPage'))
const PopularPage           = lazy(() => import('./components/PopularPage'))
const DealPerformancePage   = lazy(() => import('./components/DealPerformancePage'))
const CouponGeneratorPage   = lazy(() => import('./components/CouponGeneratorPage'))
const PriceAlertHistoryPage = lazy(() => import('./components/PriceAlertHistoryPage'))
const CouponAnalyticsPage   = lazy(() => import('./components/CouponAnalyticsPage'))
const CommunityPicksPage    = lazy(() => import('./components/CommunityPicksPage'))
const RevenueEventsPage     = lazy(() => import('./components/RevenueEventsPage'))
const PersonalisedFeedPage  = lazy(() => import('./components/PersonalisedFeedPage'))
const AdminFunnelPage       = lazy(() => import('./components/AdminFunnelPage'))

import KeyboardShortcutsModal, { KeyboardShortcutsButton } from './components/KeyboardShortcutsModal'
import { AuthProvider } from './context/AuthContext'
import { CompareProvider } from './context/CompareContext'
import { DarkModeProvider } from './context/DarkModeContext'
import { ToastProvider } from './context/ToastContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

const Spinner = () => (
  <div className="flex justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
  </div>
);

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    if (!document.title || document.title === 'OzVFY') {
      document.title = 'OzVFY - Best Deals in Australia';
    }
  }, [location]);
  return null;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

function GlobalErrorHandler() {
  const { showToast } = useToast();

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason) || 'Unknown error';
      const stack = event.reason?.stack || '';

      if (import.meta.env.DEV) {
        console.error('[GlobalErrorHandler] Unhandled promise rejection:', message, stack);
      } else {
        fetch(`${API_BASE}/api/v1/errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            stack,
            url: window.location.href,
            user_agent: navigator.userAgent,
          }),
        }).catch(() => {});
      }

      showToast("Something went wrong. We're looking into it.", 'error');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [showToast]);

  return null;
}

function AppInner() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useKeyboardShortcuts({
    onShortcutsOpen: () => setShortcutsOpen(true),
    onNavigateNext: () => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>('[role="article"]'));
      if (cards.length === 0) return;
      const current = document.querySelector<HTMLElement>('[role="article"][data-selected="true"]');
      const idx = current ? cards.indexOf(current) : -1;
      const next = cards[Math.min(idx + 1, cards.length - 1)];
      if (current) current.removeAttribute('data-selected');
      next.setAttribute('data-selected', 'true');
      next.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      next.classList.add('ring-2', 'ring-orange-400');
      if (current) current.classList.remove('ring-2', 'ring-orange-400');
    },
    onNavigatePrev: () => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>('[role="article"]'));
      if (cards.length === 0) return;
      const current = document.querySelector<HTMLElement>('[role="article"][data-selected="true"]');
      const idx = current ? cards.indexOf(current) : cards.length;
      const prev = cards[Math.max(idx - 1, 0)];
      if (current) current.removeAttribute('data-selected');
      prev.setAttribute('data-selected', 'true');
      prev.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      prev.classList.add('ring-2', 'ring-orange-400');
      if (current) current.classList.remove('ring-2', 'ring-orange-400');
    },
    onOpenDeal: () => {
      const current = document.querySelector<HTMLAnchorElement>('[role="article"][data-selected="true"] a[href*="/deals/"]');
      current?.click();
    },
    onSaveDeal: () => {
      const current = document.querySelector<HTMLButtonElement>('[role="article"][data-selected="true"] [data-save-button]');
      current?.click();
    },
    onCompareDeal: () => {
      const current = document.querySelector<HTMLButtonElement>('[role="article"][data-selected="true"] [title="Compare"]');
      current?.click();
    },
  });
  return (
    <DarkModeProvider>
    <AuthProvider>
      <CurrencyProvider>
      <ToastProvider>
      <CompareProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <TitleUpdater />
          <GlobalErrorHandler />
          <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
          <KeyboardShortcutsButton onClick={() => setShortcutsOpen(true)} />
          <MenuBar />
          <TrendingTicker />
          <main role="main" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <SeasonalBanner />
            <ErrorBoundary>
            <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Deals />} />
              <Route path="/deals/:id" element={<DealShow />} />
              <Route path="/insurances" element={<Insurances />} />
              <Route path="/quotes/new" element={<NewQuote />} />
              <Route path="/quotes/:id" element={<QuoteShow />} />
              <Route path="cars/check" element={<CarsCheck />} />
              <Route path="/terms_and_conditions" element={<TermsAndConditions />} />
              <Route path="/saved" element={<SavedDealsPage />} />
              <Route path="/stores/compare" element={<StoreComparePage />} />
              <Route path="/stores/:name" element={<StorePage />} />
              <Route path="/categories/:name" element={<CategoryPage />} />
              <Route path="/brands" element={<BrandsIndexPage />} />
              <Route path="/brands/:name" element={<BrandPage />} />
              <Route path="/compare" element={<DealCompare />} />
              <Route path="/subscribe" element={<SubscribePage />} />
              <Route path="/subscribe/preferences" element={<PreferencesPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/submit" element={<SubmitDealPage />} />
              <Route path="/sales-calendar" element={<SaleCalendarPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/coupons/:store" element={<CouponStorePage />} />
              <Route path="/deals-under" element={<DealsUnderIndexPage />} />
              <Route path="/deals-under-:maxPrice" element={<DealsUnderPage />} />
              <Route path="/deals/search/:keyword" element={<SearchLandingPage />} />
              <Route path="/deals/flash" element={<FlashDealsPage />} />
              <Route path="/deals/past-deal-of-the-day" element={<PastDealsOfDayPage />} />
              <Route path="/deals/bundles" element={<BundlesPage />} />
              <Route path="/deals/price-watch" element={<PriceWatchPage />} />
              <Route path="/deals/near-me" element={<DealsNearMePage />} />
              <Route path="/deals/map" element={<DealsMapPage />} />
              <Route path="/deals/new" element={<NewDealsPage />} />
              <Route path="/deals/this-week" element={<WeeklyDealsPage />} />
              <Route path="/deals/verified" element={<HighQualityPage />} />
              <Route path="/best-drops" element={<BestDropsPage />} />
              <Route path="/deals/expiring" element={<ExpiringPage />} />
              <Route path="/stores" element={<StoresDirectoryPage />} />
              <Route path="/leaderboard/price-drops" element={<PriceDropLeaderboardPage />} />
              <Route path="/leaderboard/most-shared" element={<ShareLeaderboardPage />} />
              <Route path="/leaderboard/categories" element={<CategoryLeaderboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notifications/preferences" element={<NotificationPrefsPage />} />
              <Route path="/alerts/categories" element={<CategoryAlertsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/email-preview" element={<EmailPreviewPage />} />
              <Route path="/admin/email-preview" element={<EmailPreviewPage />} />
              <Route path="/admin/ab-tests" element={<ABTestResultsPage />} />
              <Route path="/admin/crawler-health" element={<CrawlerHealthPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:slug" element={<CollectionDetailPage />} />
              <Route path="/search-history" element={<SearchHistoryPage />} />
              <Route path="/search" element={<AdvancedSearchPage />} />
              <Route path="/activity" element={<ActivityFeedPage />} />
              <Route path="/gift-guide" element={<GiftGuidePage />} />
              <Route path="/deals/popular" element={<PopularPage />} />
              <Route path="/deals/community-picks" element={<CommunityPicksPage />} />
              <Route path="/admin/deals/performance" element={<DealPerformancePage />} />
              <Route path="/admin/coupons/generate" element={<CouponGeneratorPage />} />
              <Route path="/alerts/history" element={<PriceAlertHistoryPage />} />
              <Route path="/admin/analytics/coupons" element={<CouponAnalyticsPage />} />
              <Route path="/admin/revenue" element={<RevenueEventsPage />} />
              <Route path="/feed" element={<PersonalisedFeedPage />} />
              <Route path="/admin/analytics/funnel" element={<AdminFunnelPage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
          <CompareBar />
          <NewsletterPopup />
          <BackToTop />
          <BottomNav />
          <CookieConsent />
          <Suspense fallback={null}>
            <PriceTrackerWidget />
          </Suspense>
          <InstallPrompt />
          <OnboardingModal />
          <ToastContainer />
          <PerformanceWidget />
        </div>
      </CompareProvider>
      </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
    </DarkModeProvider>
  )
}

function App() {
  return <AppInner />;
}

export default App
