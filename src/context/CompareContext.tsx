import { createContext, useContext, useState, ReactNode } from 'react';

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
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const toggleCompare = (id: number) => {
    setCompareIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const clearCompare = () => setCompareIds([]);
  const isComparing = (id: number) => compareIds.includes(id);

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, clearCompare, isComparing }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
