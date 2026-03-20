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
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
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
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
