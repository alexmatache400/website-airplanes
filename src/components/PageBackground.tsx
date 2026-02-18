import React from 'react';
import { useThemeMode } from '../hooks/useThemeMode';

/**
 * Shared full-page background with theme-aware image and dark overlay.
 * Used by all page components (Home, Products, Setups, CompleteSetup, AboutUs).
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
        backgroundAttachment: 'fixed',
      }}
    >
      {!isLightMode && <div className="absolute inset-0 bg-dark-900/80"></div>}
    </div>
  );
};
