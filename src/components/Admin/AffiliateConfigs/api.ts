const BASE = `${import.meta.env.VITE_API_URL}/api/v1/affiliate_configs`

export type AffiliateConfig = {
  id: number
  store: string
  param_name: string
  param_value: string
  active: boolean
  created_at: string
  updated_at: string
}

const headers = (token: string) => ({
  'Content-Type': 'application/json',
  'X-Admin-Token': token,
})

export const fetchAll = async (): Promise<AffiliateConfig[]> => {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error('Failed to fetch')
  const data = await res.json()
  return data.all ?? []
}

export const createConfig = async (token: string, payload: Omit<AffiliateConfig, 'id' | 'created_at' | 'updated_at'>): Promise<AffiliateConfig> => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ affiliate_config: payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.errors?.join(', ') ?? 'Failed to create')
  return data.affiliate_config
}

export const updateConfig = async (token: string, id: number, payload: Partial<AffiliateConfig>): Promise<AffiliateConfig> => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ affiliate_config: payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.errors?.join(', ') ?? 'Failed to update')
  return data.affiliate_config
}

export const deleteConfig = async (token: string, id: number): Promise<void> => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw new Error('Failed to delete')
}
