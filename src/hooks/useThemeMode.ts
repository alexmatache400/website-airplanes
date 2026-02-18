import { useState, useEffect } from 'react';

/**
 * Hook to track the current theme mode (light/dark).
 * Uses a MutationObserver on document.documentElement to detect class changes.
 *
 * @returns true if light mode is active, false for dark mode
 */
export function useThemeMode(): boolean {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isLightMode;
}
