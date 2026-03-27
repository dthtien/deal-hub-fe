import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-full">
                <ExclamationTriangleIcon className="w-10 h-10 text-rose-500 dark:text-rose-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              An unexpected error occurred. Try reloading the page, or let us know if it keeps happening.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-400 dark:text-gray-600 mb-6 font-mono bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-left overflow-auto">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Reload page
              </button>
              <a
                href="mailto:support@ozvfy.com?subject=Error%20Report"
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Report issue
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
