import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import Deals from './components/Deals'
import Insurances from './components/Insurances'
import NewQuote from './components/Quotes/New'
import TermsAndConditions from './components/TermsAndConditions'
import QuoteShow from './components/Quotes/Show'
import MenuBar from './components/MenuBar'
import CarsCheck from './components/cars/Check'

function App() {
  return (
    <>
      <div className="w-full container mx-auto pt-2">
        <MenuBar />
        <Routes>
          <Route path="/" element={<Deals />} />
          <Route path="/insurances" element={<Insurances />} />
          <Route path="/quotes/new" element={<NewQuote />} />
          <Route path="/quotes/:id" element={<QuoteShow />} />
          <Route path="cars/check" element={<CarsCheck />} />
          <Route path="/terms_and_conditions" element={<TermsAndConditions />} />
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
