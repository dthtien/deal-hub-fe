import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const KEY = 'ozvfy_dark_mode';

interface DarkModeContextType {
  dark: boolean;
  toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({ dark: false, toggle: () => {} });

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved !== null) return saved === 'true';
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Auto-follow system preference if user hasn't set a manual preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const manualPref = localStorage.getItem(KEY);
      if (manualPref === null) {
        setDark(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    // Smooth transition when toggling dark mode
    document.documentElement.style.transition = 'background-color 0.3s, color 0.3s';
    const timer = setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 300);
    setDark(d => {
      const next = !d;
      localStorage.setItem(KEY, String(next));
      return next;
    });
    return () => clearTimeout(timer);
  };

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);
