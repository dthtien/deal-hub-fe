import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
const StoreComparePage = lazy(() => import('./components/StoreComparePage'))
import ActivityFeedPage from './components/ActivityFeedPage'
import Footer from './components/Footer'
import Deals from './components/Deals'
import Insurances from './components/Insurances'
import NewQuote from './components/Quotes/New'
import TermsAndConditions from './components/TermsAndConditions'
import QuoteShow from './components/Quotes/Show'
import MenuBar from './components/MenuBar'
import CarsCheck from './components/cars/Check'
import DealShow from './components/Deals/Show'
import SavedDealsPage from './components/SavedDealsPage'
import StorePage from './components/StorePage'
import CategoryPage from './components/CategoryPage'
import BrandPage from './components/BrandPage'
const DealCompare = lazy(() => import('./components/DealCompare'))
import CompareBar from './components/CompareBar'
import NewsletterPopup from './components/NewsletterPopup'
import SubscribePage from './components/SubscribePage'
import UnsubscribePage from './components/UnsubscribePage'
import SubmitDealPage from './components/SubmitDealPage'
import SaleCalendarPage from './components/SaleCalendarPage'
import CouponsPage from './components/CouponsPage'
import CouponStorePage from './components/CouponStorePage'
import DealsUnderPage from './components/DealsUnderPage'
import DealsUnderIndexPage from './components/DealsUnderIndexPage'
import LeaderboardPage from './components/LeaderboardPage'
import StoresDirectoryPage from './components/StoresDirectoryPage'
import PriceDropLeaderboardPage from './components/PriceDropLeaderboardPage'
import NotificationsPage from './components/NotificationsPage'
import NotificationPrefsPage from './components/NotificationPrefsPage'
import SearchLandingPage from './components/SearchLandingPage'
import NewDealsPage from './components/NewDealsPage'
import WeeklyDealsPage from './components/WeeklyDealsPage'
import BestDropsPage from './components/BestDropsPage'
import PastDealsOfDayPage from './components/PastDealsOfDayPage'
import ExpiringPage from './components/ExpiringPage'
import AboutPage from './components/AboutPage'
import EmailPreviewPage from './components/EmailPreviewPage'
import CrawlerHealthPage from './components/CrawlerHealthPage'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import SitemapPage from './components/SitemapPage'
import NotFoundPage from './components/NotFoundPage'
import GiftGuidePage from './components/GiftGuidePage'
import ServerErrorPage from './components/ServerErrorPage'
import CookieConsent from './components/CookieConsent'
import PriceTrackerWidget from './components/PriceTrackerWidget'
import ProfilePage from './components/ProfilePage'
import CollectionsPage from './components/CollectionsPage'
import CollectionDetailPage from './components/CollectionDetailPage'
import SearchHistoryPage from './components/SearchHistoryPage'
const AdvancedSearchPage = lazy(() => import('./components/AdvancedSearchPage'))
import FlashDealsPage from './components/FlashDealsPage'
import HighQualityPage from './components/HighQualityPage'
import DealsNearMePage from './components/DealsNearMePage'
import DealsMapPage from './components/DealsMapPage'
import ToastContainer from './components/Toast'
import InstallPrompt from './components/InstallPrompt'
import BottomNav from './components/BottomNav'
import BackToTop from './components/BackToTop'
import { AuthProvider } from './context/AuthContext'
import { CompareProvider } from './context/CompareContext'
import { DarkModeProvider } from './context/DarkModeContext'
import { ToastProvider } from './context/ToastContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import KeyboardShortcutsModal, { KeyboardShortcutsButton } from './components/KeyboardShortcutsModal'
import BundlesPage from './components/BundlesPage'
import PreferencesPage from './components/PreferencesPage'
import TrendingTicker from './components/TrendingTicker'
import SeasonalBanner from './components/SeasonalBanner'
import CategoryAlertsPage from './components/CategoryAlertsPage'

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    if (!document.title || document.title === 'OzVFY') {
      document.title = 'OzVFY — Best Deals in Australia';
    }
  }, [location]);
  return null;
}

function AppInner() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useKeyboardShortcuts();
  return (
    <DarkModeProvider>
    <AuthProvider>
      <ToastProvider>
      <CompareProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <TitleUpdater />
          <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
          <KeyboardShortcutsButton onClick={() => setShortcutsOpen(true)} />
          <MenuBar />
          <TrendingTicker />
          <main role="main" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <SeasonalBanner />
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Deals />} />
              <Route path="/deals/:id" element={<DealShow />} />
              <Route path="/insurances" element={<Insurances />} />
              <Route path="/quotes/new" element={<NewQuote />} />
              <Route path="/quotes/:id" element={<QuoteShow />} />
              <Route path="cars/check" element={<CarsCheck />} />
              <Route path="/terms_and_conditions" element={<TermsAndConditions />} />
              <Route path="/saved" element={<SavedDealsPage />} />
              <Route path="/stores/compare" element={<Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>}><StoreComparePage /></Suspense>} />
              <Route path="/stores/:name" element={<StorePage />} />
              <Route path="/categories/:name" element={<CategoryPage />} />
              <Route path="/brands/:name" element={<BrandPage />} />
              <Route path="/compare" element={<Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>}><DealCompare /></Suspense>} />
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
              <Route path="/deals/near-me" element={<DealsNearMePage />} />
              <Route path="/deals/map" element={<DealsMapPage />} />
              <Route path="/deals/new" element={<NewDealsPage />} />
              <Route path="/deals/this-week" element={<WeeklyDealsPage />} />
              <Route path="/deals/verified" element={<HighQualityPage />} />
              <Route path="/best-drops" element={<BestDropsPage />} />
              <Route path="/deals/expiring" element={<ExpiringPage />} />
              <Route path="/stores" element={<StoresDirectoryPage />} />
              <Route path="/leaderboard/price-drops" element={<PriceDropLeaderboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notifications/preferences" element={<NotificationPrefsPage />} />
              <Route path="/alerts/categories" element={<CategoryAlertsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/email-preview" element={<EmailPreviewPage />} />
              <Route path="/admin/email-preview" element={<EmailPreviewPage />} />
              <Route path="/admin/crawler-health" element={<CrawlerHealthPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:slug" element={<CollectionDetailPage />} />
              <Route path="/search-history" element={<SearchHistoryPage />} />
              <Route path="/search" element={<Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>}><AdvancedSearchPage /></Suspense>} />
              <Route path="/activity" element={<ActivityFeedPage />} />
              <Route path="/gift-guide" element={<GiftGuidePage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
          <CompareBar />
          <NewsletterPopup />
          <BackToTop />
          <BottomNav />
          <CookieConsent />
          <PriceTrackerWidget />
          <InstallPrompt />
          <ToastContainer />
        </div>
      </CompareProvider>
      </ToastProvider>
    </AuthProvider>
    </DarkModeProvider>
  )
}

function App() {
  return <AppInner />;
}

export default App
