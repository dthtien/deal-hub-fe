import { Route, Routes } from 'react-router-dom'
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
import { AuthProvider } from './context/AuthContext'
import { CompareProvider } from './context/CompareContext'
import { DarkModeProvider } from './context/DarkModeContext'

function App() {
  return (
    <DarkModeProvider>
    <AuthProvider>
      <CompareProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <MenuBar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/submit" element={<SubmitDealPage />} />
              <Route path="/sales-calendar" element={<SaleCalendarPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/coupons/:store" element={<CouponStorePage />} />
              <Route path="/deals-under-:maxPrice" element={<DealsUnderPage />} />
            </Routes>
          </main>
          <Footer />
          <CompareBar />
        </div>
      </CompareProvider>
    </AuthProvider>
    </DarkModeProvider>
  )
}

export default App
