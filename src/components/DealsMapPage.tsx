import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const STATE_DEALS: Record<string, number> = {
  NSW: 450,
  VIC: 380,
  QLD: 290,
  WA: 180,
  SA: 120,
  TAS: 50,
  ACT: 40,
  NT: 30,
}

interface StateShape {
  id: string
  label: string
  labelX: number
  labelY: number
  path: string
  cx: number
  cy: number
}

const STATES: StateShape[] = [
  {
    id: 'WA',
    label: 'WA',
    labelX: 145,
    labelY: 290,
    cx: 145,
    cy: 290,
    path: 'M 10 80 L 10 480 L 295 480 L 295 295 L 245 260 L 245 80 Z',
  },
  {
    id: 'NT',
    label: 'NT',
    labelX: 370,
    labelY: 190,
    cx: 370,
    cy: 190,
    path: 'M 295 80 L 295 295 L 455 295 L 455 80 Z',
  },
  {
    id: 'SA',
    label: 'SA',
    labelX: 390,
    labelY: 360,
    cx: 390,
    cy: 360,
    path: 'M 295 295 L 295 480 L 490 480 L 490 340 L 455 295 Z',
  },
  {
    id: 'QLD',
    label: 'QLD',
    labelX: 530,
    labelY: 190,
    cx: 530,
    cy: 190,
    path: 'M 455 80 L 455 295 L 600 295 L 640 245 L 640 80 Z',
  },
  {
    id: 'NSW',
    label: 'NSW',
    labelX: 580,
    labelY: 380,
    cx: 580,
    cy: 380,
    path: 'M 490 340 L 490 480 L 610 480 L 650 400 L 640 295 L 600 295 L 455 295 L 455 340 Z',
  },
  {
    id: 'ACT',
    label: 'ACT',
    labelX: 595,
    labelY: 435,
    cx: 595,
    cy: 435,
    path: 'M 575 420 L 575 455 L 620 455 L 620 420 Z',
  },
  {
    id: 'VIC',
    label: 'VIC',
    labelX: 530,
    labelY: 510,
    cx: 530,
    cy: 510,
    path: 'M 460 480 L 460 520 L 610 530 L 650 490 L 610 480 Z',
  },
  {
    id: 'TAS',
    label: 'TAS',
    labelX: 575,
    labelY: 575,
    cx: 575,
    cy: 575,
    path: 'M 545 555 L 545 595 L 610 595 L 610 555 Z',
  },
]

const STATE_COLORS: Record<string, string> = {
  NSW: '#fb923c',
  VIC: '#f97316',
  QLD: '#fdba74',
  WA: '#fed7aa',
  SA: '#fcd34d',
  TAS: '#86efac',
  ACT: '#6ee7b7',
  NT: '#fca5a1',
}

export default function DealsMapPage() {
  const navigate = useNavigate()

  const handleStateClick = (stateId: string) => {
    navigate(`/deals?state=${stateId}`)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Helmet>
        <title>Australian Deals Map | OzVFY</title>
        <meta name="description" content="Browse deals by Australian state. Find the best deals near you in NSW, VIC, QLD, WA, SA, TAS, ACT and NT." />
      </Helmet>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🗺️ Australian Deals Map</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Click a state to browse deals available in your area.</p>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 overflow-x-auto">
        <svg
          viewBox="0 0 680 650"
          className="w-full max-w-lg mx-auto"
          style={{ minWidth: 300 }}
        >
          {STATES.map(state => (
            <g
              key={state.id}
              onClick={() => handleStateClick(state.id)}
              className="cursor-pointer group"
            >
              <path
                d={state.path}
                fill={STATE_COLORS[state.id] || '#e5e7eb'}
                stroke="white"
                strokeWidth="2"
                className="transition-opacity group-hover:opacity-80"
              />
              <text
                x={state.labelX}
                y={state.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold pointer-events-none select-none fill-gray-800"
                fontSize="11"
                fontWeight="700"
              >
                {state.label}
              </text>
              <text
                x={state.labelX}
                y={state.labelY + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs pointer-events-none select-none fill-gray-700"
                fontSize="9"
              >
                {STATE_DEALS[state.id]} deals
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* State grid list */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {Object.entries(STATE_DEALS)
          .sort(([, a], [, b]) => b - a)
          .map(([state, count]) => (
            <button
              key={state}
              onClick={() => handleStateClick(state)}
              className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 px-3 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all"
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-gray-800 mb-1"
                style={{ backgroundColor: STATE_COLORS[state] || '#e5e7eb' }}
              >
                {state}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{count} deals</span>
            </button>
          ))}
      </div>
    </div>
  )
}
