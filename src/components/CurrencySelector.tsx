import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const CURRENCIES = ['AUD', 'USD', 'GBP', 'EUR', 'NZD'] as const;
export type Currency = typeof CURRENCIES[number];

const STORAGE_KEY = 'ozvfy_currency';

export function getSelectedCurrency(): Currency {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (CURRENCIES.includes(stored as Currency) ? stored : 'AUD') as Currency;
}

export function setSelectedCurrency(c: Currency) {
  localStorage.setItem(STORAGE_KEY, c);
  window.dispatchEvent(new CustomEvent('ozvfy_currency_change', { detail: c }));
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>(getSelectedCurrency);

  useEffect(() => {
    const handler = (e: Event) => setCurrency((e as CustomEvent<Currency>).detail);
    window.addEventListener('ozvfy_currency_change', handler);
    return () => window.removeEventListener('ozvfy_currency_change', handler);
  }, []);

  return currency;
}

const SYMBOLS: Record<Currency, string> = {
  AUD: 'A$', USD: '$', GBP: '£', EUR: '€', NZD: 'NZ$'
};

export function formatPrice(price: number, currency: Currency, originalAud?: number): string {
  const sym = SYMBOLS[currency];
  const formatted = `${sym}${price.toFixed(2)}`;
  if (currency !== 'AUD' && originalAud !== undefined) {
    return `${formatted} (~A$${originalAud.toFixed(2)})`;
  }
  return formatted;
}

export default function CurrencySelector() {
  const [open, setOpen] = useState(false);
  const currency = useCurrency();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors"
        aria-label="Select currency"
      >
        {currency}
        <ChevronDownIcon className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden min-w-[80px]">
          {CURRENCIES.map(c => (
            <button
              key={c}
              onClick={() => { setSelectedCurrency(c); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors ${c === currency ? 'font-bold text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
