import { useEffect } from 'react';

export interface KeyboardShortcutsOptions {
  onToggleMic?: () => void;
  onCloseModals?: () => void;
  onToggleHelp?: () => void;
}

export function useKeyboardShortcuts({
  onToggleMic,
  onCloseModals,
  onToggleHelp
}: KeyboardShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (onToggleMic) onToggleMic();
      } else if (e.key === 'Escape') {
        if (onCloseModals) onCloseModals();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onToggleHelp) onToggleHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleMic, onCloseModals, onToggleHelp]);
}
