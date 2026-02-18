import { useEffect } from 'react';

/**
 * Hook to detect clicks outside of specified elements.
 *
 * @param getElements - Function returning the elements to monitor (supports dynamic refs)
 * @param onClickOutside - Callback when a click outside is detected
 * @param active - Whether the listener is active (default: true)
 */
export function useClickOutside(
  getElements: () => (Element | null)[],
  onClickOutside: () => void,
  active: boolean = true
): void {
  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const elements = getElements();
      const isInside = elements.some(el => el?.contains(target));
      if (!isInside) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [getElements, onClickOutside, active]);
}
