import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Carousel images configuration - Easy to add more images!
const CAROUSEL_IMAGES = [
  { src: '/landingPaige/carousel-setups/carousel-image-1.png', alt: 'Professional flight simulator setup 1' },
  { src: '/landingPaige/carousel-setups/carousel-image-2.jpg', alt: 'Professional flight simulator setup 2' },
  { src: '/landingPaige/carousel-setups/carousel-image-3.jpg', alt: 'Professional flight simulator setup 3' },
  { src: '/landingPaige/carousel-setups/carousel-image-4.jpg', alt: 'Professional flight simulator setup 4' },
];

// Fisher-Yates shuffle algorithm for random start order
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const HeroImageCarousel: React.FC = () => {
  // Shuffle images once on mount for random start order
  const [images] = useState(() => shuffleArray(CAROUSEL_IMAGES));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Triple-clone images for seamless infinite loop
  const clonedImages = [...images, ...images, ...images];

  // Auto-advance carousel every 7.5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 7500); // 7.5 seconds pause per image

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  // Seamless loop reset: when reaching end of first clone set, jump to start
  useEffect(() => {
    if (currentIndex === images.length) {
      // Wait for transition to complete, then reset without transition
      const resetTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 800); // Match transition duration

      return () => clearTimeout(resetTimer);
    }
  }, [currentIndex, images.length]);

  // Re-enable transitions after reset
  useEffect(() => {
    if (!isTransitioning && currentIndex === 0) {
      const enableTimer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50); // Small delay to ensure reset happens first

      return () => clearTimeout(enableTimer);
    }
  }, [isTransitioning, currentIndex]);

  // Pause carousel when page is hidden (tab switched, minimized, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Respect prefers-reduced-motion
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    setIsPaused(prefersReducedMotion);
  }, [prefersReducedMotion]);

  // Calculate translateX to center each image
  const translateX = -(currentIndex * (100 / clonedImages.length));

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl">
      {/* Carousel track - scroll with pause at each image */}
      <div
        className="relative w-full h-full flex"
        style={{
          width: `${clonedImages.length * 100}%`,
          transform: `translateX(${translateX}%)`,
          transition: isTransitioning ? 'transform 0.8s ease-in-out' : 'none',
          willChange: 'transform',
        }}
      >
        {/* Render triple-cloned images for seamless infinite loop */}
        {clonedImages.map((image, index) => (
          <div
            key={index}
            className="relative flex-shrink-0"
            style={{ width: `${100 / clonedImages.length}%` }}
          >
            {/* Glass effect container */}
            <div className="glass relative aspect-video w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading={index < images.length ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>

            {/* LED accent dots (animated) - matching the original design */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-pink-400 rounded-full animate-pulse shadow-lg shadow-pink-400/50" style={{ animationDelay: '1.5s' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
