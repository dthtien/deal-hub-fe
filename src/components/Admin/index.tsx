import { useState } from 'react'
import { useAdminAuth } from './useAdminAuth'
import AffiliateConfigsAdmin from './AffiliateConfigs'

const AdminLogin = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return setError('Token is required')
    onLogin(token.trim())
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your admin API token</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">⚠️ {error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Token
            </label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Enter token..."
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

const Admin = () => {
  const { token, saveToken, clearToken, isAuthenticated } = useAdminAuth()

  if (!isAuthenticated) {
    return <AdminLogin onLogin={saveToken} />
  }

  return (
    <div>
      {/* Admin nav */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 pb-3 flex items-center justify-between">
        <nav className="flex gap-4">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 pb-3 -mb-3">
            Affiliate Configs
          </span>
        </nav>
        <button
          onClick={clearToken}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Sign out
        </button>
      </div>

      <AffiliateConfigsAdmin
        token={token}
        onUnauthorized={clearToken}
      />
    </div>
  )
}

export default Admin
