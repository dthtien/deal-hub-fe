import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import Deals from './components/Deals'
import Insurances from './components/Insurances'
import NewQuote from './components/Quotes/New'

function App() {
  return (
    <div className="w-full container mx-auto pt-2">
      <Routes>
        <Route path="/" element={<Deals />} />
        <Route path="/insurances" element={<Insurances />} />
        <Route path="/quotes/new" element={<NewQuote />} />
        <Route path="/quotes" element={<h1> Quotes </h1>} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
// {
// policy_start_date: '2024-07-01',
                     // current_insurer: 'AAMI',
                     // state: 'VIC',
                     // suburb: 'Ardeer',
                     // postcode: '3022',
                     // address_line1: '78 Esmond Street',
                     // plate: 'ZZB619',
                     // financed: false,
                     // cover_type: 'comprehensive',
                     // modified: false,
                     // primary_usage: 'private',
                    // km_per_year: 4000
                    // parking: {
            // type: 'garage',
                  // indicator: 'same_suburb'
                      // },
                     // days_wfh: '1_to_2',
                     // peak_hour_driving: false,
              // driver: {
              // date_of_birth: '1990-09-01',
               // gender: 'male',
               // first_name: 'John',
               // last_name: 'Doe',
               // email: 'test@gmail',
               // phone_number: '0412345678',
               // employment_status: 'full_time',
               // licence_age: 25
                     // },
          // driver_option: 'drivers_21',
// }
      // USE_TYPES = {
        // 'private' => 'PRIVATE_AND_COMMUTING_TO_WORK',
        // 'ridesharing' => 'PRIVATE_BUSINESS',
        // 'business' => 'BUSINESS_ONLY'
      // }.freeze
      // PARKING_TYPES = {
        // 'garage' => 'GARAGED',
        // 'car_park' => 'CAR_PARK',
        // 'street' => 'STREET',
        // 'parking_lot' => 'PARKING_LOT',
        // 'driveway' => 'DRIVEWAY',
      // }.freeze
      // DAY_WFH_TYPES = {
        // '0' => '0 Days',
        // '1_to_2' => '1 - 2 Days',
        // '3_to_4' => '3 - 4 Days',
        // '5_plus' => '5+ Days',
        // 'none' => "I don't work or study"
      // }
      // DRIVER_OPTIONS = {
        // 'drivers_21' => 'DRIVERS_21_AND_OVER',
        // 'drivers_25' => 'DRIVERS_25_AND_OVER',
        // 'none' => 'NO_RESTRICTION'
      // }.freeze
