import { createContext, useContext, useState, ReactNode } from 'react';

const STORAGE_KEY = 'ozvfy_compare_ids';

function loadFromStorage(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, 4).filter((x): x is number => typeof x === 'number');
    }
  } catch { /* noop */ }
  return [];
}

interface CompareContextType {
  compareIds: number[];
  toggleCompare: (id: number) => void;
  clearCompare: () => void;
  isComparing: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextType>({
  compareIds: [],
  toggleCompare: () => {},
  clearCompare: () => {},
  isComparing: () => false,
});

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareIds, setCompareIds] = useState<number[]>(loadFromStorage);

  const persist = (ids: number[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch { /* noop */ }
    setCompareIds(ids);
  };

  const toggleCompare = (id: number) => {
    setCompareIds(prev => {
      const next = prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 4 ? [...prev, id] : prev;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };

  const clearCompare = () => persist([]);
  const isComparing = (id: number) => compareIds.includes(id);

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, clearCompare, isComparing }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
