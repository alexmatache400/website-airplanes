import React from 'react';
import HeroDesk from '../components/HeroDesk';
import FeaturedProductsCarousel from '../sections/home/FeaturedProductsCarousel';
import { PageBackground } from '../components/PageBackground';

const Home: React.FC = () => {
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
