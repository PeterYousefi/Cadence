import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onToggleMic,
  onCloseModals,
  onToggleHelp
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is inside an input, textarea, or contentEditable
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
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
