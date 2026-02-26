import { useEffect, useState } from 'react'
import { AffiliateConfig, fetchAll, createConfig, updateConfig, deleteConfig } from './api'
import ConfigForm from './ConfigForm'

type Props = {
  token: string
  onUnauthorized: () => void
}

const AffiliateConfigsAdmin = ({ token, onUnauthorized }: Props) => {
  const [configs, setConfigs] = useState<AffiliateConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AffiliateConfig | null>(null)
  const [notice, setNotice] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const flash = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      setConfigs(await fetchAll())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (data: any) => {
    try {
      const created = await createConfig(token, data)
      setConfigs(c => [...c, created])
      setShowForm(false)
      flash('✅ Affiliate config created!')
    } catch (err: any) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
        onUnauthorized()
      }
      throw err
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editing) return
    const updated = await updateConfig(token, editing.id, data)
    setConfigs(c => c.map(x => x.id === updated.id ? updated : x))
    setEditing(null)
    flash('✅ Updated!')
  }

  const handleDelete = async (config: AffiliateConfig) => {
    if (!confirm(`Delete affiliate config for ${config.store}?`)) return
    setDeletingId(config.id)
    try {
      await deleteConfig(token, config.id)
      setConfigs(c => c.filter(x => x.id !== config.id))
      flash('🗑️ Deleted.')
    } finally {
      setDeletingId(null)
    }
  }

  const usedStores = configs.map(c => c.store)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔗 Affiliate Configs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage affiliate tracking params per store. Changes take effect immediately.
          </p>
        </div>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Config
          </button>
        )}
      </div>

      {/* Flash notice */}
      {notice && (
        <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm rounded-lg">
          {notice}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-6 p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">New Affiliate Config</h2>
          <ConfigForm
            usedStores={usedStores}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="mb-6 p-5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Edit — {editing.store}</h2>
          <ConfigForm
            initial={editing}
            usedStores={usedStores}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm animate-pulse">Loading...</div>
      ) : configs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No affiliate configs yet. Add your first one to start earning commissions!
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Param</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Affiliate ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {configs.map(config => (
                <tr key={config.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{config.store}</td>
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                      {config.param_name}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                      {config.param_value}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      config.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {config.active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditing(config); setShowForm(false) }}
                        className="px-3 py-1 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(config)}
                        disabled={deletingId === config.id}
                        className="px-3 py-1 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === config.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AffiliateConfigsAdmin
