import { useState } from 'react'

const TOKEN_KEY = 'admin_token'

export const useAdminAuth = () => {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) ?? '')

  const saveToken = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
  }

  return { token, saveToken, clearToken, isAuthenticated: !!token }
}
