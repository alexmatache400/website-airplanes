import { useEffect, useCallback } from 'react';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Hook to trap Tab/Shift+Tab focus within a container element.
 * Wraps focus from last→first and first→last focusable element.
 *
 * Does NOT handle ESC key, focus-on-open, or previous-focus restore
 * (those vary per component and should remain component-specific).
 *
 * @param containerRef - Ref to the container element
 * @param isOpen - Whether the trap is active
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean
): void {
  const handleTab = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [containerRef]);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, handleTab]);
}
