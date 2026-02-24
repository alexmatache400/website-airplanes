import React from 'react';
import { useThemeMode } from '../hooks/useThemeMode';

/**
 * Shared full-page background with theme-aware image and dark overlay.
 * Used by all page components (Home, Products, Setups, CompleteSetup, AboutUs).
 *
 * Note: backgroundAttachment: 'fixed' is intentionally omitted — it causes
 * severe performance issues on iOS/Android (background repaints on every scroll).
 */
export const PageBackground: React.FC = () => {
  const isLightMode = useThemeMode();

  return (
    <div
      className="fixed inset-0 z-0"
      style={{
        backgroundImage: `url(/backgroundPhoto/${isLightMode ? 'backgrounLight.png' : 'background.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {!isLightMode && <div className="absolute inset-0 bg-dark-900/80"></div>}
    </div>
  );
};
