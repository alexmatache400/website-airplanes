import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * AirplaneAnimation - Lottie animation for Setups page
 *
 * Features:
 * - Loads airplane Lottie animation from /animations/Airplane.json
 * - Infinite loop animation
 * - Pauses when off-screen (IntersectionObserver)
 * - Respects prefers-reduced-motion
 * - Smooth vector animation
 */

const AirplaneAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [animationData, setAnimationData] = useState<any>(null);

  // Load Lottie animation data
  useEffect(() => {
    fetch('/animations/Airplane.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Failed to load airplane animation:', error));
  }, []);

  // Pause animation when off-screen
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldPause = !entry.isIntersecting || entry.intersectionRatio < 0.2;
        setIsPaused(shouldPause);

        // Control Lottie playback
        if (lottieRef.current) {
          if (shouldPause) {
            lottieRef.current.pause();
          } else {
            lottieRef.current.play();
          }
        }
      },
      { threshold: [0, 0.2, 1] }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Loading state
  if (!animationData) {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-40 flex items-center justify-center"
      >
        <div className="text-slate-500 text-sm">Loading animation...</div>
      </div>
    );
  }

  // Static fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-40 flex items-center justify-center overflow-hidden"
      >
        <div className="text-6xl opacity-30">
          ✈️
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-40 overflow-hidden flex items-center justify-center"
      style={{
        contain: 'layout paint style',
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={!isPaused}
        style={{
          width: '100%',
          height: '160px',
          maxWidth: '300px',
        }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid meet',
        }}
      />
    </div>
  );
};

export default AirplaneAnimation;
