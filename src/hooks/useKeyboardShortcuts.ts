import { useEffect } from 'react';

export function useKeyboardShortcuts(onShortcutsOpen?: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === '/') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
      if (e.key === 'Escape') {
        document.querySelector<HTMLButtonElement>('[data-modal-close]')?.click();
      }
      if (e.key === '?' && onShortcutsOpen) {
        e.preventDefault();
        onShortcutsOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onShortcutsOpen]);
}
