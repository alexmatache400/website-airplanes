import React from 'react';
import { Link } from 'react-router-dom';
import { HeroPlanes } from './HeroPlanes';
import { HeroImageCarousel } from './HeroImageCarousel';

const HeroDesk: React.FC = () => {
  const platforms = ['MSFS 2020', 'MSFS 2024', 'X-Plane 11', 'X-Plane 12'];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Remove gradient to show background image */}

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(168, 168, 168, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 168, 168, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Back Plane Layer - Always behind everything */}
      <HeroPlanes className="absolute inset-0 pointer-events-none z-0" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-dark-100">
                  Perfect Pilot
                </span>
                <br />
                <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                  Setups Found
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto lg:mx-0">
                Turn desk into cockpit: discover the best-fit hardware, compare essentials, and follow setup paths built for your sim.
              </p>
            </div>

            {/* Platform Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="glass-light px-3 py-1 text-sm text-dark-200 rounded-full border border-dark-600/30"
                >
                  {platform}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <div>
              <Link
                to="/products"
                className="block w-full text-center bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-950"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Right Column - Carousel of Desk Setup Images */}
          <div className="relative z-30">
            <HeroImageCarousel />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDesk;
