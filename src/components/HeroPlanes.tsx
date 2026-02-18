import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * HeroPlanes - Multi-arc bi-directional airplane animation with dynamic path switching
 *
 * Features:
 * - 6 planes with 10 distinct arcs (5 upward, 5 inverted/downward)
 * - Bi-directional: 3 planes L→R, 3 planes R→L
 * - Direction-aware: planes face the direction they move (rotate in keyframes)
 * - Dynamic path switching: Each plane randomly switches to a new path after completing a lap
 * - GPU-accelerated transform-based animation (works in all browsers)
 * - Pauses when off-screen via IntersectionObserver
 * - Respects prefers-reduced-motion
 */

interface HeroplanesProps {
  className?: string;
  style?: React.CSSProperties;
}

// Configuration: 6 planes with initial paths and directions
const PLANES = [
  { dir: 'ltr' as const },  // Plane 0: L→R
  { dir: 'ltr' as const },  // Plane 1: L→R
  { dir: 'ltr' as const },  // Plane 2: L→R
  { dir: 'rtl' as const },  // Plane 3: R→L
  { dir: 'rtl' as const },  // Plane 4: R→L
  { dir: 'rtl' as const },  // Plane 5: R→L
] as const;

// Total number of paths available (0-9)
const TOTAL_PATHS = 10;

interface PlaneState {
  pathIdx: number;
  verticalOffset: number; // Random offset in vh (-5 to +5)
  animationKey: number; // Force re-render when changed
}

// Helper: Get approximate vertical center of a path
const getPathVerticalCenter = (pathIdx: number, offset: number): number => {
  const pathCenters = [
    75.5, 63, 50, 33.5, 14,  // Paths 0-4 (upward)
    41.5, 30, 58, 68.5, 21.5, // Paths 5-9 (inverted)
  ];
  return pathCenters[pathIdx] + offset;
};

// Helper: Check if two planes would be too close vertically
const wouldCollide = (
  newPathIdx: number,
  newOffset: number,
  currentStates: PlaneState[],
  skipIndex: number
): boolean => {
  const newCenter = getPathVerticalCenter(newPathIdx, newOffset);
  const MIN_SEPARATION = 12; // Minimum vertical separation in vh

  for (let i = 0; i < currentStates.length; i++) {
    if (i === skipIndex) continue;
    const otherCenter = getPathVerticalCenter(
      currentStates[i].pathIdx,
      currentStates[i].verticalOffset
    );
    if (Math.abs(newCenter - otherCenter) < MIN_SEPARATION) {
      return true;
    }
  }
  return false;
};

export const HeroPlanes: React.FC<HeroplanesProps> = ({ className = '', style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [planeStates, setPlaneStates] = useState<PlaneState[]>(() =>
    PLANES.map(() => ({
      pathIdx: Math.floor(Math.random() * TOTAL_PATHS),
      verticalOffset: Math.random() * 10 - 5,
      animationKey: 0,
    }))
  );

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsPaused(entry.intersectionRatio < 0.2)),
      { threshold: [0, 0.2, 1] }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Animation iteration event listeners: Switch to random path with collision avoidance
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleAnimationIteration = (index: number) => {
      setPlaneStates((prev) => {
        const newStates = [...prev];

        // Try to find a safe path (max 20 attempts to avoid infinite loop)
        let attempts = 0;
        let newPath: number;
        let newOffset: number;

        do {
          newPath = Math.floor(Math.random() * TOTAL_PATHS);
          newOffset = Math.random() * 10 - 5; // -5vh to +5vh
          attempts++;

          // After 15 failed attempts, allow any path to prevent stuck state
          if (attempts > 15) break;

        } while (
          (newPath === prev[index].pathIdx && attempts < 5) || // Try different path first
          wouldCollide(newPath, newOffset, prev, index)
        );

        // Update this plane's state with new path, offset, and incremented key
        newStates[index] = {
          pathIdx: newPath,
          verticalOffset: newOffset,
          animationKey: prev[index].animationKey + 1,
        };

        return newStates;
      });
    };

    // Attach event listeners to all plane elements
    const listeners = planeRefs.current.map((planeElement, index) => {
      if (!planeElement) return null;

      const handler = () => handleAnimationIteration(index);
      planeElement.addEventListener('animationiteration', handler);
      return { element: planeElement, handler };
    });

    // Cleanup event listeners
    return () => {
      listeners.forEach((listener) => {
        if (listener) {
          listener.element.removeEventListener('animationiteration', listener.handler);
        }
      });
    };
  }, [prefersReducedMotion]);

  // Static positions for reduced motion (spread across full vertical range)
  const staticPositions = [
    { left: '15%', top: '78%' },  // Very low (matches path 0)
    { left: '25%', top: '68%' },  // Low (matches path 1)
    { left: '40%', top: '58%' },  // Mid-low (matches path 2)
    { left: '55%', top: '45%' },  // Middle (matches path 3)
    { left: '70%', top: '30%' },  // High with dip (matches path 4)
    { left: '85%', top: '14%' },  // Very high (matches path 5)
  ];

  // Fixed duration (all paths approximately same visual speed)
  const duration = 22; // seconds

  // Random starting positions for each plane (seeded for consistency)
  // Each plane gets a random delay for more organic, natural feel
  // Negative delays mean plane starts partway through animation
  const randomDelays = [
    -2.1,   // Plane 0: starts 2.1s into animation
    -14.7,  // Plane 1: starts 14.7s into animation
    -8.9,   // Plane 2: starts 8.9s into animation
    -19.3,  // Plane 3: starts 19.3s into animation
    -4.5,   // Plane 4: starts 4.5s into animation
    -16.8,  // Plane 5: starts 16.8s into animation
  ];

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      {PLANES.map((plane, index) => {
        // Use random delay for organic feel
        const delay = randomDelays[index];

        // Get current state for this plane
        const state = planeStates[index];

        // Get animation name based on current path index AND direction
        // RTL planes use separate keyframes with reversed path and left-pointing rotation
        const animationName = plane.dir === 'rtl'
          ? `fly-path-${state.pathIdx}-rtl`
          : `fly-path-${state.pathIdx}`;

        return (
          <img
            key={`${index}-${state.animationKey}`} // Key changes force animation restart
            ref={(el) => {
              planeRefs.current[index] = el;
            }}
            src="/landingPaige/plane-silhouette.svg"
            alt=""
            className={prefersReducedMotion ? 'hero-plane-static' : 'hero-plane'}
            style={
              prefersReducedMotion
                ? {
                    // Static positioning when motion is reduced
                    left: staticPositions[index].left,
                    top: staticPositions[index].top,
                  }
                : {
                    // Dynamic animation with transform keyframes
                    animation: `${animationName} ${duration}s linear infinite`,
                    animationDelay: `${delay}s`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                    // Apply vertical offset using CSS variable
                    ['--plane-offset-y' as string]: `${state.verticalOffset}vh`,
                  }
            }
          />
        );
      })}
    </div>
  );
};

export default HeroPlanes;
