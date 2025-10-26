import { useRef, useEffect, useCallback, useState } from 'react';

interface UseRafMarqueeOptions {
  /**
   * Speed in pixels per second
   * @default 70
   */
  speed?: number;

  /**
   * Whether autoplay is enabled
   * @default true
   */
  autoplay?: boolean;

  /**
   * Callback when a full cycle completes
   */
  onCycleComplete?: () => void;

  /**
   * DOM element reference for the scrolling lane
   */
  laneRef: React.RefObject<HTMLElement>;
}

interface UseRafMarqueeReturn {
  /** Current offset in pixels (negative value, increases leftward) */
  offset: number;

  /** Whether animation is currently playing */
  isPlaying: boolean;

  /** Start/resume animation */
  play: () => void;

  /** Pause animation */
  pause: () => void;

  /** Jump to specific offset */
  setOffset: (offset: number) => void;

  /** Reset offset to 0 */
  reset: () => void;

  /** Set the cycle width for wrapping */
  setCycleWidth: (width: number) => void;

  /** Animate to a target offset with easing */
  animateToOffset: (targetOffset: number, duration?: number) => Promise<void>;
}

/**
 * High-performance marquee animation hook using requestAnimationFrame.
 *
 * Optimizations:
 * - Time-based animation with delta clamping to prevent tab-refocus spikes
 * - GPU-accelerated transforms (translate3d)
 * - Refs-based state to avoid React re-renders on every frame
 * - Sub-pixel accumulation prevention with Math.fround
 * - Smooth easing for manual navigation
 */
export function useRafMarquee({
  speed = 70,
  autoplay = true,
  onCycleComplete,
  laneRef,
}: UseRafMarqueeOptions): UseRafMarqueeReturn {
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [offset, setOffsetState] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const offsetRef = useRef(0);
  const cycleWidthRef = useRef(0);
  const prefersReducedMotion = useRef(false);

  // Animation state for smooth tweening
  const animationStateRef = useRef<{
    isAnimating: boolean;
    startOffset: number;
    targetOffset: number;
    startTime: number;
    duration: number;
    resolve?: () => void;
  } | null>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion.current = mediaQuery.matches;

      const handleChange = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
        if (e.matches && rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
          setIsPlaying(false);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Easing function: easeOutQuad
  const easeOutQuad = useCallback((t: number): number => {
    return t * (2 - t);
  }, []);

  // Update DOM transform (GPU-accelerated)
  const updateTransform = useCallback((offset: number) => {
    if (!laneRef.current) return;

    // Use translate3d for GPU acceleration
    laneRef.current.style.transform = `translate3d(${Math.fround(offset)}px, 0, 0)`;
  }, [laneRef]);

  // Main animation loop
  const tick = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    // Clamp delta time to prevent spikes when tab regains focus
    const dt = Math.min(32, timestamp - lastTimeRef.current);
    lastTimeRef.current = timestamp;

    // Check if we're in a tween animation
    if (animationStateRef.current?.isAnimating) {
      const { startOffset, targetOffset, startTime, duration, resolve } = animationStateRef.current;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutQuad(progress);

      // Interpolate between start and target
      offsetRef.current = startOffset + (targetOffset - startOffset) * easedProgress;

      // Update DOM
      updateTransform(offsetRef.current);
      setOffsetState(offsetRef.current);

      if (progress >= 1) {
        // Animation complete
        animationStateRef.current = null;
        if (resolve) resolve();
      } else {
        // Continue animation
        rafIdRef.current = requestAnimationFrame(tick);
      }
      return;
    }

    // Normal autoplay motion
    if (isPlaying && !prefersReducedMotion.current) {
      // Move leftward (negative direction)
      offsetRef.current -= speed * (dt / 1000);

      // Use Math.fround to prevent sub-pixel accumulation
      offsetRef.current = Math.fround(offsetRef.current);

      // Wrap around when we've scrolled past one full cycle
      if (cycleWidthRef.current > 0 && Math.abs(offsetRef.current) >= cycleWidthRef.current) {
        offsetRef.current += cycleWidthRef.current;
        onCycleComplete?.();
      }

      // Update DOM
      updateTransform(offsetRef.current);
      setOffsetState(offsetRef.current);

      // Continue loop
      rafIdRef.current = requestAnimationFrame(tick);
    }
  }, [speed, isPlaying, onCycleComplete, easeOutQuad, updateTransform]);

  // Start animation
  const play = useCallback(() => {
    if (prefersReducedMotion.current) return;

    if (!isPlaying) {
      setIsPlaying(true);
      lastTimeRef.current = 0;
    }
  }, [isPlaying]);

  // Stop animation
  const pause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }
  }, [isPlaying]);

  // Jump to specific offset
  const setOffset = useCallback((newOffset: number) => {
    // Cancel any ongoing animation
    if (animationStateRef.current?.isAnimating) {
      animationStateRef.current = null;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }

    offsetRef.current = Math.fround(newOffset);
    updateTransform(offsetRef.current);
    setOffsetState(offsetRef.current);
  }, [updateTransform]);

  // Animate to target offset with easing
  const animateToOffset = useCallback((targetOffset: number, duration: number = 250): Promise<void> => {
    return new Promise((resolve) => {
      // Cancel any ongoing animation
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Pause autoplay during manual animation
      const wasPlaying = isPlaying;
      if (wasPlaying) {
        setIsPlaying(false);
      }

      // Set up animation state
      animationStateRef.current = {
        isAnimating: true,
        startOffset: offsetRef.current,
        targetOffset: Math.fround(targetOffset),
        startTime: performance.now(),
        duration,
        resolve: () => {
          resolve();
          // Resume autoplay if it was playing
          if (wasPlaying && autoplay) {
            setTimeout(() => setIsPlaying(true), 2000);
          }
        },
      };

      // Start animation loop
      lastTimeRef.current = 0;
      rafIdRef.current = requestAnimationFrame(tick);
    });
  }, [isPlaying, autoplay, tick]);

  // Reset to start
  const reset = useCallback(() => {
    setOffset(0);
    lastTimeRef.current = 0;
  }, [setOffset]);

  // Set cycle width
  const setCycleWidth = useCallback((width: number) => {
    cycleWidthRef.current = width;
  }, []);

  // Initialize transform on mount
  useEffect(() => {
    updateTransform(0);
  }, [updateTransform]);

  // Start/stop animation based on isPlaying state
  useEffect(() => {
    if (isPlaying && !prefersReducedMotion.current && !animationStateRef.current?.isAnimating) {
      rafIdRef.current = requestAnimationFrame(tick);
    } else if (rafIdRef.current && !animationStateRef.current?.isAnimating) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, tick]);

  // Auto-start if autoplay is enabled
  useEffect(() => {
    if (autoplay && !prefersReducedMotion.current) {
      setIsPlaying(true);
    }
  }, [autoplay]);

  return {
    offset,
    isPlaying,
    play,
    pause,
    setOffset,
    reset,
    setCycleWidth,
    animateToOffset,
  };
}
