import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Animated 500 */}
      <style>{`
        @keyframes errorPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.97); }
        }
        .error-500 { animation: errorPulse 2s ease-in-out infinite; }
      `}</style>
      <div className="text-[8rem] sm:text-[12rem] font-extrabold text-rose-500 leading-none select-none error-500">
        500
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
        Something went wrong
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-sm sm:text-base">
        Our servers are having a moment. We're on it! Please try again in a few seconds.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Go back
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Try again
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
          Browse all deals
        </Link>
      </div>
    </div>
  );
}
