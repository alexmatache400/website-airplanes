import React, { useState, useEffect } from 'react';
import HeroDesk from '../components/HeroDesk';
import FeaturedProductsCarousel from '../sections/home/FeaturedProductsCarousel';

const Home: React.FC = () => {
  // Track theme for conditional background image
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(/backgroundPhoto/${isLightMode ? 'backgrounLight.png' : 'background.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay for better text readability - only in dark mode */}
        {!isLightMode && <div className="absolute inset-0 bg-dark-900/80"></div>}
      </div>

      {/* Content with higher z-index */}
      <div className="relative z-10">
        <HeroDesk />

        {/* Featured Products Carousel */}
        <FeaturedProductsCarousel />
      </div>
    </div>
  );
};

export default Home;
