import { useEffect } from 'react';

interface ShortcutHandler {
  key: string;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check for shortcuts
      for (const shortcut of shortcuts) {
        if (matchesShortcut(e, shortcut.key)) {
          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

function matchesShortcut(e: KeyboardEvent, pattern: string): boolean {
  const parts = pattern.toLowerCase().split(' ');
  const modifiers = {
    ctrl: e.ctrlKey || e.metaKey,
    alt: e.altKey,
    shift: e.shiftKey,
  };

  // Simple pattern matching
  if (parts.length === 1) {
    return e.key.toLowerCase() === parts[0];
  }

  // Multi-key shortcuts (e.g., "g d" for "go dashboard")
  // This is a simplified version - you might want more sophisticated matching
  return false;
}

