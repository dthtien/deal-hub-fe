import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

type User = { id: number; email: string; first_name?: string; last_name?: string };
type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  savedDeals: Set<number>;
  toggleSave: (productId: number) => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [savedDeals, setSavedDeals] = useState<Set<number>>(new Set());

  const authFetch = (path: string, opts: RequestInit = {}) =>
    fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers }
    });

  useEffect(() => {
    if (!token) return;
    authFetch('/api/v1/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setUser(d.user))
      .catch(() => { localStorage.removeItem('token'); setToken(null); });
  }, [token]);

  useEffect(() => {
    if (!token || !user) return;
    authFetch('/api/v1/saved_deals')
      .then(r => r.json())
      .then(d => setSavedDeals(new Set(d.saved_deals?.map((p: any) => p.id) || [])))
      .catch(() => {});
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await authFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await authFetch('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }) });
    const data = await res.json();
    if (!res.ok) throw new Error((data.errors || [data.error]).join(', '));
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSavedDeals(new Set());
  };

  const toggleSave = async (productId: number) => {
    if (!user) return;
    const isSaved = savedDeals.has(productId);
    if (isSaved) {
      await authFetch(`/api/v1/saved_deals/${productId}`, { method: 'DELETE' });
      setSavedDeals(prev => { const s = new Set(prev); s.delete(productId); return s; });
    } else {
      await authFetch('/api/v1/saved_deals', { method: 'POST', body: JSON.stringify({ product_id: productId }) });
      setSavedDeals(prev => new Set(prev).add(productId));
    }
  };

  return <AuthContext.Provider value={{ user, token, login, signup, logout, savedDeals, toggleSave }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
