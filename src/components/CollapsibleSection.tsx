import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CollapsibleSectionProps {
  name: string;
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
}

const CollapsibleSection = ({ name, title, children, defaultCollapsed = false, className = '' }: CollapsibleSectionProps) => {
  const storageKey = `ozvfy_section_${name}_collapsed`;

  const getInitialCollapsed = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) return stored === 'true';
    } catch { /* noop */ }
    return defaultCollapsed;
  };

  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(collapsed ? '0px' : 'none');
  const [transitioning, setTransitioning] = useState(false);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* noop */ }

    if (!transitioning) {
      setTransitioning(true);
      if (next) {
        // Collapsing: set explicit height first, then animate to 0
        const el = contentRef.current;
        if (el) {
          setHeight(`${el.scrollHeight}px`);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setHeight('0px');
            });
          });
        }
      } else {
        // Expanding: animate to scrollHeight then remove explicit height
        const el = contentRef.current;
        if (el) {
          setHeight('0px');
          requestAnimationFrame(() => {
            setHeight(`${el.scrollHeight}px`);
          });
        }
      }
    }
  };

  const onTransitionEnd = () => {
    setTransitioning(false);
    if (!collapsed) setHeight('none');
  };

  // Keep height correct when collapsed is initial state
  useEffect(() => {
    if (collapsed) setHeight('0px');
    else setHeight('none');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-2 px-1 group"
        aria-expanded={!collapsed}
      >
        <span className="font-bold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
          {title}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-400 transition-all duration-200 ${collapsed ? '-rotate-90' : 'rotate-0'}`}
        />
      </button>
      <div
        ref={contentRef}
        style={{ height: height === 'none' ? undefined : height, overflow: 'hidden' }}
        className="transition-all duration-300 ease-in-out"
        onTransitionEnd={onTransitionEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection;
