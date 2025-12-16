import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.key) return;
      const shortcut = shortcuts.find(s => {
        if (!s.key) return false;
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = s.ctrlKey === undefined || s.ctrlKey === event.ctrlKey;
        const shiftMatch = s.shiftKey === undefined || s.shiftKey === event.shiftKey;
        const altMatch = s.altKey === undefined || s.altKey === event.altKey;
        const metaMatch = s.metaKey === undefined || s.metaKey === event.metaKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export function useCommandPalette(onOpen: () => void) {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      action: onOpen,
      description: 'Open command palette',
    },
    {
      key: 'k',
      metaKey: true,
      action: onOpen,
      description: 'Open command palette (Mac)',
    },
  ]);
}
