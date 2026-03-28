import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const CURRENCIES = ['AUD', 'USD', 'GBP', 'EUR', 'NZD'] as const;
export type Currency = typeof CURRENCIES[number];

const STORAGE_KEY = 'ozvfy_currency';

const RATES: Record<Currency, number> = {
  AUD: 1.0,
  USD: 0.64,
  GBP: 0.51,
  EUR: 0.59,
  NZD: 1.08,
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertPrice: (audPrice: number) => number;
  formatPrice: (audPrice: number) => string;
  rates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'AUD',
  setCurrency: () => {},
  convertPrice: (p) => p,
  formatPrice: (p) => `A$${p.toFixed(2)}`,
  rates: RATES,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (CURRENCIES.includes(stored as Currency) ? stored : 'AUD') as Currency;
    } catch {
      return 'AUD';
    }
  });
  const [rates, setRates] = useState<Record<Currency, number>>(RATES);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/v1/exchange_rates`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.rates) {
          setRates(prev => ({ ...prev, ...data.rates }));
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* noop */ }
    window.dispatchEvent(new CustomEvent('ozvfy_currency_change', { detail: c }));
  };

  const convertPrice = (audPrice: number): number => {
    const rate = rates[currency] ?? 1;
    return audPrice * rate;
  };

  const formatPrice = (audPrice: number): string => {
    const converted = convertPrice(audPrice);
    const symbols: Record<Currency, string> = {
      AUD: 'A$', USD: '$', GBP: '£', EUR: '€', NZD: 'NZ$',
    };
    return `${symbols[currency]}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext() {
  return useContext(CurrencyContext);
}

export { CURRENCIES };
export default CurrencyContext;
