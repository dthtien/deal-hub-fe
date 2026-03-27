import { useState, useEffect } from 'react';

export type CountdownState = {
  display: string;
  expired: boolean;
  urgent: boolean; // < 1 hour
};

export function useCountdown(expiresAt: string | null | undefined): CountdownState | null {
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const target = new Date(expiresAt).getTime();

    const calc = () => {
      const diff = target - Date.now();
      if (isNaN(diff)) return null;
      if (diff <= 0) return { display: 'Expired', expired: true, urgent: false };
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => String(n).padStart(2, '0');
      return {
        display: `${pad(h)}:${pad(m)}:${pad(s)}`,
        expired: false,
        urgent: diff < 3600000,
      };
    };

    setState(calc());
    const timer = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return state;
}
