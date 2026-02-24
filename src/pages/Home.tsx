import React from 'react';
import HeroDesk from '../components/HeroDesk';
import FeaturedProductsCarousel from '../sections/home/FeaturedProductsCarousel';
import { PageBackground } from '../components/PageBackground';
import { useDocumentHead } from '../hooks/useDocumentHead';

const Home: React.FC = () => {
  useDocumentHead({
    title: 'Pilot Setup — Flight Sim Desk Setups & Hardware Guides',
    description: 'Discover expert flight simulator hardware recommendations, comparisons, and desk setup guides for MSFS 2020/2024 and X-Plane 11/12.',
    canonical: '/',
  });

  return (
    <div className="relative">
      <PageBackground />

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
