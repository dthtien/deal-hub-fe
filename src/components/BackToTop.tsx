import { useEffect, useState } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      setVisible(scrollTop > 500);
      setScrollPct(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      title={`Back to top (${scrollPct}% scrolled)`}
      className="fixed bottom-20 right-4 z-50 md:bottom-8 md:right-6 flex flex-col items-center justify-center w-11 h-11 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-full shadow-lg transition-all duration-300 group"
    >
      <ChevronUpIcon className="w-5 h-5" />
      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded px-1 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {scrollPct}%
      </span>
    </button>
  );
}
