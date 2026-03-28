import { useEffect, useRef, useCallback } from 'react';

export interface KeyboardShortcutCallbacks {
  onShortcutsOpen?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  onOpenDeal?: () => void;
  onSaveDeal?: () => void;
  onCompareDeal?: () => void;
}

export function useKeyboardShortcuts(
  callbacksOrOpen?: KeyboardShortcutCallbacks | (() => void)
) {
  const callbacks = useRef<KeyboardShortcutCallbacks>({});

  // Support legacy signature: useKeyboardShortcuts(onShortcutsOpen)
  if (typeof callbacksOrOpen === 'function') {
    callbacks.current = { onShortcutsOpen: callbacksOrOpen };
  } else if (callbacksOrOpen) {
    callbacks.current = callbacksOrOpen;
  }

  const handler = useCallback((e: KeyboardEvent) => {
    // Don't trigger when typing in inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

    switch (e.key) {
      case '/':
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
        break;

      case 'Escape':
        document.querySelector<HTMLButtonElement>('[data-modal-close]')?.click();
        break;

      case '?':
        e.preventDefault();
        callbacks.current.onShortcutsOpen?.();
        break;

      case 'j':
      case 'J':
        e.preventDefault();
        callbacks.current.onNavigateNext?.();
        break;

      case 'k':
      case 'K':
        e.preventDefault();
        callbacks.current.onNavigatePrev?.();
        break;

      case 'o':
      case 'O':
        e.preventDefault();
        callbacks.current.onOpenDeal?.();
        break;

      case 's':
      case 'S':
        e.preventDefault();
        callbacks.current.onSaveDeal?.();
        break;

      case 'c':
      case 'C':
        e.preventDefault();
        callbacks.current.onCompareDeal?.();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
