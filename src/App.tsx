import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import StoreComparePage from './components/StoreComparePage'
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
import DealCompare from './components/DealCompare'
import CompareBar from './components/CompareBar'
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
import SearchLandingPage from './components/SearchLandingPage'
import NewDealsPage from './components/NewDealsPage'
import WeeklyDealsPage from './components/WeeklyDealsPage'
import BestDropsPage from './components/BestDropsPage'
import ExpiringPage from './components/ExpiringPage'
import AboutPage from './components/AboutPage'
import EmailPreviewPage from './components/EmailPreviewPage'
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
import AdvancedSearchPage from './components/AdvancedSearchPage'
import FlashDealsPage from './components/FlashDealsPage'
import DealsNearMePage from './components/DealsNearMePage'
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
  useKeyboardShortcuts(() => setShortcutsOpen(true));
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
          <main role="main" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
              <Route path="/stores/:name" element={<StorePage />} />
              <Route path="/categories/:name" element={<CategoryPage />} />
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
              <Route path="/deals/bundles" element={<BundlesPage />} />
              <Route path="/deals/near-me" element={<DealsNearMePage />} />
              <Route path="/deals/new" element={<NewDealsPage />} />
              <Route path="/deals/this-week" element={<WeeklyDealsPage />} />
              <Route path="/best-drops" element={<BestDropsPage />} />
              <Route path="/deals/expiring" element={<ExpiringPage />} />
              <Route path="/stores" element={<StoresDirectoryPage />} />
              <Route path="/leaderboard/price-drops" element={<PriceDropLeaderboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/email-preview" element={<EmailPreviewPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:slug" element={<CollectionDetailPage />} />
              <Route path="/search-history" element={<SearchHistoryPage />} />
              <Route path="/search" element={<AdvancedSearchPage />} />
              <Route path="/stores/compare" element={<StoreComparePage />} />
              <Route path="/activity" element={<ActivityFeedPage />} />
              <Route path="/gift-guide" element={<GiftGuidePage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
          <CompareBar />
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
