import { useState } from 'react'
import { AffiliateConfig } from './api'

const STORES = [
  'Office Works', 'JB Hi-Fi', 'Glue Store', 'Nike',
  'Culture Kings', 'JD Sports', 'Myer', 'The Good Guys',
  'ASOS', 'The Iconic',
]

type FormData = {
  store: string
  param_name: string
  param_value: string
  active: boolean
}

type Props = {
  initial?: AffiliateConfig
  usedStores: string[]
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

const ConfigForm = ({ initial, usedStores, onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<FormData>({
    store: initial?.store ?? '',
    param_name: initial?.param_name ?? '',
    param_value: initial?.param_value ?? '',
    active: initial?.active ?? true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const availableStores = STORES.filter(
    s => !usedStores.includes(s) || s === initial?.store
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Store
        </label>
        <select
          value={form.store}
          onChange={e => setForm(f => ({ ...f, store: e.target.value }))}
          disabled={!!initial}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Select a store...</option>
          {availableStores.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL Param Name
        </label>
        <input
          type="text"
          value={form.param_name}
          onChange={e => setForm(f => ({ ...f, param_name: e.target.value }))}
          placeholder="e.g. aff, ref, partner_id"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">The query parameter appended to the product URL.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Affiliate ID / Value
        </label>
        <input
          type="text"
          value={form.param_value}
          onChange={e => setForm(f => ({ ...f, param_value: e.target.value }))}
          placeholder="e.g. 12345"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Your publisher/affiliate ID from Commission Factory or other network.</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={form.active}
          onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
        />
        <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
          Active (inactive configs won't be used for affiliate links)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : initial ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ConfigForm
