import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AD_CLIENT = 'ca-pub-2132653771890234';

interface AdSlotProps {
  /** Ad unit slot ID from AdSense (Ads > By ad unit). */
  slot: string;
  className?: string;
}

/**
 * Manual AdSense unit for the SPA. Remounts on route change so a fresh ad
 * is requested per page view. Renders nothing in development.
 * Keep units away from "Get Deal" buttons (AdSense accidental-click policy).
 */
export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blocked or script not loaded yet; ignore.
    }
  }, [pathname]);

  if (import.meta.env.DEV) return null;

  return (
    <div key={pathname} className={`my-6 min-h-[100px] ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
